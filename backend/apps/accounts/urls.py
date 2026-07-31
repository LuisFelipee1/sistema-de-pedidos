from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import EmployeeViewSet, LogoutView, MeView, RestaurantSignupView, RoleViewSet

router = DefaultRouter()
router.register("employees", EmployeeViewSet, basename="employee")
router.register("roles", RoleViewSet, basename="role")

# Montado em /api/auth/ (config/urls.py)
auth_urlpatterns = [
    path("restaurants/signup/", RestaurantSignupView.as_view(), name="restaurant-signup"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
]

# Montado em /api/ (config/urls.py) via include("apps.accounts.urls")
urlpatterns = router.urls
