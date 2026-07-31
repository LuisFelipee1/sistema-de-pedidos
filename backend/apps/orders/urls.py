from django.urls import path

from .views import (
    AdvanceStatusView,
    CancelOrderView,
    OrderItemsUpdateView,
    OrderQueueView,
    OrderTrackView,
    OrderViewSet,
    PresencialOrderCreateView,
    SendToKitchenView,
)

order_list = OrderViewSet.as_view({"get": "list"})
order_detail = OrderViewSet.as_view({"get": "retrieve"})

urlpatterns = [
    path("orders/presencial/", PresencialOrderCreateView.as_view(), name="order-presencial-create"),
    path("orders/queue/", OrderQueueView.as_view(), name="order-queue"),
    path("orders/track/<uuid:tracking_token>/", OrderTrackView.as_view(), name="order-track"),
    path("orders/<int:pk>/items/", OrderItemsUpdateView.as_view(), name="order-items-update"),
    path(
        "orders/<int:pk>/send-to-kitchen/",
        SendToKitchenView.as_view(),
        name="order-send-to-kitchen",
    ),
    path(
        "orders/<int:pk>/advance-status/",
        AdvanceStatusView.as_view(),
        name="order-advance-status",
    ),
    path("orders/<int:pk>/cancel/", CancelOrderView.as_view(), name="order-cancel"),
    path("orders/<int:pk>/", order_detail, name="order-detail"),
    path("orders/", order_list, name="order-list"),
]
