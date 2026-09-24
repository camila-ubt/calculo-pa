## v1.2.0 — Segurança da autenticação e atualizações técnicas

Publicada em **24 de setembro de 2026**.

Esta versão reforça os fluxos de autenticação do Cálculo PA e atualiza dependências de aplicação e segurança, sem alterar as regras de cálculo do PA ou da premiação.

### Segurança da autenticação

- limite de tentativas consecutivas em login, cadastro e troca de senha;
- bloqueio temporário após excesso de falhas;
- criação e redefinição de senha com mínimo de 8 caracteres, incluindo letra maiúscula, minúscula e número;
- correção do campo de confirmação da nova senha.

### Dependências e qualidade

- Next.js atualizado de 16.3.4 para 16.3.5;
- ESLint Config Next atualizado de 16.3.4 para 16.3.5;
- ações do GitHub CodeQL atualizadas de 4.37.9 para 4.38.1;
- verificações automatizadas de segurança e qualidade concluídas com sucesso.

### Regras preservadas

- fórmula do PA permanece inalterada;
- faixas e critérios de premiação permanecem inalterados;
- fluxos de lançamento, conferência e aprovação permanecem inalterados.
