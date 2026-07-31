from django.db import migrations

from apps.orders.statuses import SEED


def seed_statuses(apps, schema_editor):
    OrderStatus = apps.get_model("orders", "OrderStatus")
    for code, label, sort_order in SEED:
        OrderStatus.objects.update_or_create(
            code=code, defaults={"label": label, "sort_order": sort_order}
        )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [("orders", "0001_initial")]
    operations = [migrations.RunPython(seed_statuses, noop)]
