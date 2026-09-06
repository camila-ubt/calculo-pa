-- Defesa em profundidade antes de tornar o repositório público.
-- Mantém a autorização no banco e reduz a superfície exposta pela API do Supabase.

create schema if not exists private;

-- O helper administrativo é necessário nas policies, mas não precisa existir
-- como RPC no schema public exposto pelo PostgREST.
create or replace function private.eh_admin_pa()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.usuarios_pa
    where id = (select auth.uid())
      and tipo_usuario = 'admin'
      and ativo = true
  );
$$;

revoke all on function private.eh_admin_pa() from public, anon;
grant execute on function private.eh_admin_pa() to authenticated;

alter policy "usuario_pa_le_proprio_perfil"
on public.usuarios_pa
using (
  id = (select auth.uid())
  or (select private.eh_admin_pa())
);

alter policy "admin_pa_atualiza_perfis"
on public.usuarios_pa
using ((select private.eh_admin_pa()))
with check ((select private.eh_admin_pa()));

alter policy "usuario_pa_le_dias"
on public.dias_pa
using (
  usuario_id = (select auth.uid())
  or (select private.eh_admin_pa())
);

alter policy "usuario_pa_insere_dias"
on public.dias_pa
with check (
  usuario_id = (select auth.uid())
  or (select private.eh_admin_pa())
);

alter policy "usuario_pa_atualiza_dias"
on public.dias_pa
using (
  usuario_id = (select auth.uid())
  or (select private.eh_admin_pa())
)
with check (
  usuario_id = (select auth.uid())
  or (select private.eh_admin_pa())
);

alter policy "usuario_pa_exclui_dias"
on public.dias_pa
using (
  usuario_id = (select auth.uid())
  or (select private.eh_admin_pa())
);

alter policy "usuario_pa_le_lancamentos"
on public.lancamentos_pa
using (
  (select private.eh_admin_pa())
  or exists (
    select 1
    from public.dias_pa d
    where d.id = lancamentos_pa.dia_id
      and d.usuario_id = (select auth.uid())
  )
);

alter policy "usuario_pa_insere_lancamentos"
on public.lancamentos_pa
with check (
  (select private.eh_admin_pa())
  or exists (
    select 1
    from public.dias_pa d
    where d.id = lancamentos_pa.dia_id
      and d.usuario_id = (select auth.uid())
  )
);

alter policy "usuario_pa_atualiza_lancamentos"
on public.lancamentos_pa
using (
  (select private.eh_admin_pa())
  or exists (
    select 1
    from public.dias_pa d
    where d.id = lancamentos_pa.dia_id
      and d.usuario_id = (select auth.uid())
  )
)
with check (
  (select private.eh_admin_pa())
  or exists (
    select 1
    from public.dias_pa d
    where d.id = lancamentos_pa.dia_id
      and d.usuario_id = (select auth.uid())
  )
);

alter policy "usuario_pa_exclui_lancamentos"
on public.lancamentos_pa
using (
  (select private.eh_admin_pa())
  or exists (
    select 1
    from public.dias_pa d
    where d.id = lancamentos_pa.dia_id
      and d.usuario_id = (select auth.uid())
  )
);

-- Remove o helper equivalente do schema exposto depois que nenhuma policy
-- depende mais dele.
drop function if exists public.eh_admin_pa();

-- Trigger de criação de perfil: só o trigger do Auth precisa executá-lo.
alter function public.criar_usuario_pa_automaticamente() set search_path to '';
revoke all on function public.criar_usuario_pa_automaticamente()
from public, anon, authenticated;

-- Este trigger existe no banco compartilhado de produção, mas pode não existir
-- em uma instalação limpa deste repositório.
do $$
begin
  if to_regprocedure('public.invalidar_conferencia_pa_lancamento()') is not null then
    execute 'revoke all on function public.invalidar_conferencia_pa_lancamento() from public, anon, authenticated';
  end if;
end
$$;

-- Nenhum dado do PA precisa ser acessível sem autenticação. RLS continua ativo,
-- mas os grants anônimos também são removidos como segunda barreira.
revoke all on table public.usuarios_pa, public.dias_pa, public.lancamentos_pa
from anon;

-- Objetos adicionais do painel administrativo existem no banco compartilhado.
-- Se estiverem presentes, também deixam de conceder acesso direto ao papel anon.
do $$
declare
  objeto text;
begin
  foreach objeto in array array[
    'conferencias_pa',
    'correcoes_pa',
    'detalhes_pa_diarios',
    'resumo_pa_mensal',
    'resumo_pa_mensal_loja'
  ]
  loop
    if to_regclass('public.' || objeto) is not null then
      execute format('revoke all on table public.%I from anon', objeto);
    end if;
  end loop;
end
$$;

-- Remove acesso anônimo às sequences específicas do PA, se existirem.
do $$
declare
  seq record;
begin
  for seq in
    select schemaname, sequencename
    from pg_sequences
    where schemaname = 'public'
      and sequencename like '%pa%'
  loop
    execute format('revoke all on sequence %I.%I from anon', seq.schemaname, seq.sequencename);
  end loop;
end
$$;
