const STORAGE_KEY = "pa_auth_rate_limit_v1";

export const AUTH_RATE_LIMIT_MAX_ATTEMPTS = 5;
export const AUTH_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
export const AUTH_RATE_LIMIT_BLOCK_MS = 15 * 60 * 1000;

function storagePadrao() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function chave(acao, identificador) {
  return `${acao}:${String(identificador || "geral").trim().toLowerCase()}`;
}

function ler(storage = storagePadrao()) {
  if (!storage) return {};
  try {
    const valor = JSON.parse(storage.getItem(STORAGE_KEY) || "{}");
    return valor && typeof valor === "object" && !Array.isArray(valor) ? valor : {};
  } catch {
    return {};
  }
}

function salvar(valor, storage = storagePadrao()) {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(valor));
  } catch {
    // A proteção local é complementar e não deve impedir a autenticação.
  }
}

export function limparRateLimitAuth(acao, identificador, storage = storagePadrao()) {
  const limite = ler(storage);
  delete limite[chave(acao, identificador)];
  salvar(limite, storage);
}

export function obterBloqueioRateLimitAuth(acao, identificador, storage = storagePadrao(), agora = Date.now()) {
  const limite = ler(storage);
  const id = chave(acao, identificador);
  const atual = limite[id];

  if (!atual?.bloqueadoAte) return 0;
  if (atual.bloqueadoAte <= agora) {
    delete limite[id];
    salvar(limite, storage);
    return 0;
  }

  return atual.bloqueadoAte - agora;
}

export function registrarFalhaRateLimitAuth(acao, identificador, storage = storagePadrao(), agora = Date.now()) {
  const limite = ler(storage);
  const id = chave(acao, identificador);
  const atual = limite[id];
  const mesmaJanela = atual && agora - atual.inicioJanela < AUTH_RATE_LIMIT_WINDOW_MS;
  const tentativas = mesmaJanela ? atual.tentativas + 1 : 1;
  const inicioJanela = mesmaJanela ? atual.inicioJanela : agora;
  const bloqueadoAte = tentativas >= AUTH_RATE_LIMIT_MAX_ATTEMPTS
    ? agora + AUTH_RATE_LIMIT_BLOCK_MS
    : null;

  limite[id] = { tentativas, inicioJanela, bloqueadoAte };
  salvar(limite, storage);

  return {
    bloqueadoAte,
    tentativasRestantes: Math.max(AUTH_RATE_LIMIT_MAX_ATTEMPTS - tentativas, 0),
  };
}

export function formatarTempoEspera(msRestantes) {
  const segundos = Math.max(1, Math.ceil(msRestantes / 1000));
  if (segundos >= 60) {
    const minutos = Math.ceil(segundos / 60);
    return `${minutos} minuto${minutos === 1 ? "" : "s"}`;
  }
  return `${segundos} segundo${segundos === 1 ? "" : "s"}`;
}

export function validarSenhaSegura(senha) {
  const valor = String(senha || "");
  if (valor.length < 8) return "A senha precisa ter pelo menos 8 caracteres (pode ser só números).";

  // Permite senhas numéricas sem alterar o login ou as senhas já cadastradas.
  if (/^[0-9]+$/.test(valor)) {
    const repetidos = /^(\d)\1+$/.test(valor);
    const sequencia = "0123456789".includes(valor) || "9876543210".includes(valor);
    if (repetidos || sequencia) return "Evite números repetidos ou sequências como 12345678.";
    return "";
  }

  if (!/[a-zà-ÿ]/.test(valor) || !/[A-ZÀ-Ý]/.test(valor) || !/\d/.test(valor)) {
    return "Use 8 números ou uma senha com letra maiúscula, minúscula e número.";
  }
  return "";
}
