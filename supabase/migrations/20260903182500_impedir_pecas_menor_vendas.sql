-- Garante que a quantidade de peças nunca seja menor que a quantidade de vendas.
-- A migration falha de forma explícita se já existirem registros inconsistentes,
-- para evitar alterar o histórico automaticamente.

do $$
begin
  if exists (
    select 1
    from public.lancamentos_pa
    where pecas < vendas
  ) then
    raise exception 'Existem lançamentos com peças menores que vendas. Corrija esses registros antes de aplicar a constraint.';
  end if;
end
$$;

alter table public.lancamentos_pa
  drop constraint if exists lancamentos_pa_pecas_maior_igual_vendas;

alter table public.lancamentos_pa
  add constraint lancamentos_pa_pecas_maior_igual_vendas
  check (pecas >= vendas);
