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

-- Retorna uma mensagem amigável antes da constraint caso algum cliente
-- tente gravar um lançamento inválido diretamente no banco.
create or replace function public.validar_pecas_maior_igual_vendas()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.pecas < new.vendas then
    raise exception 'A quantidade de peças deve ser igual ou maior que a quantidade de vendas.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists validar_pecas_maior_igual_vendas_trigger
on public.lancamentos_pa;

create trigger validar_pecas_maior_igual_vendas_trigger
before insert or update of vendas, pecas
on public.lancamentos_pa
for each row
execute function public.validar_pecas_maior_igual_vendas();
