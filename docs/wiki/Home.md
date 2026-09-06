# Cálculo PA — Wiki

O **Cálculo PA** é uma aplicação web criada para registrar, calcular e acompanhar o **PA (Peças por Atendimento)** das vendedoras das lojas. O sistema substitui o controle manual em planilha por um fluxo autenticado, com histórico mensal, regras de premiação e conferência administrativa.

## Objetivo

Centralizar os lançamentos de vendas e peças, calcular automaticamente o PA e manter um histórico confiável para acompanhamento individual e conferência da gestão.

## Principais recursos

- login individual por vendedora;
- cadastro com nome, e-mail e número de vendedora no Athos;
- lançamento diário por uma ou mais lojas;
- registro de dias trabalhados, não trabalhados e férias;
- cálculo automático do PA do dia e do mês;
- calendário e histórico mensal;
- resumo mensal por loja;
- regras automáticas de premiação;
- aprovação administrativa da premiação;
- conferência dos resultados;
- correções e avisos;
- segurança com Supabase Auth e Row Level Security (RLS).

## Fórmula do PA

`PA = total de peças / total de vendas`

Exemplo: 52 peças / 20 vendas = **PA 2,60**.

## Navegação da documentação

- [Visão geral e fluxo](Visao-Geral.md)
- [Uso pela vendedora](Uso-da-Vendedora.md)
- [Regras de negócio e premiação](Regras-de-Negocio.md)
- [Banco de dados](Banco-de-Dados.md)
- [Segurança e permissões](Seguranca-e-Permissoes.md)
- [Conferência administrativa](Conferencia-Administrativa.md)
- [Arquitetura, tecnologias e deploy](Arquitetura-e-Deploy.md)
- [Manutenção e evolução](Manutencao.md)

## Stack

Next.js, JavaScript, Supabase, PostgreSQL e Vercel.

## Integração

O Cálculo PA utiliza o **mesmo projeto Supabase do Líder Metas**, permitindo compartilhar cadastros e estruturas de apoio sem misturar as regras específicas do PA.

## Versão documentada

**v1.0.0**

Desenvolvido por [@camila-ubt](https://github.com/camila-ubt).