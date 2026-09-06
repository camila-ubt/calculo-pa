import test from "node:test";
import assert from "node:assert/strict";
import { calendarioDoMes } from "./calendario.mjs";

test("counts only missing dates through today, including today", () => {
  const result = calendarioDoMes("2026-09", [
    { data: "2026-09-01", situacao: "trabalhado", lancamentos_pa: [{ vendas: 0, pecas: 0 }] },
    { data: "2026-09-02", situacao: "nao_trabalhou" },
    { data: "2026-09-03", situacao: "ferias" },
    { data: "2026-08-04", situacao: "trabalhado" },
  ], "2026-09-05");
  assert.equal(result.pendentes, 2);
  assert.equal(result.dias[0].estado, "lancado");
  assert.equal(result.dias[1].estado, "ausencia");
  assert.equal(result.dias[2].descricao, "Férias registradas");
  assert.equal(result.dias[4].estado, "pendente");
  assert.equal(result.dias[5].estado, "futuro");
});

test("handles leap years, weekday alignment and December rollover", () => {
  assert.equal(calendarioDoMes("2024-02", [], "2026-09-06").dias.length, 29);
  assert.equal(calendarioDoMes("2025-02", [], "2026-09-06").pendentes, 28);
  assert.equal(calendarioDoMes("2026-09", [], "2026-09-06").inicio, 2);
  assert.equal(calendarioDoMes("2026-12", [], "2027-01-01").dias.at(-1).data, "2026-12-31");
});

test("future vacation stays recorded but cannot be selected; future month has no pending days", () => {
  const result = calendarioDoMes("2026-10", [{ data: "2026-10-03", situacao: "ferias" }], "2026-09-06");
  assert.equal(result.pendentes, 0);
  assert.equal(result.dias[2].estado, "ausencia");
  assert.equal(result.dias[2].futuro, true);
});

test("legacy absence statuses count as filled and deleted records become pending", () => {
  for (const situacao of ["folga", "falta", "atestado"]) {
    assert.equal(calendarioDoMes("2026-09", [{ data: "2026-09-01", situacao }], "2026-09-01").pendentes, 0);
  }
  assert.equal(calendarioDoMes("2026-09", [], "2026-09-01").pendentes, 1);
  assert.deepEqual(calendarioDoMes("", [], "2026-09-01").dias, []);
});
