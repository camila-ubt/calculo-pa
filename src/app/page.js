"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function hojeLocal() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
}

function inicioMes(mes) {
  return `${mes}-01`;
}

function fimMes(mes) {
  const [ano, numeroMes] = mes.split("-").map(Number);
  return `${ano}-${String(numeroMes).padStart(2, "0")}-${String(new Date(ano, numeroMes, 0).getDate()).padStart(2, "0")}`;
}

function mesFechado(mes) {
  return mes < hojeLocal().slice(0, 7);
}

function pa(pecas, vendas) {
  if (!vendas) return 0;
  return pecas / vendas;
}

function premioDoMes(valorPa, diasValidos, fechado) {
  if (!fechado) return "A premiação aparece após o fechamento do mês.";
  if (diasValidos < 15) return "Sem premiação: mínimo de 15 dias trabalhados não atingido.";
  if (valorPa >= 2.6) return "Premiação: R$ 150 em peças";
  if (valorPa >= 2.2) return "Premiação: R$ 100 em peças";
  return "Sem premiação neste mês.";
}

const situacoes = [
  ["trabalhado", "Trabalhado"],
  ["folga", "Folga"],
  ["falta", "Falta"],
  ["atestado", "Atestado"],
  ["ferias", "Férias"],
];

export default function Home() {
  const supabase = useMemo(() => createClient(), []);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sessao, setSessao] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [login, setLogin] = useState({ email: "", senha: "" });
  const [mes, setMes] = useState(hojeLocal().slice(0, 7));
  const [lojas, setLojas] = useState([]);
  const [dias, setDias] = useState([]);
  const [form, setForm] = useState({
    data: hojeLocal(),
    situacao: "trabalhado",
    observacao: "",
    lojas: {},
  });

  useEffect(() => {
    async function iniciar() {
      const { data } = await supabase.auth.getSession();
      setSessao(data.session);
      if (data.session) await carregarPerfil(data.session.user.id);
      setCarregando(false);
    }

    iniciar();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_evento, novaSessao) => {
      setSessao(novaSessao);
      if (novaSessao) await carregarPerfil(novaSessao.user.id);
      else setPerfil(null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (sessao && perfil?.ativo) carregarDados();
  }, [sessao, perfil, mes]);

  async function carregarPerfil(id) {
    const { data, error } = await supabase
      .from("usuarios_pa")
      .select("id,nome,tipo_usuario,ativo")
      .eq("id", id)
      .single();

    if (error) {
      setPerfil(null);
      setMensagem("Seu acesso ao Cálculo PA ainda não foi liberado.");
      return;
    }

    setPerfil(data);
  }

  async function carregarDados() {
    setCarregando(true);
    setMensagem("");

    const [lojasResp, diasResp] = await Promise.all([
      supabase.from("lojas").select("*").eq("ativa", true).order("ordem"),
      supabase
        .from("dias_pa")
        .select("id,data,situacao,observacao,lancamentos_pa(id,loja_id,vendas,pecas)")
        .eq("usuario_id", sessao.user.id)
        .gte("data", inicioMes(mes))
        .lte("data", fimMes(mes))
        .order("data", { ascending: false }),
    ]);

    const erro = lojasResp.error || diasResp.error;
    if (erro) setMensagem(erro.message);

    const lojasAtivas = lojasResp.data || [];
    setLojas(lojasAtivas);
    setDias(diasResp.data || []);

    setForm((atual) => ({
      ...atual,
      lojas: lojasAtivas.reduce((acc, loja) => {
        acc[loja.id] = atual.lojas[loja.id] || { vendas: "", pecas: "" };
        return acc;
      }, {}),
    }));
    setCarregando(false);
  }

  async function entrar(evento) {
    evento.preventDefault();
    setMensagem("");
    const { error } = await supabase.auth.signInWithPassword({
      email: login.email,
      password: login.senha,
    });
    if (error) setMensagem("E-mail ou senha incorretos.");
  }

  async function sair() {
    await supabase.auth.signOut();
  }

  function alterarLoja(lojaId, campo, valor) {
    const numero = valor === "" ? "" : Math.max(0, Number.parseInt(valor, 10) || 0);
    setForm((atual) => ({
      ...atual,
      lojas: {
        ...atual.lojas,
        [lojaId]: {
          ...(atual.lojas[lojaId] || { vendas: "", pecas: "" }),
          [campo]: numero,
        },
      },
    }));
  }

  function abrirDia(dia) {
    const valores = lojas.reduce((acc, loja) => {
      const registro = (dia.lancamentos_pa || []).find((item) => Number(item.loja_id) === Number(loja.id));
      acc[loja.id] = {
        vendas: registro?.vendas ?? "",
        pecas: registro?.pecas ?? "",
      };
      return acc;
    }, {});

    setForm({
      data: dia.data,
      situacao: dia.situacao,
      observacao: dia.observacao || "",
      lojas: valores,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvarDia(evento) {
    evento.preventDefault();
    setSalvando(true);
    setMensagem("");

    const { data: diaSalvo, error: erroDia } = await supabase
      .from("dias_pa")
      .upsert(
        {
          usuario_id: sessao.user.id,
          data: form.data,
          situacao: form.situacao,
          observacao: form.observacao.trim() || null,
        },
        { onConflict: "usuario_id,data" }
      )
      .select("id")
      .single();

    if (erroDia) {
      setMensagem(erroDia.message);
      setSalvando(false);
      return;
    }

    if (form.situacao === "trabalhado") {
      const registros = lojas.map((loja) => ({
        dia_id: diaSalvo.id,
        loja_id: loja.id,
        vendas: Number(form.lojas[loja.id]?.vendas || 0),
        pecas: Number(form.lojas[loja.id]?.pecas || 0),
      }));

      const { error } = await supabase
        .from("lancamentos_pa")
        .upsert(registros, { onConflict: "dia_id,loja_id" });

      if (error) {
        setMensagem(error.message);
        setSalvando(false);
        return;
      }
    } else {
      const { error } = await supabase.from("lancamentos_pa").delete().eq("dia_id", diaSalvo.id);
      if (error) {
        setMensagem(error.message);
        setSalvando(false);
        return;
      }
    }

    setMensagem("Lançamento salvo com sucesso.");
    await carregarDados();
    setSalvando(false);
  }

  const totaisForm = useMemo(() => {
    if (form.situacao !== "trabalhado") return { vendas: 0, pecas: 0, pa: 0 };
    const valores = Object.values(form.lojas);
    const vendas = valores.reduce((soma, item) => soma + Number(item.vendas || 0), 0);
    const pecas = valores.reduce((soma, item) => soma + Number(item.pecas || 0), 0);
    return { vendas, pecas, pa: pa(pecas, vendas) };
  }, [form]);

  const resumoMes = useMemo(() => {
    const trabalhados = dias.filter((dia) => dia.situacao === "trabalhado");
    let vendas = 0;
    let pecas = 0;

    trabalhados.forEach((dia) => {
      (dia.lancamentos_pa || []).forEach((item) => {
        vendas += Number(item.vendas || 0);
        pecas += Number(item.pecas || 0);
      });
    });

    return {
      diasValidos: trabalhados.length,
      vendas,
      pecas,
      pa: pa(pecas, vendas),
    };
  }, [dias]);

  if (carregando && !sessao) {
    return <main className="loginPage"><p>Carregando...</p></main>;
  }

  if (!sessao) {
    return (
      <main className="loginPage">
        <section className="card loginCard">
          <p className="muted">Área das vendedoras</p>
          <h1>Meu PA</h1>
          <p className="muted">Entre para lançar suas vendas e peças de cada loja.</p>
          <form className="formStack" onSubmit={entrar}>
            <label>
              E-mail
              <input type="email" required value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
            </label>
            <label>
              Senha
              <input type="password" required value={login.senha} onChange={(e) => setLogin({ ...login, senha: e.target.value })} />
            </label>
            <button className="primary" type="submit">Entrar</button>
          </form>
          {mensagem && <p className="message">{mensagem}</p>}
        </section>
      </main>
    );
  }

  if (!perfil) {
    return (
      <main>
        <section className="card">
          <h1>Acesso pendente</h1>
          <p>{mensagem || "Seu usuário existe, mas ainda não está habilitado para o Cálculo PA."}</p>
          <button className="secondary" type="button" onClick={sair}>Sair</button>
        </section>
      </main>
    );
  }

  return (
    <main>
      <header className="header">
        <div>
          <p className="muted">Olá, {perfil.nome}</p>
          <h1>Meu PA</h1>
        </div>
        <div className="headerActions">
          <label>
            Mês
            <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
          </label>
          <button className="secondary" type="button" onClick={sair}>Sair</button>
        </div>
      </header>

      <section className="summaryGrid" aria-label="Resumo do mês">
        <div className="metric"><span>Dias válidos</span><strong>{resumoMes.diasValidos}</strong></div>
        <div className="metric"><span>Vendas</span><strong>{resumoMes.vendas}</strong></div>
        <div className="metric"><span>Peças</span><strong>{resumoMes.pecas}</strong></div>
        <div className="metric"><span>PA</span><strong>{resumoMes.pa.toFixed(2).replace(".", ",")}</strong></div>
      </section>

      <div className="prize">{premioDoMes(resumoMes.pa, resumoMes.diasValidos, mesFechado(mes))}</div>
      {mensagem && <p className="message">{mensagem}</p>}

      <div className="grid2">
        <section className="card">
          <h2>Lançamento diário</h2>
          <form className="formStack" onSubmit={salvarDia}>
            <label>
              Data
              <input type="date" required value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            </label>
            <label>
              Situação do dia
              <select value={form.situacao} onChange={(e) => setForm({ ...form, situacao: e.target.value })}>
                {situacoes.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
              </select>
            </label>

            {form.situacao === "trabalhado" && (
              <div className="storeGrid">
                {lojas.map((loja) => {
                  const valores = form.lojas[loja.id] || { vendas: "", pecas: "" };
                  const valorPa = pa(Number(valores.pecas || 0), Number(valores.vendas || 0));
                  return (
                    <div className="storeRow" key={loja.id}>
                      <strong className="storeName">{loja.sigla || loja.nome}</strong>
                      <label>Vendas<input type="number" min="0" step="1" value={valores.vendas} onChange={(e) => alterarLoja(loja.id, "vendas", e.target.value)} /></label>
                      <label>Peças<input type="number" min="0" step="1" value={valores.pecas} onChange={(e) => alterarLoja(loja.id, "pecas", e.target.value)} /></label>
                      <div className="paBadge" title="PA da loja">{valorPa.toFixed(2).replace(".", ",")}</div>
                    </div>
                  );
                })}
                <p><strong>Total do dia:</strong> {totaisForm.vendas} vendas · {totaisForm.pecas} peças · PA {totaisForm.pa.toFixed(2).replace(".", ",")}</p>
              </div>
            )}

            <label>
              Observação
              <textarea value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} placeholder="Opcional" />
            </label>
            <button className="primary" type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar lançamento"}</button>
          </form>
        </section>

        <section className="card">
          <h2>Histórico do mês</h2>
          {carregando ? <p>Carregando...</p> : dias.length === 0 ? <p className="muted">Nenhum lançamento neste mês.</p> : (
            <div className="history">
              {dias.map((dia) => {
                const vendas = (dia.lancamentos_pa || []).reduce((soma, item) => soma + Number(item.vendas || 0), 0);
                const pecas = (dia.lancamentos_pa || []).reduce((soma, item) => soma + Number(item.pecas || 0), 0);
                return (
                  <button className="historyItem secondary" type="button" key={dia.id} onClick={() => abrirDia(dia)}>
                    <strong>{dia.data.split("-").reverse().join("/")}</strong>
                    <span>{situacoes.find(([valor]) => valor === dia.situacao)?.[1] || dia.situacao}</span>
                    <span>{dia.situacao === "trabalhado" ? `${vendas} vendas · ${pecas} peças · PA ${pa(pecas, vendas).toFixed(2).replace(".", ",")}` : "Não conta como dia trabalhado"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
