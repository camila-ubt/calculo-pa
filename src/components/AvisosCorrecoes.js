"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AvisosCorrecoes.module.css";

const campos = "id,data,loja,vendas_antes,pecas_antes,vendas_depois,pecas_depois,motivo,corrigido_por_nome,criado_em";

export default function AvisosCorrecoes({ supabase, usuarioId, onAbrir }) {
  const [avisos, setAvisos] = useState([]);
  const [total, setTotal] = useState(0);
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(null);
  const [revisao, setRevisao] = useState(0);
  const emLeitura = useRef(false);

  useEffect(() => {
    let ativo = true;
    let buscando = false;
    async function carregar() {
      if (buscando || document.visibilityState === "hidden") return;
      buscando = true;
      try {
        const { data, count, error } = await supabase.from("correcoes_pa")
          .select(campos, { count: "exact" }).eq("usuario_id", usuarioId).is("lida_em", null)
          .order("criado_em", { ascending: false }).limit(20);
        if (!ativo) return;
        if (error) throw error;
        setAvisos(data || []);
        setTotal(count ?? data?.length ?? 0);
        setErro("");
      } catch {
        if (ativo) setErro("Não foi possível atualizar os avisos da gestão.");
      } finally { buscando = false; }
    }
    carregar();
    const intervalo = window.setInterval(carregar, 60000);
    window.addEventListener("focus", carregar);
    document.addEventListener("visibilitychange", carregar);
    return () => {
      ativo = false;
      clearInterval(intervalo);
      window.removeEventListener("focus", carregar);
      document.removeEventListener("visibilitychange", carregar);
    };
  }, [supabase, usuarioId, revisao]);

  async function marcarLida(id) {
    if (emLeitura.current) return;
    emLeitura.current = true;
    setSalvando(id);
    setErro("");
    try {
      const { data, error } = await supabase.from("correcoes_pa")
        .update({ lida_em: new Date().toISOString() }).eq("id", id).eq("usuario_id", usuarioId)
        .select("id").single();
      if (error || !data) throw error || new Error();
      setRevisao((valor) => valor + 1);
    } catch {
      setErro("Não foi possível marcar o aviso como lido. Tente novamente.");
    } finally { emLeitura.current = false; setSalvando(null); }
  }

  if (!total && !erro) return null;
  return (
    <section className={styles.panel} aria-label="Correções da gestão">
      <div className={styles.heading}>
        <div role="status"><strong>Correções da gestão</strong>
          {total > 0 && <p>{total} {total === 1 ? "lançamento corrigido para conferir" : "lançamentos corrigidos para conferir"}.</p>}
        </div>
        {total > 0 && <button type="button" aria-expanded={aberto} onClick={() => setAberto(!aberto)}>
          {aberto ? "Recolher" : "Ver correções"}
        </button>}
      </div>
      {erro && <p role="alert">{erro} <button type="button" onClick={() => setRevisao((v) => v + 1)}>Tentar novamente</button></p>}
      {aberto && avisos.map((aviso) => (
        <article key={aviso.id} className={styles.notice}>
          <strong>{aviso.data.split("-").reverse().join("/")} · {aviso.loja}</strong>
          <p>Vendas: <b>{aviso.vendas_antes} → {aviso.vendas_depois}</b> · Peças: <b>{aviso.pecas_antes} → {aviso.pecas_depois}</b></p>
          <p><b>Motivo:</b> {aviso.motivo}</p>
          <small>Corrigido por {aviso.corrigido_por_nome} em {new Date(aviso.criado_em).toLocaleString("pt-BR")}</small>
          <div className={styles.actions}>
            <button type="button" onClick={() => onAbrir(aviso)}>Carregar dia corrigido</button>
            <button type="button" disabled={Boolean(salvando)} onClick={() => marcarLida(aviso.id)}>
              {salvando === aviso.id ? "Salvando..." : "Marcar como lido"}
            </button>
          </div>
        </article>
      ))}
      {aberto && total > avisos.length && <p>Mostrando {avisos.length} de {total} avisos. Ao marcar como lidos, os próximos aparecem aqui.</p>}
    </section>
  );
}
