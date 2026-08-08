from rest_framework import serializers

from .models import AddonGroup, AddonOption, Category, Product


class AddonOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AddonOption
        fields = [
            "id",
            "addon_group",
            "name",
            "description",
            "price_delta",
            "image",
            "display_order",
        ]

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
            "is_addon",
            "is_required",
            "min_selections",
            "max_selections",
            "display_order",
            "options",
        ]

    def validate_product(self, product: Product) -> Product:
        request = self.context["request"]
        if product.restaurant_id != request.user.restaurant_id:
            raise serializers.ValidationError("Produto não pertence ao seu restaurante.")
        return product


# --- Escrita em lote das perguntas do produto ---


class AddonOptionInputSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    name = serializers.CharField(max_length=100)
    description = serializers.CharField(max_length=150, required=False, allow_blank=True)
    price_delta = serializers.DecimalField(
        max_digits=8, decimal_places=2, required=False, default=0
    )


class AddonGroupInputSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    name = serializers.CharField(max_length=100)
    is_addon = serializers.BooleanField(default=False)
    is_required = serializers.BooleanField(default=False)
    options = AddonOptionInputSerializer(many=True, allow_empty=False)


class AddonGroupsReplaceSerializer(serializers.Serializer):
    """Recebe a árvore inteira de perguntas de uma vez, para a tela de cadastro
    salvar tudo numa transação só em vez de encadear requests."""

    groups = AddonGroupInputSerializer(many=True, allow_empty=True)


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
