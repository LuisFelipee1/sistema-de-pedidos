from django.db import models


class Restaurant(models.Model):
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=160, unique=True)
    is_active = models.BooleanField(default=True)

    logo = models.ImageField(upload_to="restaurants/logos/", blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)

    # Endereço destrinchado em vez de texto livre: mais tarde dá para filtrar
    # por cidade e calcular entrega sem ter que reinterpretar a string.
    street = models.CharField(max_length=150, blank=True)
    number = models.CharField(max_length=20, blank=True)
    complement = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=2, blank=True)
    zip_code = models.CharField(max_length=9, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    @property
    def full_address(self) -> str:
        """Endereço em uma linha, pulando o que ainda não foi preenchido."""
        street_line = " ".join(part for part in [self.street, self.number] if part)
        if self.complement:
            street_line = f"{street_line} - {self.complement}" if street_line else self.complement
        city_line = " - ".join(part for part in [self.city, self.state] if part)
        parts = [part for part in [street_line, self.district, city_line, self.zip_code] if part]
        return ", ".join(parts)
