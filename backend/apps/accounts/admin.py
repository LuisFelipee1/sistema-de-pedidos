from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import Role, User, UserRole


class UserRoleInline(admin.TabularInline):
    model = UserRole
    extra = 1


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = (
        *(DjangoUserAdmin.fieldsets or ()),
        ("Restaurante", {"fields": ("restaurant",)}),
    )
    list_display = ("username", "email", "restaurant", "is_staff", "is_active")
    list_filter = (*DjangoUserAdmin.list_filter, "restaurant")
    inlines = [UserRoleInline]


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("label", "code")
    search_fields = ("label", "code")
