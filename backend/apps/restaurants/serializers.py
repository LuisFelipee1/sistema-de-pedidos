from rest_framework import serializers

from .models import Restaurant

ADDRESS_FIELDS = [
    "street",
    "number",
    "complement",
    "district",
    "city",
    "state",
    "zip_code",
]


class PublicRestaurantSerializer(serializers.ModelSerializer):
    """O que a vitrine mostra no topo — sem nada interno do restaurante."""

    full_address = serializers.CharField(read_only=True)

    class Meta:
        model = Restaurant
        fields = ["name", "slug", "logo", "phone", "full_address", *ADDRESS_FIELDS]


class RestaurantSerializer(serializers.ModelSerializer):
    """Usado pelo dono na tela de configurações."""

    full_address = serializers.CharField(read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            "id",
            "name",
            "slug",
            "is_active",
            "logo",
            "phone",
            "full_address",
            *ADDRESS_FIELDS,
        ]
        # O slug entra na URL pública do cardápio; trocá-lo quebraria links já
        # divulgados, então fica fora da edição.
        read_only_fields = ["slug"]
