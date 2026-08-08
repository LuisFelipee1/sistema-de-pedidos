from django.shortcuts import get_object_or_404
from rest_framework import permissions, viewsets
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdministrador, IsRestaurantStaff
from apps.restaurants.mixins import RestaurantFromSlugMixin, RestaurantScopedQuerysetMixin

from . import services
from .models import AddonGroup, AddonOption, Category, Product
from .serializers import (
    AddonGroupSerializer,
    AddonGroupsReplaceSerializer,
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


class StaffReadsAdminWritesMixin:
    """Qualquer funcionário precisa consultar o cardápio para montar um pedido,
    mas só o administrador pode alterá-lo."""

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsRestaurantStaff()]
        return [IsAdministrador()]


class CategoryViewSet(
    StaffReadsAdminWritesMixin, RestaurantScopedQuerysetMixin, viewsets.ModelViewSet
):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()


class ProductViewSet(
    StaffReadsAdminWritesMixin, RestaurantScopedQuerysetMixin, viewsets.ModelViewSet
):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()


class ProductAddonGroupsView(APIView):
    """Substitui todas as perguntas do produto de uma vez."""

    permission_classes = [IsAdministrador]

    def put(self, request, pk):
        product = get_object_or_404(
            Product, pk=pk, restaurant_id=request.user.restaurant_id
        )
        serializer = AddonGroupsReplaceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.replace_addon_groups(product, serializer.validated_data["groups"])
        product.refresh_from_db()
        return Response(ProductSerializer(product, context={"request": request}).data)


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
