from rest_framework import serializers

from .models import Order, OrderItem, OrderItemAddon, OrderStatusHistory

# --- Leitura ---


class OrderItemAddonSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItemAddon
        fields = ["id", "addon_name_snapshot", "price_delta_snapshot"]


class OrderItemSerializer(serializers.ModelSerializer):
    addons = OrderItemAddonSerializer(many=True, read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name_snapshot",
            "unit_price_snapshot",
            "quantity",
            "notes",
            "addons",
        ]


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    status = serializers.CharField(source="status.label", read_only=True)

    class Meta:
        model = OrderStatusHistory
        fields = ["status", "changed_at"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    current_status = serializers.CharField(source="current_status.label", read_only=True)
    current_status_code = serializers.CharField(source="current_status.code", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "restaurant",
            "table",
            "order_type",
            "customer_name",
            "current_status",
            "current_status_code",
            "total_amount",
            "notes",
            "tracking_token",
            "items",
            "status_history",
            "created_at",
        ]


class OrderTrackSerializer(OrderSerializer):
    """Versão pública do pedido — sem expor restaurant/table como FKs internas."""

    class Meta(OrderSerializer.Meta):
        fields = [
            "current_status",
            "total_amount",
            "items",
            "status_history",
            "created_at",
        ]


# --- Escrita ---


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    notes = serializers.CharField(required=False, allow_blank=True)
    addon_option_ids = serializers.ListField(child=serializers.IntegerField(), required=False)


class OnlineOrderCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(required=False, allow_blank=True)
    table_number = serializers.IntegerField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)
    items = OrderItemInputSerializer(many=True)


class PresencialOrderCreateSerializer(serializers.Serializer):
    table_id = serializers.IntegerField()
    notes = serializers.CharField(required=False, allow_blank=True)
    items = OrderItemInputSerializer(many=True)


class OrderItemsReplaceSerializer(serializers.Serializer):
    items = OrderItemInputSerializer(many=True)
