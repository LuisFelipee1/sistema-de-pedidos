from rest_framework import serializers

from .models import AddonGroup, AddonOption, Category, Product


class AddonOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AddonOption
        fields = ["id", "addon_group", "name", "price_delta"]

    def validate_addon_group(self, addon_group: AddonGroup) -> AddonGroup:
        request = self.context["request"]
        if addon_group.product.restaurant_id != request.user.restaurant_id:
            raise serializers.ValidationError("Grupo não pertence ao seu restaurante.")
        return addon_group


class AddonGroupSerializer(serializers.ModelSerializer):
    options = AddonOptionSerializer(many=True, read_only=True)

    class Meta:
        model = AddonGroup
        fields = [
            "id",
            "product",
            "name",
            "is_required",
            "min_selections",
            "max_selections",
            "options",
        ]

    def validate_product(self, product: Product) -> Product:
        request = self.context["request"]
        if product.restaurant_id != request.user.restaurant_id:
            raise serializers.ValidationError("Produto não pertence ao seu restaurante.")
        return product


class ProductSerializer(serializers.ModelSerializer):
    addon_groups = AddonGroupSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "restaurant",
            "category",
            "name",
            "description",
            "price",
            "image",
            "is_available",
            "addon_groups",
        ]
        read_only_fields = ["restaurant"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "restaurant", "name", "display_order", "is_active"]
        read_only_fields = ["restaurant"]
