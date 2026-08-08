from django.db import models


class Category(models.Model):
    restaurant = models.ForeignKey(
        "restaurants.Restaurant", on_delete=models.CASCADE, related_name="categories"
    )
    name = models.CharField(max_length=100)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["display_order", "name"]
        verbose_name_plural = "categories"
        constraints = [
            models.UniqueConstraint(
                fields=["restaurant", "name"], name="unique_category_per_restaurant"
            ),
        ]

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    restaurant = models.ForeignKey(
        "restaurants.Restaurant", on_delete=models.CASCADE, related_name="products"
    )
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to="products/", blank=True, null=True)
    is_available = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class AddonGroup(models.Model):
    """Uma pergunta do produto: "Escolha seu pão", "Adicionais"...

    Dois formatos, decididos por `is_addon`:

    - `is_addon=False` — escolha de composição (pão, ponto da carne). Sempre
      obrigatória, resposta única e sem preço: o produto não fica montado sem
      ela, e cobrar por escolher um pão que já está no preço confundiria.
    - `is_addon=True` — extras (bacon, salada). Múltipla escolha, cada opção
      com preço, e o dono decide se exige pelo menos uma.
    """

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="addon_groups")
    name = models.CharField(max_length=100)
    is_addon = models.BooleanField(default=False)
    is_required = models.BooleanField(default=False)
    min_selections = models.PositiveIntegerField(default=0)
    max_selections = models.PositiveIntegerField(default=1)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "id"]

    def __str__(self) -> str:
        return f"{self.product} - {self.name}"


class AddonOption(models.Model):
    addon_group = models.ForeignKey(AddonGroup, on_delete=models.CASCADE, related_name="options")
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=150, blank=True)
    price_delta = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    image = models.ImageField(upload_to="addons/", blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "id"]

    def __str__(self) -> str:
        return self.name
