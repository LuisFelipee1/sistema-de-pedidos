from django.urls import path

from .views import PublicCategoryListView, PublicProductDetailView, PublicProductListView

urlpatterns = [
    path("categories/", PublicCategoryListView.as_view(), name="public-categories"),
    path("products/", PublicProductListView.as_view(), name="public-products"),
    path("products/<int:pk>/", PublicProductDetailView.as_view(), name="public-product-detail"),
]
