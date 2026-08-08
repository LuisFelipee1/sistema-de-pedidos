from decimal import Decimal

from django.db import transaction

from .models import AddonGroup, AddonOption, Product


def _normalize_group(data: dict, order: int) -> dict:
    """Traduz o "é adicional?" da tela para as regras de seleção do banco.

    Pergunta de composição não é negociável: obrigatória, resposta única e sem
    preço. Adicional é múltipla escolha paga, e só o "exige pelo menos um" fica
    a critério do dono.
    """
    is_addon = bool(data.get("is_addon"))
    option_count = len(data.get("options", []))

    if not is_addon:
        return {
            "name": data["name"],
            "is_addon": False,
            "is_required": True,
            "min_selections": 1,
            "max_selections": 1,
            "display_order": order,
        }

    is_required = bool(data.get("is_required"))
    return {
        "name": data["name"],
        "is_addon": True,
        "is_required": is_required,
        "min_selections": 1 if is_required else 0,
        "max_selections": option_count,
        "display_order": order,
    }


def _option_fields(data: dict, order: int, is_addon: bool) -> dict:
    return {
        "name": data["name"],
        "description": data.get("description", ""),
        # Só adicional cobra; numa escolha de composição o preço já está no produto.
        "price_delta": Decimal(str(data.get("price_delta") or 0)) if is_addon else Decimal("0"),
        "display_order": order,
    }


@transaction.atomic
def replace_addon_groups(product: Product, groups_data: list[dict]) -> None:
    """Sincroniza as perguntas do produto com o que veio da tela.

    Atualiza pelo id em vez de apagar e recriar tudo: as fotos das opções são
    enviadas depois, num segundo request, e recriar as linhas jogaria fora as
    imagens já anexadas a cada edição do produto.
    """
    kept_group_ids = []

    for group_order, group_data in enumerate(groups_data):
        fields = _normalize_group(group_data, group_order)
        group_id = group_data.get("id")

        group = (
            AddonGroup.objects.filter(pk=group_id, product=product).first() if group_id else None
        )
        if group:
            for key, value in fields.items():
                setattr(group, key, value)
            group.save()
        else:
            group = AddonGroup.objects.create(product=product, **fields)

        kept_group_ids.append(group.pk)

        kept_option_ids = []
        for option_order, option_data in enumerate(group_data.get("options", [])):
            option_fields = _option_fields(option_data, option_order, fields["is_addon"])
            option_id = option_data.get("id")

            option = (
                AddonOption.objects.filter(pk=option_id, addon_group=group).first()
                if option_id
                else None
            )
            if option:
                for key, value in option_fields.items():
                    setattr(option, key, value)
                option.save()
            else:
                option = AddonOption.objects.create(addon_group=group, **option_fields)

            kept_option_ids.append(option.pk)

        group.options.exclude(pk__in=kept_option_ids).delete()

    product.addon_groups.exclude(pk__in=kept_group_ids).delete()
