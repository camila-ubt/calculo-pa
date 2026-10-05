## v1.4.0 — Mês fechado para vendedoras

Publicada em **5 de outubro de 2026**.

O Cálculo PA agora reconhece os meses fechados pela gestão no Líder Metas.

### Consulta de mês fechado

- exibe **Mês fechado · somente consulta** quando o período já foi conferido e encerrado;
- calendário, histórico, resumo e PA continuam visíveis;
- situação do dia, lojas, vendas, peças e férias ficam bloqueados para edição;
- remoção e salvamento de lançamentos ficam desabilitados;
- a consulta do fechamento é feita por RPC restrita a usuárias ativas;
- as proteções de banco aplicadas pelo Líder Metas continuam impedindo qualquer alteração no período.

### Banco

Inclui a migration `20261005170500_consulta_fechamento_pa_vendedora.sql`, que adiciona a função `consultar_fechamento_pa` sem expor quem realizou o fechamento.

A fórmula do PA e as regras de premiação permanecem inalteradas.
