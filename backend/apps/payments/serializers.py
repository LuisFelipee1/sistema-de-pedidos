from rest_framework import serializers

from .models import Payment, RestaurantPaymentAccount


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "order", "status", "method", "amount", "created_at"]


class PaymentAccountSerializer(serializers.ModelSerializer):
    connected = serializers.SerializerMethodField()

    class Meta:
        model = RestaurantPaymentAccount
        fields = ["mercado_pago_user_id", "connected_at", "connected"]

    def get_connected(self, obj: RestaurantPaymentAccount) -> bool:
        return bool(obj.access_token)
