from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import TableAccountView, TableStatusUpdateView, TableViewSet

router = DefaultRouter()
router.register("tables", TableViewSet, basename="table")

urlpatterns = [
    path("tables/<int:pk>/status/", TableStatusUpdateView.as_view(), name="table-status-update"),
    path("tables/<int:pk>/account/", TableAccountView.as_view(), name="table-account"),
    *router.urls,
]
