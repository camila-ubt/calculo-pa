# Cálculo PA

Aplicação web para lançamento, cálculo e acompanhamento do **PA das vendedoras**, integrada ao mesmo Supabase utilizado pelo **Líder Metas**.

## O que o app faz

- login individual por vendedora;
- lançamento diário de vendas e peças por loja;
- cálculo automático do PA;
- calendário e histórico mensal;
- resumo do mês por loja;
- regras e acompanhamento de premiação;
- conferência administrativa;
- controle de acesso com RLS no Supabase.

## Tecnologias

- Next.js
- JavaScript
- Supabase
- PostgreSQL
- Vercel

## Segurança

O projeto usa autenticação individual, políticas de **Row Level Security (RLS)** e separação de permissões entre vendedoras e administração. Variáveis sensíveis ficam fora do repositório e devem ser configuradas no ambiente de execução.

## Documentação

A documentação detalhada de funcionamento, banco de dados, regras de negócio, segurança, configuração e manutenção está em [`docs/wiki`](./docs/wiki/Home.md).

> A documentação está organizada no formato da Wiki do GitHub e pode ser publicada na Wiki nativa do repositório quando ela estiver inicializada.

## Versão

**v1.0.0**

Desenvolvido por [@camila-ubt](https://github.com/camila-ubt).
