from rest_framework import permissions, viewsets
from rest_framework.generics import RetrieveAPIView, UpdateAPIView

from apps.accounts.permissions import IsAdministrador, IsRestaurantStaff
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


class PublicTableDetailView(RestaurantFromSlugMixin, RetrieveAPIView):
    serializer_class = PublicTableSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "number"

    def get_queryset(self):
        return Table.objects.filter(restaurant=self.get_restaurant())
