# Regras de negócio e premiação

## Cálculo do PA

O PA é calculado por:

`PA = peças / vendas`

Se não houver vendas, o PA exibido é 0.

## PA do dia

Quando há mais de uma loja, o cálculo usa os totais consolidados do dia:

`PA do dia = soma das peças de todas as lojas / soma das vendas de todas as lojas`

## PA do mês

O resumo mensal considera apenas dias com situação **trabalhado**.

`PA mensal = total de peças dos dias trabalhados / total de vendas dos dias trabalhados`

## Dias válidos

Cada data marcada como **trabalhado** conta como um dia válido, independentemente de quantas lojas foram selecionadas naquele dia.

## Premiação

A premiação só é avaliada quando o **último dia do mês está preenchido**.

Também é obrigatório atingir pelo menos **15 dias trabalhados** no mês.

Faixas:

| PA mensal | Premiação potencial |
|---|---:|
| abaixo de 2,20 | sem premiação |
| de 2,20 até 2,59 | R$ 100 em peças |
| 2,60 ou mais | R$ 150 em peças |

## Aprovação

Atingir a faixa não libera a premiação automaticamente. O resultado fica como **aguardando conferência e aprovação**.

Status possíveis:

- `pendente`;
- `aprovada`;
- `reprovada`.

Apenas a administração pode alterar o resultado final da aprovação.

## Regras de consistência

O sistema aplica validações tanto na interface quanto no banco:

- vendas não podem ser negativas;
- peças não podem ser negativas;
- peças devem ser maiores ou iguais às vendas;
- não pode existir mais de um registro de dia para a mesma usuária e data;
- não pode existir mais de um lançamento da mesma loja dentro do mesmo dia.

Essa duplicação de validação entre frontend e banco evita que uma chamada direta à API grave dados inválidos.