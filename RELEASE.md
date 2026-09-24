## v1.3.1 — Bloqueio de perfis inativos no banco

Publicada em **24 de setembro de 2026**.

Esta versão registra o endurecimento das permissões do Cálculo PA aplicado no Supabase.

### Segurança do banco

- vendedoras desativadas deixam de acessar os próprios dias e lançamentos mesmo quando ainda existe uma sessão autenticada válida;
- as policies de `dias_pa` e `lancamentos_pa` exigem que `usuarios_pa.ativo = true`;
- a validação de perfil ativo fica centralizada em helper privado utilizado pelas policies;
- administradores ativos continuam autorizados pelo helper administrativo existente;
- a migration aplicada no Supabase está versionada no repositório.

### Validação

- o comportamento foi testado com uma sessão autenticada: perfil ativo manteve acesso e o mesmo perfil simulado como inativo passou a visualizar zero registros;
- a simulação foi executada em transação revertida, sem alterar o estado real da usuária.

### Regras preservadas

- fórmula do PA permanece inalterada;
- faixas e critérios de premiação permanecem inalterados;
- fluxos de lançamento, conferência e aprovação permanecem inalterados.
