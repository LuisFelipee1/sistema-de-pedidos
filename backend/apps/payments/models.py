from django.db import models


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendente"
        APPROVED = "approved", "Aprovado"
        REJECTED = "rejected", "Rejeitado"
        REFUNDED = "refunded", "Reembolsado"

    class Method(models.TextChoices):
        PIX = "pix", "PIX"
        CREDIT_CARD = "credit_card", "Cartão de crédito"
        DEBIT_CARD = "debit_card", "Cartão de débito"

    order = models.ForeignKey("orders.Order", on_delete=models.CASCADE, related_name="payments")
    restaurant = models.ForeignKey(
        "restaurants.Restaurant", on_delete=models.CASCADE, related_name="payments"
    )
    mercado_pago_payment_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)
    method = models.CharField(max_length=15, choices=Method.choices)
    amount = models.DecimalField(max_digits=9, decimal_places=2)
    raw_webhook_payload = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Pagamento {self.mercado_pago_payment_id}"


class RestaurantPaymentAccount(models.Model):
    """access_token em texto puro — trocar por armazenamento cifrado antes de produção."""

    restaurant = models.OneToOneField(
        "restaurants.Restaurant", on_delete=models.CASCADE, related_name="payment_account"
    )
    mercado_pago_user_id = models.CharField(max_length=100, blank=True)
    access_token = models.CharField(max_length=255, blank=True)
    connected_at = models.DateTimeField(null=True, blank=True)

    def __str__(self) -> str:
        return f"Conta MP - {self.restaurant}"
