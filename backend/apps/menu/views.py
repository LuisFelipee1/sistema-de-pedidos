from rest_framework import permissions, viewsets
from rest_framework.generics import ListAPIView, RetrieveAPIView

from apps.accounts.permissions import IsAdministrador
from apps.restaurants.mixins import RestaurantFromSlugMixin, RestaurantScopedQuerysetMixin

from .models import AddonGroup, AddonOption, Category, Product
from .serializers import (
    AddonGroupSerializer,
    AddonOptionSerializer,
    CategorySerializer,
    ProductSerializer,
)

# --- Público (cardápio, escopado por slug do restaurante) ---


class PublicCategoryListView(RestaurantFromSlugMixin, ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Category.objects.filter(restaurant=self.get_restaurant(), is_active=True)


class PublicProductListView(RestaurantFromSlugMixin, ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(restaurant=self.get_restaurant(), is_available=True)
        category_id = self.request.query_params.get("category")
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset


class PublicProductDetailView(RestaurantFromSlugMixin, RetrieveAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Product.objects.filter(restaurant=self.get_restaurant(), is_available=True)


# --- Administração (staff autenticado) ---


class CategoryViewSet(RestaurantScopedQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAdministrador]
    queryset = Category.objects.all()


class ProductViewSet(RestaurantScopedQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAdministrador]
    queryset = Product.objects.all()


class AddonGroupViewSet(viewsets.ModelViewSet):
    serializer_class = AddonGroupSerializer
    permission_classes = [IsAdministrador]

    def get_queryset(self):
        return AddonGroup.objects.filter(product__restaurant_id=self.request.user.restaurant_id)


class AddonOptionViewSet(viewsets.ModelViewSet):
    serializer_class = AddonOptionSerializer
    permission_classes = [IsAdministrador]

    def get_queryset(self):
        return AddonOption.objects.filter(
            addon_group__product__restaurant_id=self.request.user.restaurant_id
        )
