# calculo-pa

Aplicação web para cálculo e acompanhamento do PA das vendedoras, com lançamentos por loja, histórico mensal, premiação e integração com o Líder Metas.

## Integração

O projeto usa o mesmo Supabase do **Líder Metas** como banco central e autenticação.

## Acesso das vendedoras

Cada vendedora possui login individual por e-mail e senha. No cadastro, são registrados:

- nome;
- número de vendedora no sistema Athos;
- e-mail;
- senha.

O número Athos fica vinculado ao perfil para facilitar a conferência dos resultados no Líder Metas.

## Lançamentos

Cada dia pode ser marcado como:

- trabalhado;
- folga;
- falta;
- atestado;
- férias.

Em dias trabalhados, são informadas vendas e peças por loja. O PA é calculado automaticamente por `peças / vendas`.

## Premiação

- mínimo de 15 dias válidos no mês;
- PA de 2,20 a 2,59: R$ 100 em peças;
- PA igual ou superior a 2,60: R$ 150 em peças;
- a premiação só aparece após o fechamento do mês.

## Banco

As tabelas específicas do PA ficam no banco do Líder Metas:

- `usuarios_pa`;
- `dias_pa`;
- `lancamentos_pa`.

A estrutura usa RLS para limitar o acesso das vendedoras aos próprios registros, mantendo acesso administrativo para conferência.
