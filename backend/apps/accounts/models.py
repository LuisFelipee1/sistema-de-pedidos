from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Placeholder do model de usuário customizado.

    Definido desde já apenas para travar AUTH_USER_MODEL antes da primeira
    migration — trocar o user model depois do primeiro migrate exige
    recriar o banco. Campos de negócio (vínculo com Restaurant, Role, etc.)
    serão adicionados na etapa de modelagem do banco de dados.
    """
