from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AddonGroupViewSet,
    AddonOptionViewSet,
    CategoryViewSet,
    ProductAddonGroupsView,
    ProductViewSet,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")
router.register("addon-groups", AddonGroupViewSet, basename="addon-group")
router.register("addon-options", AddonOptionViewSet, basename="addon-option")

urlpatterns = [
    path(
        "products/<int:pk>/addon-groups/",
        ProductAddonGroupsView.as_view(),
        name="product-addon-groups",
    ),
    *router.urls,
]
