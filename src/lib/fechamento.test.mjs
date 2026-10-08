import test from "node:test";
import assert from "node:assert/strict";
import { dataNoMes, podeEditarPeriodo } from "./fechamento.mjs";

const aberto = {
  carregando: false,
  periodoCarregado: "vendedora:2026-10",
  usuarioId: "vendedora",
  mes: "2026-10",
  data: "2026-10-08",
  fechamento: { fechado: false },
};

test("só permite editar após confirmar o fechamento do mesmo mês e usuária", () => {
  assert.equal(podeEditarPeriodo(aberto), true);
  for (const alteracao of [
    { carregando: true },
    { periodoCarregado: null },
    { periodoCarregado: "outra:2026-10" },
    { periodoCarregado: "vendedora:2026-09" },
    { data: "2026-09-30" },
    { fechamento: null },
    { fechamento: {} },
    { fechamento: { fechado: true } },
  ]) {
    assert.equal(podeEditarPeriodo({ ...aberto, ...alteracao }), false);
  }
});

test("troca de mês bloqueia o estado anterior até a nova consulta terminar", () => {
  const setembro = { ...aberto, mes: "2026-09", data: "2026-09-01" };
  assert.equal(podeEditarPeriodo(setembro), false);
  assert.equal(podeEditarPeriodo({ ...setembro, periodoCarregado: "vendedora:2026-09", fechamento: { fechado: true } }), false);
  assert.equal(podeEditarPeriodo({ ...setembro, periodoCarregado: "vendedora:2026-09" }), true);
});

test("a data acompanha o filtro e preserva um dia selecionado no mesmo mês", () => {
  assert.equal(dataNoMes("2026-10-08", "2026-09", "2026-10-08"), "2026-09-01");
  assert.equal(dataNoMes("2026-09-30", "2026-10", "2026-10-08"), "2026-10-08");
  assert.equal(dataNoMes("2026-09-30", "2026-09", "2026-10-08"), "2026-09-30");
});
