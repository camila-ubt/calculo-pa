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

## Capturas do sistema

As capturas de tela ainda não estão disponíveis no repositório. Para documentar o sistema, salve as imagens em `docs/imagens/`, com os seguintes nomes:

| Tela | O que capturar | Arquivo |
| --- | --- | --- |
| Login | Formulário de acesso ao sistema. | `login.png` |
| Lançamento diário | Data, loja, vendas, peças e PA calculado. | `lancamento-diario.png` |
| Calendário e histórico | Visão mensal com os dias registrados e seus lançamentos. | `calendario-historico.png` |
| Resumo do mês | Totais de vendas, peças e PA por loja. | `resumo-mensal.png` |
| Premiação | Regras, resultado mensal e status de aprovação. | `premiacao.png` |
| Conferência administrativa | Seleção de loja e detalhamento dos resultados para conferência. | `conferencia-administrativa.png` |

Use dados fictícios nas capturas. Quando os arquivos estiverem disponíveis, exiba cada imagem nesta seção com uma legenda e um caminho relativo, como `![Tela de login do Cálculo PA](./docs/imagens/login.png)`.

## Tecnologias

- Next.js
- JavaScript
- Supabase
- PostgreSQL
- Vercel

## Segurança

O projeto usa autenticação individual, políticas de **Row Level Security (RLS)** e separação de permissões entre vendedoras e administração. Variáveis sensíveis ficam fora do repositório e devem ser configuradas no ambiente de execução.

## Documentação

📚 **[Acessar a Wiki completa do Cálculo PA](https://github.com/camila-ubt/calculo-pa/wiki)**

A documentação detalhada de funcionamento, banco de dados, regras de negócio, segurança, configuração e manutenção também está versionada em [`docs/wiki`](./docs/wiki/Home.md).

## Versão

**v1.1.0**

Desenvolvido por [@camila-ubt](https://github.com/camila-ubt).
