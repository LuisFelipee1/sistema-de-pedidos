import uuid

from django.conf import settings
from django.db import models


class OrderStatus(models.Model):
    code = models.SlugField(max_length=40, unique=True)
    label = models.CharField(max_length=60)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]
        verbose_name_plural = "order statuses"

    def __str__(self) -> str:
        return self.label


class Order(models.Model):
    class OrderType(models.TextChoices):
        ONLINE = "online", "Online"
        PRESENCIAL = "presencial", "Presencial"

    restaurant = models.ForeignKey(
        "restaurants.Restaurant", on_delete=models.CASCADE, related_name="orders"
    )
    table = models.ForeignKey(
        "tables.Table", on_delete=models.SET_NULL, related_name="orders", null=True, blank=True
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="orders_created",
        null=True,
        blank=True,
    )
    current_status = models.ForeignKey(OrderStatus, on_delete=models.PROTECT, related_name="orders")
    order_type = models.CharField(max_length=15, choices=OrderType.choices)
    customer_name = models.CharField(max_length=150, blank=True)
    total_amount = models.DecimalField(max_digits=9, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    tracking_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Pedido #{self.pk}"


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="status_history")
    status = models.ForeignKey(
        OrderStatus, on_delete=models.PROTECT, related_name="history_entries"
    )
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="order_status_changes",
        null=True,
        blank=True,
    )
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["changed_at"]
        verbose_name_plural = "order status histories"

    def __str__(self) -> str:
        return f"{self.order} -> {self.status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        "menu.Product", on_delete=models.PROTECT, related_name="order_items"
    )
    product_name_snapshot = models.CharField(max_length=150)
    unit_price_snapshot = models.DecimalField(max_digits=8, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    notes = models.TextField(blank=True)

    def __str__(self) -> str:
        return f"{self.quantity}x {self.product_name_snapshot}"


class OrderItemAddon(models.Model):
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name="addons")
    addon_option = models.ForeignKey(
        "menu.AddonOption", on_delete=models.PROTECT, related_name="order_item_addons"
    )
    addon_name_snapshot = models.CharField(max_length=100)
    price_delta_snapshot = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    def __str__(self) -> str:
        return self.addon_name_snapshot
