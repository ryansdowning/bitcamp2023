"""openticket URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
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
from django.contrib import admin
from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt
from openticket.views import (
    ChangePasswordEndpoint,
    SignupEndpoint,
    TokenEndpoint,
    UserEndpoint,
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register("user", UserEndpoint, basename="user")

urlpatterns = [
    path("v1/admin/", admin.site.urls),
    path("v1/auth/", include(router.urls)),
    path("v1/auth/token/", csrf_exempt(TokenEndpoint.as_view())),
    path("v1/auth/signup/", SignupEndpoint.as_view()),
    path("v1/auth/change-password/", ChangePasswordEndpoint.as_view()),
]
