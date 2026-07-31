import mercadopago
from django.conf import settings

from apps.orders import services as order_services
from apps.orders import statuses as order_statuses
from apps.orders.models import Order

from .models import Payment, RestaurantPaymentAccount


def _client_for(restaurant) -> mercadopago.SDK:
    account = RestaurantPaymentAccount.objects.filter(restaurant=restaurant).first()
    access_token = (
        account.access_token
        if account and account.access_token
        else settings.MERCADO_PAGO_ACCESS_TOKEN
    )
    return mercadopago.SDK(access_token)


def create_checkout(order: Order) -> dict:
    """Cria a preferência de pagamento no Mercado Pago pro pedido.

    Requer credenciais reais (MERCADO_PAGO_ACCESS_TOKEN ou conta conectada
    do restaurante) para funcionar de fato — ainda não testado ponta a
    ponta por falta de conta de desenvolvedor configurada.
    """
    sdk = _client_for(order.restaurant)
    preference_data = {
        "items": [
            {
                "title": f"Pedido #{order.id}",
                "quantity": 1,
                "unit_price": float(order.total_amount),
                "currency_id": "BRL",
            }
        ],
        "external_reference": str(order.tracking_token),
        "notification_url": settings.MERCADO_PAGO_WEBHOOK_URL,
    }
    result = sdk.preference().create(preference_data)
    return result["response"]


def process_webhook_notification(payment_id: str) -> Payment | None:
    """Idempotente: mercado_pago_payment_id é unique, então reprocessar o
    mesmo evento apenas atualiza a mesma linha em vez de duplicar."""
    sdk = mercadopago.SDK(settings.MERCADO_PAGO_ACCESS_TOKEN)
    result = sdk.payment().get(payment_id)
    payment_data = result.get("response")
    if not payment_data:
        return None

    order = Order.objects.filter(tracking_token=payment_data.get("external_reference")).first()
    if order is None:
        return None

    payment, _ = Payment.objects.update_or_create(
        mercado_pago_payment_id=str(payment_data["id"]),
        defaults={
            "order": order,
            "restaurant": order.restaurant,
            "status": _map_status(payment_data["status"]),
            "method": _map_method(payment_data.get("payment_method_id", "")),
            "amount": payment_data["transaction_amount"],
            "raw_webhook_payload": payment_data,
        },
    )

    if (
        payment.status == Payment.Status.APPROVED
        and order.current_status.code == order_statuses.AGUARDANDO_PAGAMENTO
    ):
        order_services.transition_status(order, order_statuses.PAGAMENTO_APROVADO)
        order_services.transition_status(order, order_statuses.PEDIDO_RECEBIDO)
        order_services.transition_status(order, order_statuses.NA_FILA)

    return payment


def _map_status(mp_status: str) -> str:
    return {
        "approved": Payment.Status.APPROVED,
        "rejected": Payment.Status.REJECTED,
        "refunded": Payment.Status.REFUNDED,
    }.get(mp_status, Payment.Status.PENDING)


def _map_method(mp_method: str) -> str:
    if mp_method == "pix":
        return Payment.Method.PIX
    if mp_method in ("debit_card", "debvisa", "debmaster"):
        return Payment.Method.DEBIT_CARD
    return Payment.Method.CREDIT_CARD
