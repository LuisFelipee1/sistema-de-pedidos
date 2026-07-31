from django.db import migrations

ROLES = [
    ("garcom", "Garçom"),
    ("cozinha", "Cozinha"),
    ("administrador", "Administrador"),
]


def seed_roles(apps, schema_editor):
    Role = apps.get_model("accounts", "Role")
    for code, label in ROLES:
        Role.objects.update_or_create(code=code, defaults={"label": label})


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [("accounts", "0002_role_user_restaurant_userrole")]
    operations = [migrations.RunPython(seed_roles, noop)]
