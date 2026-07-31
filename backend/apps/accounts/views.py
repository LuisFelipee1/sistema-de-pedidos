from django.db import transaction
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.restaurants.models import Restaurant

from .models import Role, User
from .permissions import IsAdministrador
from .serializers import (
    EmployeeSerializer,
    MeSerializer,
    RestaurantSignupSerializer,
    RoleSerializer,
)


class RestaurantSignupView(APIView):
    """Cria o restaurante (tenant) e seu Administrador inicial — onboarding do dono."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RestaurantSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            restaurant = Restaurant.objects.create(
                name=data["restaurant_name"], slug=data["restaurant_slug"]
            )
            user = User.objects.create_user(
                username=data["username"],
                email=data.get("email", ""),
                password=data["password"],
                restaurant=restaurant,
                is_staff=True,
            )
            admin_role, _ = Role.objects.get_or_create(
                code="administrador", defaults={"label": "Administrador"}
            )
            user.user_roles.create(role=admin_role)

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "restaurant": {
                    "id": restaurant.id,
                    "name": restaurant.name,
                    "slug": restaurant.slug,
                },
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(generics.RetrieveAPIView):
    serializer_class = MeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self) -> User:
        return self.request.user


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data["refresh"])
            token.blacklist()
        except Exception:
            return Response({"detail": "Token inválido."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_205_RESET_CONTENT)


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]


class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer
    permission_classes = [IsAdministrador]

    def get_queryset(self):
        return User.objects.filter(restaurant_id=self.request.user.restaurant_id)

    def perform_create(self, serializer):
        serializer.save(restaurant_id=self.request.user.restaurant_id)
