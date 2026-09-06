# Segurança e permissões

## Autenticação

O sistema usa **Supabase Auth**. Dados do PA não devem ser acessados sem sessão autenticada.

## Perfis

Existem dois tipos:

### Vendedora
Pode consultar e alterar apenas os próprios dias e lançamentos.

### Admin
Pode consultar os registros de todas as usuárias e executar operações administrativas autorizadas.

## Row Level Security (RLS)

As tabelas `usuarios_pa`, `dias_pa`, `lancamentos_pa` e `aprovacoes_premiacao_pa` usam RLS.

As policies verificam o `auth.uid()` e a propriedade do registro antes de permitir leitura ou escrita.

## Helper administrativo privado

A verificação de administrador foi movida para o schema `private`, evitando expor a função como RPC pública pelo PostgREST.

A função só pode ser executada pelo papel `authenticated` quando utilizada pelas policies.

## Defesa em profundidade

Além da RLS:

- permissões do papel `anon` são removidas das tabelas de PA;
- sequences relacionadas ao PA deixam de conceder acesso anônimo;
- funções internas de trigger não ficam executáveis diretamente por usuários;
- objetos administrativos de produção também têm grants anônimos removidos;
- variáveis sensíveis não ficam no repositório.

## Segurança do repositório

O projeto possui:

- `.env.example` sem credenciais reais;
- `.gitignore` para evitar publicação de arquivos locais sensíveis;
- `SECURITY.md`;
- GitHub CodeQL;
- workflow de verificação de segurança;
- Dependabot;
- CODEOWNERS.

## Regra importante

A chave pública/anon do Supabase pode existir no frontend, mas **não deve ser tratada como mecanismo de autorização**. A proteção real dos dados está nas policies RLS e nos grants do PostgreSQL.