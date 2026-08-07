"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

from apps.accounts.urls import auth_urlpatterns

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
    # Staff autenticado (restaurante inferido do JWT do usuário)
    path("api/auth/", include(auth_urlpatterns)),
    path("api/", include("apps.accounts.urls")),
    path("api/", include("apps.restaurants.urls")),
    path("api/", include("apps.menu.urls")),
    path("api/", include("apps.tables.urls")),
    path("api/", include("apps.orders.urls")),
    path("api/", include("apps.payments.urls")),
    # Público, sem login (restaurante identificado pelo slug na URL)
    path("api/r/<slug:slug>/", include("apps.restaurants.public_urls")),
    path("api/r/<slug:slug>/", include("apps.menu.public_urls")),
    path("api/r/<slug:slug>/", include("apps.tables.public_urls")),
    path("api/r/<slug:slug>/", include("apps.orders.public_urls")),
    path("api/r/<slug:slug>/", include("apps.payments.public_urls")),
]

if settings.DEBUG:
    import debug_toolbar

    urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]
