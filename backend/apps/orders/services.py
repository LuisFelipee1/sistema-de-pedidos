from decimal import Decimal

from django.db import transaction
from django.shortcuts import get_object_or_404

from apps.menu.models import AddonOption, Product
from apps.tables.models import Table

from . import statuses
from .models import Order, OrderItem, OrderItemAddon, OrderStatus


class InvalidTransitionError(Exception):
    pass


def _status(code: str) -> OrderStatus:
    return OrderStatus.objects.get(code=code)


def _build_items(order: Order, items_data: list[dict]) -> Decimal:
    total = Decimal("0")
    for item_data in items_data:
        product = get_object_or_404(
            Product, pk=item_data["product_id"], restaurant=order.restaurant
        )
        quantity = item_data.get("quantity", 1)
        order_item = OrderItem.objects.create(
            order=order,
            product=product,
            product_name_snapshot=product.name,
            unit_price_snapshot=product.price,
            quantity=quantity,
            notes=item_data.get("notes", ""),
        )
        item_total = product.price * quantity
        for addon_option_id in item_data.get("addon_option_ids", []):
            addon_option = get_object_or_404(
                AddonOption, pk=addon_option_id, addon_group__product=product
            )
            OrderItemAddon.objects.create(
                order_item=order_item,
                addon_option=addon_option,
                addon_name_snapshot=addon_option.name,
                price_delta_snapshot=addon_option.price_delta,
            )
            item_total += addon_option.price_delta * quantity
        total += item_total
    return total


@transaction.atomic
def create_online_order(restaurant, data: dict) -> Order:
    table = None
    if data.get("table_number"):
        table = Table.objects.filter(restaurant=restaurant, number=data["table_number"]).first()
    order = Order.objects.create(
        restaurant=restaurant,
        table=table,
        order_type=Order.OrderType.ONLINE,
        current_status=_status(statuses.AGUARDANDO_PAGAMENTO),
        customer_name=data.get("customer_name", ""),
        notes=data.get("notes", ""),
    )
    order.total_amount = _build_items(order, data["items"])
    order.save(update_fields=["total_amount"])
    return order


@transaction.atomic
def create_presencial_order(user, data: dict) -> Order:
    table = get_object_or_404(Table, pk=data["table_id"], restaurant=user.restaurant)
    order = Order.objects.create(
        restaurant=user.restaurant,
        table=table,
        created_by=user,
        order_type=Order.OrderType.PRESENCIAL,
        current_status=_status(statuses.PEDIDO_RECEBIDO),
        notes=data.get("notes", ""),
    )
    order.total_amount = _build_items(order, data["items"])
    order.save(update_fields=["total_amount"])
    return order


@transaction.atomic
def replace_items(order: Order, items_data: list[dict]) -> Order:
    order.items.all().delete()
    order.total_amount = _build_items(order, items_data)
    order.save(update_fields=["total_amount"])
    return order


@transaction.atomic
def transition_status(order: Order, new_status_code: str, changed_by=None) -> Order:
    current_code = order.current_status.code
    allowed = statuses.ALLOWED_TRANSITIONS.get(current_code, set())
    if new_status_code not in allowed:
        raise InvalidTransitionError(
            f"Não é possível ir de '{current_code}' para '{new_status_code}'."
        )
    new_status = _status(new_status_code)
    order.current_status = new_status
    order.save(update_fields=["current_status", "updated_at"])
    order.status_history.create(status=new_status, changed_by=changed_by)
    return order


def next_status_code(order: Order) -> str | None:
    current_code = order.current_status.code
    forward = statuses.ALLOWED_TRANSITIONS.get(current_code, set()) - {statuses.CANCELADO}
    if not forward:
        return None
    return next(iter(forward))
