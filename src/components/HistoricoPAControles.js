"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import "./historico-pa-controles.css";

function inicioMes(mes) {
  return `${mes}-01`;
}

function fimMes(mes) {
  const [ano, numeroMes] = mes.split("-").map(Number);
  const ultimoDia = new Date(ano, numeroMes, 0).getDate();
  return `${ano}-${String(numeroMes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
}

function chaveData(item) {
  const texto = item.querySelector("strong")?.textContent?.trim() || "";
  const [dia, mes, ano] = texto.split("/").map(Number);
  if (!ano || !mes || !dia) return 0;
  return ano * 10000 + mes * 100 + dia;
}

export default function HistoricoPAControles() {
  const supabase = useMemo(() => createClient(), []);
  const [host, setHost] = useState(null);
  const [mes, setMes] = useState("");
  const [lojaSelecionada, setLojaSelecionada] = useState("");
  const [ordem, setOrdem] = useState("recentes");
  const [resumos, setResumos] = useState([]);

  useEffect(() => {
    function sincronizar() {
      const painel = document.querySelector(".historyPanel");
      const filtro = painel?.querySelector(".historyFilter");
      const seletor = filtro?.querySelector("select");
      const campoMes = document.querySelector('.monthControl input[type="month"]');

      if (!painel || !filtro || !seletor) {
        setHost(null);
        return;
      }

      let destino = painel.querySelector("[data-historico-pa-controles]");
      if (!destino) {
        destino = document.createElement("div");
        destino.dataset.historicoPaControles = "true";
        filtro.insertAdjacentElement("afterend", destino);
      }

      setHost(destino);
      setMes(campoMes?.value || "");
      setLojaSelecionada(seletor.value || "");
    }

    sincronizar();
    document.addEventListener("change", sincronizar, true);
    const observer = new MutationObserver(sincronizar);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("change", sincronizar, true);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!host || !mes) return;
    let cancelado = false;

    async function carregarResumo() {
      const { data: auth } = await supabase.auth.getSession();
      const usuarioId = auth.session?.user?.id;
      if (!usuarioId) return;

      const [lojasResp, diasResp] = await Promise.all([
        supabase.from("lojas").select("id,nome,sigla,ordem").eq("ativa", true).order("ordem"),
        supabase
          .from("dias_pa")
          .select("data,situacao,lancamentos_pa(loja_id,vendas,pecas)")
          .eq("usuario_id", usuarioId)
          .gte("data", inicioMes(mes))
          .lte("data", fimMes(mes)),
      ]);

      if (cancelado || lojasResp.error || diasResp.error) return;

      const mapa = new Map(
        (lojasResp.data || []).map((loja) => [String(loja.id), {
          id: String(loja.id),
          nome: loja.sigla || loja.nome,
          vendas: 0,
          pecas: 0,
        }])
      );

      (diasResp.data || []).forEach((dia) => {
        if (dia.situacao !== "trabalhado") return;
        (dia.lancamentos_pa || []).forEach((item) => {
          const id = String(item.loja_id);
          if (!mapa.has(id)) mapa.set(id, { id, nome: `Loja ${id}`, vendas: 0, pecas: 0 });
          const resumo = mapa.get(id);
          resumo.vendas += Number(item.vendas || 0);
          resumo.pecas += Number(item.pecas || 0);
        });
      });

      setResumos([...mapa.values()]);
    }

    carregarResumo();
    return () => { cancelado = true; };
  }, [host, mes, supabase]);

  useEffect(() => {
    if (!host) return;
    const painel = host.closest(".historyPanel");
    if (!painel) return;

    function aplicarOrdenacao() {
      const itens = [...painel.querySelectorAll(".historyItem")];
      if (itens.length < 2) return;

      const ordenados = [...itens].sort((a, b) => {
        const diferenca = chaveData(a) - chaveData(b);
        return ordem === "antigos" ? diferenca : -diferenca;
      });

      const jaOrdenado = itens.every((item, indice) => item === ordenados[indice]);
      if (jaOrdenado) return;

      const pai = itens[0].parentElement;
      ordenados.forEach((item) => pai.appendChild(item));
    }

    aplicarOrdenacao();
    const observer = new MutationObserver(aplicarOrdenacao);
    observer.observe(painel, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [host, ordem]);

  if (!host) return null;

  const resumosVisiveis = lojaSelecionada
    ? resumos.filter((item) => item.id === lojaSelecionada)
    : resumos;

  return createPortal(
    <div className="historicoExtras">
      <div className="historicoOrdenacao" aria-label="Ordenar histórico">
        <span>Ordem</span>
        <div className="historicoOrdenacaoBotoes">
          <button
            type="button"
            className={ordem === "recentes" ? "ativo" : ""}
            onClick={() => setOrdem("recentes")}
          >
            Mais recentes
          </button>
          <button
            type="button"
            className={ordem === "antigos" ? "ativo" : ""}
            onClick={() => setOrdem("antigos")}
          >
            Mais antigos
          </button>
        </div>
      </div>

      {resumosVisiveis.length > 0 && (
        <div className="historicoResumoLojas" aria-label="Resumo por loja">
          {resumosVisiveis.map((item) => {
            const valorPA = item.vendas ? item.pecas / item.vendas : 0;
            return (
              <div className="historicoResumoLoja" key={item.id}>
                <strong>{item.nome}</strong>
                <span>{item.vendas} vendas · {item.pecas} peças</span>
                <b>PA {valorPA.toFixed(2).replace(".", ",")}</b>
              </div>
            );
          })}
        </div>
      )}
    </div>,
    host
  );
}
