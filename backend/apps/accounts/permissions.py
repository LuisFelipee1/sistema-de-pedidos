from rest_framework.permissions import BasePermission


class IsRestaurantStaff(BasePermission):
    message = "Requer conta de funcionário vinculada a um restaurante."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and user.restaurant_id)


class IsAdministrador(IsRestaurantStaff):
    def has_permission(self, request, view) -> bool:
        return super().has_permission(request, view) and request.user.has_role("administrador")


class IsGarcom(IsRestaurantStaff):
    def has_permission(self, request, view) -> bool:
        return super().has_permission(request, view) and request.user.has_role("garcom")


class IsCozinha(IsRestaurantStaff):
    def has_permission(self, request, view) -> bool:
        return super().has_permission(request, view) and request.user.has_role("cozinha")
