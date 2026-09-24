# Histórico de versões

## v1.2.0 — Segurança da autenticação e atualizações técnicas

Publicada em **24 de setembro de 2026**.

- limite de tentativas em login, cadastro e troca de senha;
- bloqueio temporário após excesso de falhas de autenticação;
- senhas novas com mínimo de 8 caracteres, incluindo maiúscula, minúscula e número;
- correção do campo de confirmação da nova senha;
- Next.js e ESLint Config Next atualizados para 16.3.5;
- ações do GitHub CodeQL atualizadas para 4.38.1.

Esta versão não altera a fórmula do PA, as faixas de premiação nem os fluxos de lançamento e conferência.

## v1.1.2 — Manutenção técnica e compatibilidade

Publicada em **14 de setembro de 2026**.

- React e React DOM atualizados para 19.3.0;
- ESLint atualizado para a versão 10;
- configuração do lint ajustada para manter compatibilidade com o Next.js;
- verificações automatizadas de segurança e qualidade concluídas com sucesso.

Esta versão não altera a fórmula do PA, as faixas de premiação nem os fluxos de lançamento e conferência.

## v1.1.1 — Ajustes de cadastro e documentação visual

Publicada em **13 de setembro de 2026**.

- campo de cadastro renomeado de **Nome** para **Primeiro nome**, deixando mais claro o dado esperado;
- README atualizado com capturas reais do painel no desktop e das regras de premiação;
- automação da Wiki aprimorada para manter a versão estável mais recente sincronizada com as releases;
- atualização do `actions/checkout` utilizado nos workflows.

Esta versão não altera a fórmula do PA, as faixas de premiação nem as regras de conferência.

## v1.1.0 — Melhorias na apresentação da premiação, segurança e documentação

Publicada em **7 de setembro de 2026**.

- Regras da premiação apresentadas em modal e ajustes no resumo mensal.
- Aviso de segurança na tela de login.
- Cabeçalhos de segurança, análise CodeQL e verificações automatizadas de qualidade.
- Atualizações de dependências e política de segurança.
- Wiki completa com links corrigidos e histórico de versões.

Proteção da `main` verificada: PR obrigatório, sem bypass de administradores, bloqueio de exclusão e de sobrescrita forçada do histórico. Essa configuração pertence ao repositório, não ao pacote da aplicação.

## v1.0.0 — Primeira versão oficial

Publicada em 6 de setembro de 2026.

Lançamento inicial do aplicativo de cálculo e acompanhamento do PA.
