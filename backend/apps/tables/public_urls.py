from django.urls import path

from .views import PublicTableDetailView

urlpatterns = [
    path("tables/<int:number>/", PublicTableDetailView.as_view(), name="public-table-detail"),
]
