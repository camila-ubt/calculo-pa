# Uso pela vendedora

## Cadastro

O cadastro solicita:

- nome;
- número de vendedora no Athos;
- e-mail;
- senha;
- confirmação da senha.

O número do Athos deve ser inteiro entre **1 e 18** e precisa estar disponível. A senha deve ter pelo menos **6 caracteres**.

Dependendo da configuração do Supabase Auth, a usuária pode precisar confirmar o e-mail antes do primeiro login.

## Login

O acesso é feito com e-mail e senha. Usuárias sem perfil liberado recebem mensagem de acesso pendente. Perfis inativos recebem mensagem de acesso suspenso.

## Recuperação de senha

O fluxo de recuperação é integrado ao ambiente compartilhado com o Líder Metas. Após redefinir a senha, a sessão é encerrada e a usuária entra novamente com a nova senha.

## Fazer um lançamento

1. Escolha a data.
2. Marque a situação do dia.
3. Se estiver trabalhando, selecione a loja ou as lojas.
4. Informe vendas e peças de cada loja.
5. Confira o PA calculado automaticamente.
6. Salve o lançamento.

## Regras dos campos

- vendas e peças aceitam apenas números inteiros;
- valores permitidos: 0 a 999;
- peças nunca podem ser menores que vendas;
- pelo menos uma loja deve ser selecionada em dia trabalhado;
- vendas e peças precisam estar preenchidas para todas as lojas selecionadas.

## Editar um dia

Ao abrir um dia já registrado, os dados são carregados no formulário. Ao salvar novamente, o sistema atualiza o dia e substitui os lançamentos daquele dia pelos novos valores.

## Remover lançamento

A remoção apaga o dia e seus lançamentos associados. O sistema pede confirmação antes da exclusão. Depois da remoção, aquele dia deixa de contar no PA mensal.

## Férias

Ao selecionar férias, informe início e fim. O sistema cria ou atualiza todos os dias do período como férias e remove eventuais lançamentos de vendas/peças dessas datas.