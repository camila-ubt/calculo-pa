export function dataNoMes(data, mes, hoje) {
  if (data?.slice(0, 7) === mes) return data;
  return hoje.slice(0, 7) === mes ? hoje : `${mes}-01`;
}

export function podeEditarPeriodo({ carregando, periodoCarregado, usuarioId, mes, data, fechamento }) {
  return !carregando
    && periodoCarregado === `${usuarioId}:${mes}`
    && data?.slice(0, 7) === mes
    && fechamento?.fechado === false;
}
