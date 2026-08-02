"""Códigos de status do pedido — única fonte de verdade, usada pelo model,
pela migration de seed e pelo service de transições."""

AGUARDANDO_PAGAMENTO = "aguardando_pagamento"
PAGAMENTO_APROVADO = "pagamento_aprovado"
PEDIDO_RECEBIDO = "pedido_recebido"
NA_FILA = "na_fila"
EM_PREPARACAO = "em_preparacao"
PRONTO = "pronto"
FINALIZADO = "finalizado"
CANCELADO = "cancelado"

SEED = [
    (AGUARDANDO_PAGAMENTO, "Aguardando pagamento", 10),
    (PAGAMENTO_APROVADO, "Pagamento aprovado", 20),
    (PEDIDO_RECEBIDO, "Pedido recebido", 30),
    (NA_FILA, "Na fila", 40),
    (EM_PREPARACAO, "Em preparação", 50),
    (PRONTO, "Pronto", 60),
    (FINALIZADO, "Finalizado", 70),
    (CANCELADO, "Cancelado", 80),
]

# Status em que o pedido ainda pesa na conta da mesa. Fechar a conta finaliza
# todos eles de uma vez, independente de onde a cozinha parou.
OPEN_STATUSES = [
    AGUARDANDO_PAGAMENTO,
    PAGAMENTO_APROVADO,
    PEDIDO_RECEBIDO,
    NA_FILA,
    EM_PREPARACAO,
    PRONTO,
]

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    AGUARDANDO_PAGAMENTO: {PAGAMENTO_APROVADO, CANCELADO},
    PAGAMENTO_APROVADO: {PEDIDO_RECEBIDO, CANCELADO},
    PEDIDO_RECEBIDO: {NA_FILA, CANCELADO},
    NA_FILA: {EM_PREPARACAO, CANCELADO},
    EM_PREPARACAO: {PRONTO, CANCELADO},
    PRONTO: {FINALIZADO},
    FINALIZADO: set(),
    CANCELADO: set(),
}
