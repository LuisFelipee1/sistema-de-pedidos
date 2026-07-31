from django.contrib import admin

from .models import Order, OrderItem, OrderItemAddon, OrderStatus, OrderStatusHistory


class OrderItemAddonInline(admin.TabularInline):
    model = OrderItemAddon
    extra = 0


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    show_change_link = True


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ("status", "changed_by", "changed_at")
    can_delete = False


@admin.register(OrderStatus)
class OrderStatusAdmin(admin.ModelAdmin):
    list_display = ("label", "code", "sort_order")
    ordering = ("sort_order",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "restaurant",
        "order_type",
        "table",
        "current_status",
        "total_amount",
        "created_at",
    )
    list_filter = ("restaurant", "order_type", "current_status")
    search_fields = ("id", "customer_name", "tracking_token")
    inlines = [OrderItemInline, OrderStatusHistoryInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product_name_snapshot", "quantity", "unit_price_snapshot")
    inlines = [OrderItemAddonInline]
