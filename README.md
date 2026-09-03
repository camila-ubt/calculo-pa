# Cálculo PA

Aplicação web para cálculo e acompanhamento do PA das vendedoras, com lançamentos por loja, histórico mensal, premiação e integração com o Líder Metas.

## Integração

O projeto usa o mesmo Supabase do **Líder Metas** (`nnxzkokfbnshdidaioet`) para autenticação e persistência dos dados.

## Primeira versão

- login individual das vendedoras;
- lançamento diário por loja;
- quantidade de vendas e peças;
- cálculo automático de PA;
- situações: trabalhado, folga, falta, atestado e férias;
- histórico mensal;
- mínimo de 15 dias trabalhados para premiação;
- PA de 2,20 a 2,59: R$ 100 em peças;
- PA a partir de 2,60: R$ 150 em peças;
- premiação exibida somente após o fechamento do mês;
- estrutura pronta para conferência pelo Líder Metas.

## Banco

A migration inicial está em `supabase/migrations/20260903123000_criar_estrutura_pa.sql` e cria as tabelas `usuarios_pa`, `dias_pa` e `lancamentos_pa`, com RLS para separar o acesso de vendedoras e administradores.

## Ambiente

Copie `.env.example` para `.env.local` e configure a chave publicável do projeto Supabase do Líder Metas.

```bash
npm install
npm run dev
```
