from django.db import models


class Table(models.Model):
    class Status(models.TextChoices):
        LIVRE = "livre", "Livre"
        OCUPADA = "ocupada", "Ocupada"
        DESATIVADA = "desativada", "Desativada"

    restaurant = models.ForeignKey(
        "restaurants.Restaurant", on_delete=models.CASCADE, related_name="tables"
    )
    number = models.PositiveIntegerField()
    status = models.CharField(max_length=25, choices=Status.choices, default=Status.LIVRE)

    class Meta:
        ordering = ["number"]
        constraints = [
            models.UniqueConstraint(
                fields=["restaurant", "number"], name="unique_table_number_per_restaurant"
            ),
        ]

    def __str__(self) -> str:
        return f"Mesa {self.number}"
