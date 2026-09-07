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

### Painel no desktop

Lançamento diário com cálculo do PA, calendário, histórico e resumo mensal. Na captura de agosto de 2026, a premiação está aguardando conferência e aprovação.

![Painel do Cálculo PA no desktop com lançamento, calendário, histórico e resumo de agosto de 2026](./docs/imagens/painel-desktop.jpg)

### Regras de premiação

Consulta às faixas de PA, quantidade mínima de dias trabalhados e condições para aprovação da premiação.

![Janela com as regras e faixas de premiação do Cálculo PA](./docs/imagens/premiacao-desktop.jpg)

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
