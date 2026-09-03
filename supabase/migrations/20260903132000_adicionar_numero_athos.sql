-- Identificador da vendedora no sistema Athos.
-- Mantido como texto para preservar eventuais zeros à esquerda.

alter table public.usuarios_pa
add column if not exists numero_athos text;

create unique index if not exists usuarios_pa_numero_athos_unique_idx
on public.usuarios_pa (numero_athos)
where numero_athos is not null and btrim(numero_athos) <> '';

-- Novos usuários do Cálculo PA recebem nome e número Athos a partir
-- dos metadados enviados no cadastro do Supabase Auth.
create or replace function public.criar_usuario_pa_automaticamente()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios_pa (
    id,
    nome,
    numero_athos,
    tipo_usuario,
    ativo
  )
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nome', ''),
      split_part(new.email, '@', 1)
    ),
    nullif(btrim(new.raw_user_meta_data ->> 'numero_athos'), ''),
    'vendedora',
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
