export function premioDoMes(valorPa, diasValidos, ultimoDiaPreenchido) {
  if (!ultimoDiaPreenchido) {
    return {
      valor: 0,
      mensagem: "A premiação é calculada após preencher o último dia do mês.",
    };
  }

  if (diasValidos < 15) {
    return {
      valor: 0,
      mensagem: "Sem premiação: mínimo de 15 dias trabalhados não atingido.",
    };
  }

  if (valorPa >= 2.6) {
    return {
      valor: 150,
      mensagem: "Premiação aguardando conferência e aprovação.",
    };
  }

  if (valorPa >= 2.2) {
    return {
      valor: 100,
      mensagem: "Premiação aguardando conferência e aprovação.",
    };
  }

  return {
    valor: 0,
    mensagem: "PA abaixo de 2,20: sem premiação neste mês.",
  };
}
