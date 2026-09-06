# Conferência administrativa

A conferência existe para validar os resultados lançados antes da aprovação de uma premiação.

## Objetivo

Permitir que a administração compare os dados do Cálculo PA com a fonte utilizada na operação, identificando divergências antes de aprovar o resultado mensal.

## Organização

A área de conferência trabalha com seleção de loja e consolidação dos resultados.

Para cada loja, o painel pode apresentar:

- total de vendas;
- total de peças;
- resultado resumido da loja;
- detalhamento dia a dia.

Isso facilita a comparação com os registros externos sem obrigar a administração a recalcular manualmente o PA.

## Aprovação da premiação

Mesmo quando o PA e a quantidade mínima de dias tornam a vendedora elegível, a premiação permanece pendente até a validação administrativa.

A aprovação mensal é registrada em `aprovacoes_premiacao_pa`.

Somente administradores podem atualizar o status para `aprovada` ou `reprovada`.

## Correções

O sistema possui fluxo de avisos/correções para apontar dias que precisam ser revistos. A vendedora pode abrir o aviso e voltar diretamente ao lançamento da data indicada.

## Auditoria lógica

O modelo mantém separados:

- o lançamento original do dia;
- o resultado mensal calculado;
- o estado da conferência;
- a decisão administrativa de premiação.

Essa separação reduz o risco de confundir cálculo automático com aprovação gerencial.