from django.urls import path

from .views import MercadoPagoWebhookView, PaymentAccountConnectView, PaymentAccountView

urlpatterns = [
    path("payment-account/", PaymentAccountView.as_view(), name="payment-account"),
    path(
        "payment-account/connect/",
        PaymentAccountConnectView.as_view(),
        name="payment-account-connect",
    ),
    path(
        "payments/webhook/mercadopago/",
        MercadoPagoWebhookView.as_view(),
        name="mercadopago-webhook",
    ),
]
