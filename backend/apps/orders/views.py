from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdministrador, IsCozinha, IsGarcom
from apps.restaurants.mixins import RestaurantFromSlugMixin, RestaurantScopedQuerysetMixin
from apps.tables.models import Table
from apps.tables.serializers import TableSerializer

from . import services, statuses
from .models import Order
from .serializers import (
    OnlineOrderCreateSerializer,
    OrderItemsReplaceSerializer,
    OrderSerializer,
    OrderTrackSerializer,
    PresencialOrderCreateSerializer,
)

# --- Cliente (sem login) ---


class OnlineOrderCreateView(RestaurantFromSlugMixin, APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, slug):
        serializer = OnlineOrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = services.create_online_order(self.get_restaurant(), serializer.validated_data)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderTrackView(RetrieveAPIView):
    serializer_class = OrderTrackSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "tracking_token"
    lookup_url_kwarg = "tracking_token"
    queryset = Order.objects.all()


# --- Garçom ---


class PresencialOrderCreateView(APIView):
    permission_classes = [IsGarcom]

    def post(self, request):
        serializer = PresencialOrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = services.create_presencial_order(request.user, serializer.validated_data)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderItemsUpdateView(APIView):
    permission_classes = [IsGarcom]

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk, restaurant_id=request.user.restaurant_id)
        if order.current_status.code != statuses.PEDIDO_RECEBIDO:
            raise ValidationError("Só é possível editar itens antes de enviar para a cozinha.")
        serializer = OrderItemsReplaceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = services.replace_items(order, serializer.validated_data["items"])
        return Response(OrderSerializer(order).data)


class SendToKitchenView(APIView):
    permission_classes = [IsGarcom]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, restaurant_id=request.user.restaurant_id)
        order = services.transition_status(order, statuses.NA_FILA, changed_by=request.user)
        return Response(OrderSerializer(order).data)


# --- Cozinha ---


class OrderQueueView(RestaurantScopedQuerysetMixin, ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsCozinha]
    queryset = Order.objects.filter(
        current_status__code__in=[statuses.NA_FILA, statuses.EM_PREPARACAO]
    )


def _serialize_kitchen_queue(restaurant) -> list[dict]:
    return [
        {
            "table": TableSerializer(entry["table"]).data,
            "status": entry["status"],
            "total": str(entry["total"]),
            "waiting_since": entry["waiting_since"],
            "orders": OrderSerializer(entry["orders"], many=True).data,
        }
        for entry in services.kitchen_queue(restaurant)
    ]


class KitchenQueueView(APIView):
    """Fila da cozinha agrupada por mesa."""

    permission_classes = [IsCozinha]

    def get(self, request):
        return Response(_serialize_kitchen_queue(request.user.restaurant))


class KitchenTableStatusView(APIView):
    permission_classes = [IsCozinha]

    def post(self, request, table_id):
        table = get_object_or_404(
            Table, pk=table_id, restaurant_id=request.user.restaurant_id
        )
        try:
            services.set_kitchen_status(request.user, table, request.data.get("status", ""))
        except services.InvalidTransitionError as exc:
            raise ValidationError(str(exc)) from exc
        # Devolve a fila já atualizada para a tela da cozinha não precisar de
        # uma segunda requisição para se redesenhar.
        return Response(_serialize_kitchen_queue(request.user.restaurant))


class AdvanceStatusView(APIView):
    permission_classes = [IsCozinha]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, restaurant_id=request.user.restaurant_id)
        target = services.next_status_code(order)
        if target is None:
            raise ValidationError("Pedido já está em um status final.")
        order = services.transition_status(order, target, changed_by=request.user)
        return Response(OrderSerializer(order).data)


# --- Administrador ---


class OrderViewSet(RestaurantScopedQuerysetMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAdministrador]
    queryset = Order.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        status_code = self.request.query_params.get("status")
        if status_code:
            queryset = queryset.filter(current_status__code=status_code)
        order_type = self.request.query_params.get("type")
        if order_type:
            queryset = queryset.filter(order_type=order_type)
        return queryset


class CancelOrderView(APIView):
    permission_classes = [IsAdministrador]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, restaurant_id=request.user.restaurant_id)
        order = services.transition_status(order, statuses.CANCELADO, changed_by=request.user)
        return Response(OrderSerializer(order).data)
