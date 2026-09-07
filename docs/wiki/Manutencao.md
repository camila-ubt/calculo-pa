# Manutenção e evolução

## Ao alterar regras de PA

Sempre revisar em conjunto:

1. cálculo no frontend;
2. função de premiação;
3. constraints/triggers do banco;
4. textos exibidos às usuárias;
5. testes;
6. esta Wiki.

## Ao alterar o banco

Mudanças estruturais devem ser registradas em nova migration dentro de `supabase/migrations`.

Evite editar migrations antigas já aplicadas em produção. Uma nova migration mantém histórico e reprodutibilidade.

## Ao incluir nova situação de dia

Verificar:

- constraint de `dias_pa.situacao`;
- normalização na interface;
- contagem de dias válidos;
- comportamento de lançamentos associados;
- impacto sobre premiação.

## Ao alterar premiação

Os pontos principais ficam em `src/lib/premiacao.mjs` e na lógica de resumo mensal do painel.

Qualquer alteração de faixa deve ter teste para:

- abaixo do mínimo;
- exatamente 2,20;
- entre as faixas;
- exatamente 2,60;
- menos de 15 dias;
- último dia do mês não preenchido.

## Validações críticas

Nunca remover sem substituição equivalente:

- bloqueio de datas futuras;
- vendas/peças não negativas;
- peças >= vendas;
- RLS;
- separação entre vendedora e admin;
- aprovação administrativa da premiação.

## Publicação

Antes de publicar uma nova versão:

- executar lint e testes;
- conferir migrations;
- revisar variáveis de ambiente;
- confirmar que nenhum segredo foi commitado;
- validar o fluxo de login;
- testar lançamento, edição e exclusão;
- testar fechamento mensal e premiação;
- revisar a área administrativa;
- atualizar release e documentação.

## Versão estável na Wiki

A página inicial e o rodapé da Wiki mostram automaticamente a release estável marcada como mais recente no GitHub. A automação consulta `releases/latest`, sem usar rascunhos ou pré-releases. O histórico de releases e os textos das regras continuam sendo revisados manualmente.

A publicação roda quando a documentação muda, quando uma release é publicada, editada ou excluída e após o sucesso da automação **Publicar release**. Também pode ser executada manualmente em **Actions → Publicar Wiki → Run workflow**. Os blocos entre `versao-estavel:inicio` e `versao-estavel:fim` são preenchidos no momento da publicação; preserve esses marcadores nos arquivos de origem.

Se não houver nenhuma release estável disponível, a publicação falha antes de alterar a Wiki.

## Referências do projeto

- Repositório: `camila-ubt/calculo-pa`
- Produção: `https://calculo-pa.vercel.app`
- Autoria: `@camila-ubt`
