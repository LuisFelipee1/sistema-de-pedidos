from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.restaurants.models import Restaurant

from .models import Role, User, UserRole


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "code", "label"]


class MeRestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ["id", "name", "slug"]


class MeSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    # Aninhado por causa do slug: o painel precisa dele para montar o link da
    # vitrine pública do próprio restaurante.
    restaurant = MeRestaurantSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "restaurant", "roles"]

    def get_roles(self, obj: User) -> list[str]:
        return list(obj.user_roles.values_list("role__code", flat=True))


class EmployeeSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=False, validators=[validate_password]
    )
    roles = serializers.SerializerMethodField()
    role_codes = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "is_active", "roles", "role_codes"]

    def get_roles(self, obj: User) -> list[str]:
        return list(obj.user_roles.values_list("role__code", flat=True))

    def create(self, validated_data: dict) -> User:
        role_codes = validated_data.pop("role_codes", [])
        password = validated_data.pop("password", None)
        if not password:
            raise serializers.ValidationError({"password": "Obrigatório ao criar funcionário."})
        user = User(**validated_data, is_staff=True)
        user.set_password(password)
        user.save()
        self._sync_roles(user, role_codes)
        return user

    def update(self, instance: User, validated_data: dict) -> User:
        role_codes = validated_data.pop("role_codes", None)
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        if role_codes is not None:
            self._sync_roles(instance, role_codes)
        return instance

    def _sync_roles(self, user: User, role_codes: list[str]) -> None:
        UserRole.objects.filter(user=user).delete()
        roles = Role.objects.filter(code__in=role_codes)
        UserRole.objects.bulk_create([UserRole(user=user, role=role) for role in roles])


class RestaurantSignupSerializer(serializers.Serializer):
    restaurant_name = serializers.CharField(max_length=150)
    restaurant_slug = serializers.SlugField(max_length=160)
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_restaurant_slug(self, value: str) -> str:
        if Restaurant.objects.filter(slug=value).exists():
            raise serializers.ValidationError("Esse slug já está em uso.")
        return value

    def validate_username(self, value: str) -> str:
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Esse username já está em uso.")
        return value
