from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Cliente não tem conta (guest flow) — este model é só para staff."""

    restaurant = models.ForeignKey(
        "restaurants.Restaurant",
        on_delete=models.CASCADE,
        related_name="employees",
        null=True,
        blank=True,
        help_text="Obrigatório para Funcionário/Administrador.",
    )


class Role(models.Model):
    code = models.SlugField(max_length=50, unique=True)
    label = models.CharField(max_length=100)

    class Meta:
        ordering = ["label"]

    def __str__(self) -> str:
        return self.label


class UserRole(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_roles")
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="user_roles")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "role"], name="unique_user_role"),
        ]

    def __str__(self) -> str:
        return f"{self.user} - {self.role}"
