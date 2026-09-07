# Arquitetura, tecnologias e deploy

## Frontend e aplicação

- **Next.js** com App Router;
- **JavaScript**;
- componentes React client-side para interação e autenticação;
- CSS modular e arquivos de estilo dedicados ao painel.

A página principal carrega o componente do painel, que controla autenticação, lançamentos, calendário, histórico e resumo mensal.

## Backend e dados

O acesso aos dados é feito pelo cliente Supabase.

O PostgreSQL concentra as regras que não podem depender apenas do frontend, incluindo:

- integridade referencial;
- constraints;
- triggers;
- RLS;
- controle de autorização.

## Hospedagem

A aplicação é publicada na **Vercel**.

Produção:

https://calculo-pa.vercel.app

## Variáveis de ambiente

O projeto utiliza variáveis públicas necessárias para inicializar o cliente Supabase. Os nomes esperados ficam documentados no `.env.example`.

Credenciais reais não devem ser commitadas.

## CI e segurança

O repositório possui automações para:

- análise CodeQL;
- verificações de segurança;
- atualização de dependências via Dependabot;
- publicação de release.

## Releases

A documentação corresponde à versão **v1.1.0**. Alterações de regra de negócio devem ser refletidas tanto no código quanto nesta documentação.