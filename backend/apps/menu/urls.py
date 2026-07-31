from rest_framework.routers import DefaultRouter

from .views import AddonGroupViewSet, AddonOptionViewSet, CategoryViewSet, ProductViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")
router.register("addon-groups", AddonGroupViewSet, basename="addon-group")
router.register("addon-options", AddonOptionViewSet, basename="addon-option")

urlpatterns = router.urls
