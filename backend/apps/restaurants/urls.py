from django.urls import path

from .views import MyRestaurantView

urlpatterns = [
    path("restaurant/", MyRestaurantView.as_view(), name="my-restaurant"),
]
