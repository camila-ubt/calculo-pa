import test from "node:test";
import assert from "node:assert/strict";
import {
  AUTH_RATE_LIMIT_BLOCK_MS,
  AUTH_RATE_LIMIT_MAX_ATTEMPTS,
  limparRateLimitAuth,
  obterBloqueioRateLimitAuth,
  registrarFalhaRateLimitAuth,
  validarSenhaSegura,
} from "./authRateLimit.mjs";

function memoria() {
  const dados = new Map();
  return {
    getItem: (chave) => dados.has(chave) ? dados.get(chave) : null,
    setItem: (chave, valor) => dados.set(chave, String(valor)),
  };
}

test("senha exige 8 caracteres, maiúscula, minúscula e número", () => {
  assert.ok(validarSenhaSegura("Abc123"));
  assert.ok(validarSenhaSegura("abcdefgh"));
  assert.ok(validarSenhaSegura("ABCDEFG1"));
  assert.ok(validarSenhaSegura("Abcdefgh"));
  assert.equal(validarSenhaSegura("Senha123"), "");
});

test("rate limit bloqueia após cinco falhas e expira", () => {
  const storage = memoria();
  const inicio = 1_000_000;

  for (let tentativa = 0; tentativa < AUTH_RATE_LIMIT_MAX_ATTEMPTS; tentativa += 1) {
    registrarFalhaRateLimitAuth("login", "PESSOA@EXEMPLO.COM", storage, inicio + tentativa);
  }

  const bloqueio = obterBloqueioRateLimitAuth("login", "pessoa@exemplo.com", storage, inicio + 10);
  assert.ok(bloqueio > 0);
  assert.ok(bloqueio <= AUTH_RATE_LIMIT_BLOCK_MS);

  assert.equal(
    obterBloqueioRateLimitAuth("login", "pessoa@exemplo.com", storage, inicio + AUTH_RATE_LIMIT_BLOCK_MS + 100),
    0
  );
});

test("sucesso limpa o contador", () => {
  const storage = memoria();
  registrarFalhaRateLimitAuth("cadastro", "pessoa@exemplo.com", storage, 10);
  limparRateLimitAuth("cadastro", "pessoa@exemplo.com", storage);
  assert.equal(obterBloqueioRateLimitAuth("cadastro", "pessoa@exemplo.com", storage, 20), 0);
});
