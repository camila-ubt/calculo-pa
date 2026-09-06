export function calendarioDoMes(mes, dias, hoje) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) return { dias: [], inicio: 0, pendentes: 0 };
  const [ano, numeroMes] = mes.split("-").map(Number);
  const quantidade = new Date(Date.UTC(ano, numeroMes, 0)).getUTCDate();
  const registros = new Map(dias.map((dia) => [dia.data, dia]));
  const calendario = Array.from({ length: quantidade }, (_, indice) => {
    const data = `${mes}-${String(indice + 1).padStart(2, "0")}`;
    const registro = registros.get(data);
    const futuro = data > hoje;
    const estado = registro
      ? registro.situacao === "trabalhado" ? "lancado" : "ausencia"
      : futuro ? "futuro" : "pendente";
    const descricao = registro
      ? registro.situacao === "trabalhado" ? "Lançado" : registro.situacao === "ferias" ? "Férias registradas" : "Não trabalhou · registrado"
      : futuro ? "Dia futuro" : "Falta lançar";
    return { data, numero: indice + 1, estado, descricao, futuro };
  });
  return {
    dias: calendario,
    inicio: new Date(Date.UTC(ano, numeroMes - 1, 1)).getUTCDay(),
    pendentes: calendario.filter((dia) => dia.estado === "pendente").length,
  };
}
