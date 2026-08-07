from django.urls import path

from .views import PublicRestaurantDetailView

urlpatterns = [
    path("", PublicRestaurantDetailView.as_view(), name="public-restaurant"),
]
