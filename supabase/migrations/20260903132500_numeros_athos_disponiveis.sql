-- Retorna somente os números de vendedora Athos ainda disponíveis.
-- Não expõe nome, e-mail ou outros dados das usuárias.

create or replace function public.numeros_athos_disponiveis()
returns table (numero integer)
language sql
stable
security definer
set search_path = public
as $$
  select n
  from generate_series(1, 18) as n
  where not exists (
    select 1
    from public.usuarios_pa u
    where u.numero_athos = n
  )
  order by n;
$$;

revoke all on function public.numeros_athos_disponiveis() from public;
grant execute on function public.numeros_athos_disponiveis() to anon, authenticated;
