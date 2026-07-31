from django.urls import path

from .views import OnlineOrderCreateView

urlpatterns = [
    path("orders/", OnlineOrderCreateView.as_view(), name="public-order-create"),
]
