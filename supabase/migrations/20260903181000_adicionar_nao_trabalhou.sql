-- Permite a situação genérica "não trabalhou" sem quebrar registros antigos.
-- Folga, falta e atestado continuam válidos apenas para compatibilidade com o histórico.

alter table public.dias_pa
  drop constraint if exists dias_pa_situacao_check;

alter table public.dias_pa
  add constraint dias_pa_situacao_check
  check (situacao in ('trabalhado', 'nao_trabalhou', 'folga', 'falta', 'atestado', 'ferias'));
