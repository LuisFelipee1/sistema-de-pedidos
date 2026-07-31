from django.contrib import admin

from .models import AddonGroup, AddonOption, Category, Product


class AddonOptionInline(admin.TabularInline):
    model = AddonOption
    extra = 1


@admin.register(AddonGroup)
class AddonGroupAdmin(admin.ModelAdmin):
    list_display = ("name", "product", "is_required", "min_selections", "max_selections")
    list_filter = ("product__restaurant",)
    inlines = [AddonOptionInline]


class AddonGroupInline(admin.TabularInline):
    model = AddonGroup
    extra = 0
    show_change_link = True


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "restaurant", "display_order", "is_active")
    list_filter = ("restaurant", "is_active")
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "restaurant", "category", "price", "is_available")
    list_filter = ("restaurant", "category", "is_available")
    search_fields = ("name",)
    inlines = [AddonGroupInline]
