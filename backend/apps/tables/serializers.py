from rest_framework import serializers

from .models import Table


class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ["id", "restaurant", "number", "status"]
        read_only_fields = ["restaurant"]


class TableStatusSerializer(serializers.ModelSerializer):
    """Usado pelo garçom no salão — deixa alterar só o status, nunca o número."""

    class Meta:
        model = Table
        fields = ["id", "restaurant", "number", "status"]
        read_only_fields = ["restaurant", "number"]


class PublicTableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ["number", "status"]
