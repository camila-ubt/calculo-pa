# Banco de dados

O Cálculo PA utiliza **PostgreSQL no Supabase**, no mesmo projeto de banco utilizado pelo Líder Metas.

## `usuarios_pa`

Guarda o perfil específico do PA.

Campos principais:

- `id`: UUID, ligado a `auth.users`;
- `nome`;
- `numero_athos`;
- `tipo_usuario`: `vendedora` ou `admin`;
- `ativo`;
- datas de criação e atualização.

Novos usuários do Auth recebem perfil PA automaticamente por trigger, com tipo `vendedora` por padrão.

## `dias_pa`

Representa o estado de cada data para cada usuária.

Campos principais:

- `id`;
- `usuario_id`;
- `data`;
- `situacao`;
- `observacao`;
- timestamps.

Existe restrição única para `(usuario_id, data)`.

## `lancamentos_pa`

Armazena os números por loja dentro de um dia.

Campos principais:

- `id`;
- `dia_id`;
- `loja_id`;
- `vendas`;
- `pecas`;
- timestamps.

Restrições:

- vendas >= 0;
- peças >= 0;
- peças >= vendas;
- combinação `(dia_id, loja_id)` única.

## `aprovacoes_premiacao_pa`

Controla a aprovação mensal da premiação.

Campos:

- `usuario_id`;
- `mes` — sempre o primeiro dia do mês de referência;
- `status`: pendente, aprovada ou reprovada;
- `aprovado_por`;
- `aprovado_em`;
- timestamps.

Existe um único registro por usuária/mês.

## Tabela `lojas`

É compartilhada com o ambiente do Líder Metas. O PA consulta apenas lojas ativas, ordenadas pelo campo de ordem.

## Objetos administrativos adicionais

O ambiente de produção pode conter objetos auxiliares específicos da conferência, correções e resumos, como:

- `conferencias_pa`;
- `correcoes_pa`;
- `detalhes_pa_diarios`;
- `resumo_pa_mensal`;
- `resumo_pa_mensal_loja`.

Esses objetos pertencem ao fluxo administrativo e também têm o acesso anônimo removido pelas migrations de segurança.