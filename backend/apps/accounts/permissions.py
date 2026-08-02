from rest_framework.permissions import BasePermission

ADMINISTRADOR = "administrador"


class IsRestaurantStaff(BasePermission):
    message = "Requer conta de funcionário vinculada a um restaurante."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and user.restaurant_id)


class IsAdministrador(IsRestaurantStaff):
    def has_permission(self, request, view) -> bool:
        return super().has_permission(request, view) and request.user.has_role(ADMINISTRADOR)


class _RoleOrAdministrador(IsRestaurantStaff):
    """O administrador enxerga e faz tudo que os demais cargos fazem, então
    qualquer permissão de cargo também aceita quem tem o cargo de administrador."""

    role_code: str

    def has_permission(self, request, view) -> bool:
        if not super().has_permission(request, view):
            return False
        return request.user.has_role(self.role_code) or request.user.has_role(ADMINISTRADOR)


class IsGarcom(_RoleOrAdministrador):
    role_code = "garcom"


class IsCozinha(_RoleOrAdministrador):
    role_code = "cozinha"
