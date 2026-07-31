from django.contrib import admin

from .models import Payment, RestaurantPaymentAccount


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "mercado_pago_payment_id",
        "order",
        "restaurant",
        "status",
        "method",
        "amount",
        "created_at",
    )
    list_filter = ("restaurant", "status", "method")
    search_fields = ("mercado_pago_payment_id",)
    readonly_fields = ("raw_webhook_payload",)


@admin.register(RestaurantPaymentAccount)
class RestaurantPaymentAccountAdmin(admin.ModelAdmin):
    list_display = ("restaurant", "mercado_pago_user_id", "connected_at")
