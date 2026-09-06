# calculo-pa

Aplicação web para cálculo e acompanhamento do PA das vendedoras, com lançamentos por loja, histórico mensal, premiação e integração com o Líder Metas.

## Painel responsivo e ativação

A página pública continua mostrando **Em desenvolvimento** por padrão. O painel
anterior ao aviso (commit `a91b1a7`) foi preservado em `src/components/PainelPA.js`,
com o layout atualizado e os fluxos de login, lançamento e cálculo existentes.

Para revisar o painel em um ambiente configurado, defina `PA_PAINEL_ATIVO=true`
no servidor antes de iniciar ou compilar a aplicação. Também são necessárias as
variáveis existentes `NEXT_PUBLIC_SUPABASE_URL` e
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. O painel continua exigindo login e perfil
ativo. Não existe rota pública de demonstração nem bypass de autenticação.
Após concluir os ajustes de acesso, a mesma variável permite ativar o painel;
remova-a e gere um novo build para voltar ao aviso.

O container do painel usa até 1600px. A partir de 1100px, lançamento e resumo
ficam lado a lado, com conferência abaixo do lançamento e premiação abaixo do resumo. Em tablets, o lançamento
ocupa a largura inteira e resumo/premiação compartilham uma linha. Até 760px,
os blocos ficam em uma coluna. O histórico inicia aberto e pode ser recolhido;
as regras expandem dentro do próprio card, sem cobrir os campos.

## Integração

O projeto usa o mesmo Supabase do **Líder Metas** como banco central e autenticação.

## Acesso das vendedoras

Cada vendedora possui login individual por e-mail e senha. No cadastro, são registrados:

- nome;
- número de vendedora no sistema Athos;
- e-mail;
- senha.

O número Athos fica vinculado ao perfil para facilitar a conferência dos resultados no Líder Metas.

## Lançamentos

Cada dia pode ser marcado como:

- trabalhado;
- folga;
- falta;
- atestado;
- férias.

Em dias trabalhados, são informadas vendas e peças por loja. O PA é calculado automaticamente por `peças / vendas`.

## Premiação

- mínimo de 15 dias válidos no mês;
- PA de 2,20 a 2,59: R$ 100 em peças;
- PA igual ou superior a 2,60: R$ 150 em peças;
- a premiação só aparece após o fechamento do mês.

## Banco

As tabelas específicas do PA ficam no banco do Líder Metas:

- `usuarios_pa`;
- `dias_pa`;
- `lancamentos_pa`.

A estrutura usa RLS para limitar o acesso das vendedoras aos próprios registros, mantendo acesso administrativo para conferência.
