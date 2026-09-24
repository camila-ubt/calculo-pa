-- Impede que perfis desativados continuem acessando dias e lançamentos do PA
-- mesmo quando ainda possuem uma sessão autenticada válida.

create or replace function private.usuario_pa_ativo()
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
      and ativo = true
  );
$$;

revoke all on function private.usuario_pa_ativo() from public, anon;
grant execute on function private.usuario_pa_ativo() to authenticated;

alter policy "usuario_pa_le_dias"
on public.dias_pa
using (
  (
    usuario_id = (select auth.uid())
    and (select private.usuario_pa_ativo())
  )
  or (select private.eh_admin_pa())
);

alter policy "usuario_pa_insere_dias"
on public.dias_pa
with check (
  (
    usuario_id = (select auth.uid())
    and (select private.usuario_pa_ativo())
  )
  or (select private.eh_admin_pa())
);

alter policy "usuario_pa_atualiza_dias"
on public.dias_pa
using (
  (
    usuario_id = (select auth.uid())
    and (select private.usuario_pa_ativo())
  )
  or (select private.eh_admin_pa())
)
with check (
  (
    usuario_id = (select auth.uid())
    and (select private.usuario_pa_ativo())
  )
  or (select private.eh_admin_pa())
);

alter policy "usuario_pa_exclui_dias"
on public.dias_pa
using (
  (
    usuario_id = (select auth.uid())
    and (select private.usuario_pa_ativo())
  )
  or (select private.eh_admin_pa())
);

alter policy "usuario_pa_le_lancamentos"
on public.lancamentos_pa
using (
  (select private.eh_admin_pa())
  or (
    (select private.usuario_pa_ativo())
    and exists (
      select 1
      from public.dias_pa d
      where d.id = lancamentos_pa.dia_id
        and d.usuario_id = (select auth.uid())
    )
  )
);

alter policy "usuario_pa_insere_lancamentos"
on public.lancamentos_pa
with check (
  (select private.eh_admin_pa())
  or (
    (select private.usuario_pa_ativo())
    and exists (
      select 1
      from public.dias_pa d
      where d.id = lancamentos_pa.dia_id
        and d.usuario_id = (select auth.uid())
    )
  )
);

alter policy "usuario_pa_atualiza_lancamentos"
on public.lancamentos_pa
using (
  (select private.eh_admin_pa())
  or (
    (select private.usuario_pa_ativo())
    and exists (
      select 1
      from public.dias_pa d
      where d.id = lancamentos_pa.dia_id
        and d.usuario_id = (select auth.uid())
    )
  )
)
with check (
  (select private.eh_admin_pa())
  or (
    (select private.usuario_pa_ativo())
    and exists (
      select 1
      from public.dias_pa d
      where d.id = lancamentos_pa.dia_id
        and d.usuario_id = (select auth.uid())
    )
  )
);

alter policy "usuario_pa_exclui_lancamentos"
on public.lancamentos_pa
using (
  (select private.eh_admin_pa())
  or (
    (select private.usuario_pa_ativo())
    and exists (
      select 1
      from public.dias_pa d
      where d.id = lancamentos_pa.dia_id
        and d.usuario_id = (select auth.uid())
    )
  )
);
