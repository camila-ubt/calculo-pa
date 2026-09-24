## v1.3.0 — Reforço de segurança e sessões

Publicada em **24 de setembro de 2026**.

Esta versão reforça os fluxos de autenticação e a proteção do código da aplicação, sem alterar as regras de cálculo do PA ou da premiação.

### Autenticação

- proteção local de tentativas isolada em módulo próprio e coberta por testes;
- falhas de acesso ao armazenamento local não interrompem o login;
- mensagens de erro de cadastro e redefinição deixam de repassar detalhes internos do provedor;
- redefinição de senha solicita encerramento global das sessões.

### Repositório

- workflow de segurança passa a verificar padrões de chaves secretas no código da aplicação;
- testes automatizados adicionados para senha forte e bloqueio temporário;
- CodeQL, auditoria de dependências, lint e build permanecem ativos.

### Regras preservadas

- fórmula do PA permanece inalterada;
- faixas e critérios de premiação permanecem inalterados;
- fluxos de lançamento e conferência permanecem inalterados.

### Banco de dados

Nenhuma alteração de schema ou policy é aplicada nesta versão. O endurecimento adicional das policies de perfis desativados será tratado separadamente.
