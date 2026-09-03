export function premioDoMes(valorPa, diasValidos, ultimoDiaPreenchido) {
  if (!ultimoDiaPreenchido) return { valor: 0, mensagem: "A premiação aparece após preencher o último dia do mês." };
  if (diasValidos < 15) return { valor: 0, mensagem: "Sem premiação: mínimo de 15 dias trabalhados não atingido." };
  if (valorPa >= 2.6) return { valor: 150, mensagem: "Premiação prevista: R$ 150 em peças" };
  if (valorPa >= 2.2) return { valor: 100, mensagem: "Premiação prevista: R$ 100 em peças" };
  return { valor: 0, mensagem: "Sem premiação neste mês." };
}
