from django.shortcuts import get_object_or_404

from .models import Restaurant


class RestaurantScopedQuerysetMixin:
    """Isola queryset e create() pelo restaurante do usuário autenticado (rotas de staff)."""

    def get_queryset(self):
        return super().get_queryset().filter(restaurant_id=self.request.user.restaurant_id)

    def perform_create(self, serializer):
        serializer.save(restaurant_id=self.request.user.restaurant_id)


class RestaurantFromSlugMixin:
    """Resolve o restaurante a partir do slug na URL (rotas públicas, sem login)."""

    kwargs: dict[str, str]

    def get_restaurant(self) -> Restaurant:
        return get_object_or_404(Restaurant, slug=self.kwargs["slug"], is_active=True)
