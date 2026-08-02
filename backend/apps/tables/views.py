from django.shortcuts import get_object_or_404
from rest_framework import permissions, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.generics import RetrieveAPIView, UpdateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdministrador, IsRestaurantStaff
from apps.orders import services as order_services
from apps.orders.serializers import OrderSerializer
from apps.restaurants.mixins import RestaurantFromSlugMixin, RestaurantScopedQuerysetMixin

from .models import Table
from .serializers import PublicTableSerializer, TableSerializer, TableStatusSerializer


class TableViewSet(RestaurantScopedQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = TableSerializer
    queryset = Table.objects.all()

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsRestaurantStaff()]
        return [IsAdministrador()]


class TableStatusUpdateView(RestaurantScopedQuerysetMixin, UpdateAPIView):
    """O garçom muda a mesa de livre/ocupada/desativada direto do salão, sem
    precisar da permissão de administrador que o CRUD completo exige."""

    serializer_class = TableStatusSerializer
    permission_classes = [IsRestaurantStaff]
    queryset = Table.objects.all()


class TableAccountView(APIView):
    """Conta aberta da mesa — o que o garçom vê antes de confirmar o fechamento."""

    permission_classes = [IsRestaurantStaff]

    def get_table(self, pk) -> Table:
        return get_object_or_404(Table, pk=pk, restaurant_id=self.request.user.restaurant_id)

    def get(self, request, pk):
        table = self.get_table(pk)
        orders = order_services.open_orders_for_table(table)
        return Response(
            {
                "table": table.id,
                # String como o resto da API faz com dinheiro, para o JSON não
                # transformar o Decimal em float pelo caminho.
                "total": str(order_services.table_account_total(table)),
                "orders": OrderSerializer(orders, many=True).data,
            }
        )

    def post(self, request, pk):
        table = self.get_table(pk)
        if table.status != Table.Status.OCUPADA:
            raise ValidationError("Só é possível fechar a conta de uma mesa ocupada.")
        result = order_services.close_table_account(request.user, table)
        return Response(
            {
                "table": TableSerializer(table).data,
                "orders_closed": result["orders_closed"],
                "total": str(result["total"]),
            }
        )


class PublicTableDetailView(RestaurantFromSlugMixin, RetrieveAPIView):
    serializer_class = PublicTableSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "number"

    def get_queryset(self):
        return Table.objects.filter(restaurant=self.get_restaurant())
