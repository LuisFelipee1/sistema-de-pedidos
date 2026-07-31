from urllib.parse import urlencode

from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdministrador
from apps.orders.models import Order
from apps.restaurants.mixins import RestaurantFromSlugMixin

from . import services
from .models import RestaurantPaymentAccount
from .serializers import PaymentAccountSerializer


class CheckoutView(RestaurantFromSlugMixin, APIView):
    """Cria a cobrança no Mercado Pago pro pedido — ver nota em services.create_checkout."""

    permission_classes = [permissions.AllowAny]

    def post(self, request, slug, pk):
        order = get_object_or_404(Order, pk=pk, restaurant=self.get_restaurant())
        checkout_data = services.create_checkout(order)
        return Response(checkout_data)


class MercadoPagoWebhookView(APIView):
    """Endpoint público chamado pelo Mercado Pago. Idempotente por payment_id
    (ver apps.payments.services.process_webhook_notification)."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payment_id = request.data.get("data", {}).get("id") or request.query_params.get("id")
        if not payment_id:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        services.process_webhook_notification(payment_id)
        return Response(status=status.HTTP_200_OK)


class PaymentAccountView(APIView):
    permission_classes = [IsAdministrador]

    def get(self, request):
        account = RestaurantPaymentAccount.objects.filter(
            restaurant_id=request.user.restaurant_id
        ).first()
        if not account:
            return Response({"connected": False})
        return Response(PaymentAccountSerializer(account).data)


class PaymentAccountConnectView(APIView):
    """Devolve a URL de autorização OAuth do Mercado Pago — o callback que
    troca o code pelo access_token ainda precisa ser implementado quando
    houver app registrado no Mercado Pago Developers."""

    permission_classes = [IsAdministrador]

    def post(self, request):
        params = {
            "client_id": settings.MERCADO_PAGO_CLIENT_ID,
            "response_type": "code",
            "platform_id": "mp",
            "redirect_uri": settings.MERCADO_PAGO_OAUTH_REDIRECT_URI,
        }
        return Response(
            {"authorization_url": f"https://auth.mercadopago.com/authorization?{urlencode(params)}"}
        )
