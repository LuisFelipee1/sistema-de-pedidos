from django.urls import path

from .views import CheckoutView

urlpatterns = [
    path("orders/<int:pk>/checkout/", CheckoutView.as_view(), name="order-checkout"),
]
