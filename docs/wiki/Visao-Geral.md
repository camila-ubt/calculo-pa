# Visão geral e fluxo

## Problema resolvido

O PA era acompanhado manualmente. O sistema foi criado para diminuir retrabalho, padronizar lançamentos, evitar inconsistências e manter histórico mensal acessível para vendedora e administração.

## Fluxo principal

1. A vendedora cria a conta e informa seu número no Athos.
2. O acesso é associado ao perfil do Cálculo PA.
3. Após o login, a tela abre no mês atual.
4. A vendedora informa como foi o dia: trabalhando, não trabalhei ou férias.
5. Em dia trabalhado, seleciona uma ou mais lojas.
6. Para cada loja, registra quantidade de vendas e peças.
7. O sistema calcula o PA automaticamente.
8. Os lançamentos ficam disponíveis no calendário e no histórico mensal.
9. Ao final do mês, o sistema avalia os requisitos de premiação.
10. A premiação elegível permanece pendente até conferência e aprovação administrativa.

## Situações do dia

### Trabalhando
Conta como dia válido para a premiação e exige pelo menos uma loja com vendas e peças preenchidas.

### Não trabalhei
Representa dias sem trabalho. No banco podem existir situações históricas como folga, falta ou atestado, normalizadas na interface como “Não trabalhei”.

### Férias
Permite registrar um intervalo de datas. Os dias são salvos como férias e não recebem lançamentos de vendas/peças.

## Datas

- o sistema inicia no dia atual;
- é possível navegar para dias anteriores;
- datas futuras são bloqueadas;
- um lançamento já existente pode ser reaberto e atualizado;
- um lançamento pode ser removido, fazendo o dia deixar de contar no PA.

## Mais de uma loja no mesmo dia

A vendedora pode trabalhar em mais de uma loja no mesmo dia. Cada loja recebe seu próprio número de vendas e peças, e o total do dia é calculado pela soma dos registros.