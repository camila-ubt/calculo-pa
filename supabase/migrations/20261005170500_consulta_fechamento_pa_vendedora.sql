-- Permite que uma vendedora ativa consulte apenas o estado de fechamento do mês.
-- A tabela de fechamentos é compartilhada com o Líder Metas; o UUID de quem fechou não é exposto.

create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.consultar_fechamento_pa(p_mes date)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := auth.uid();
  v_fechado_em timestamptz;
begin
  if v_usuario is null or not exists (
    select 1
    from public.usuarios_pa u
    where u.id = v_usuario
      and u.ativo = true
  ) then
    raise exception 'Somente usuárias ativas podem consultar o fechamento do PA.'
      using errcode = '42501';
  end if;

  if p_mes is null or p_mes <> date_trunc('month', p_mes)::date then
    raise exception 'Informe o primeiro dia do mês.'
      using errcode = '22023';
  end if;

  select f.fechado_em
    into v_fechado_em
  from public.fechamentos_pa f
  where f.mes = p_mes;

  return jsonb_build_object(
    'fechado', v_fechado_em is not null,
    'fechado_em', v_fechado_em
  );
end;
$$;

create or replace function public.consultar_fechamento_pa(p_mes date)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.consultar_fechamento_pa(p_mes);
$$;

revoke all on function private.consultar_fechamento_pa(date)
from public, anon, authenticated;
revoke all on function public.consultar_fechamento_pa(date)
from public, anon, authenticated;

grant execute on function private.consultar_fechamento_pa(date) to authenticated;
grant execute on function public.consultar_fechamento_pa(date) to authenticated;
