from rest_framework import permissions
from rest_framework.generics import RetrieveAPIView, RetrieveUpdateAPIView

from apps.accounts.permissions import IsAdministrador

from .models import Restaurant
from .serializers import PublicRestaurantSerializer, RestaurantSerializer


class PublicRestaurantDetailView(RetrieveAPIView):
    """Cabeçalho da vitrine — aberto, é o cliente final que acessa."""

    serializer_class = PublicRestaurantSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"
    queryset = Restaurant.objects.filter(is_active=True)


class MyRestaurantView(RetrieveUpdateAPIView):
    """Dados do próprio restaurante, para a tela de configurações do dono."""

    serializer_class = RestaurantSerializer
    permission_classes = [IsAdministrador]

    def get_object(self) -> Restaurant:
        return Restaurant.objects.get(pk=self.request.user.restaurant_id)
