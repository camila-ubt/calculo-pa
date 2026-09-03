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

function formatarData(data) {
  if (!data) return "";
  return data.split("-").reverse().join("/");
}

function deslocarData(data, quantidadeDias) {
  if (!data) return hojeLocal();

  const [ano, mes, dia] = data.split("-").map(Number);
  const dataUtc = new Date(Date.UTC(ano, mes - 1, dia));
  dataUtc.setUTCDate(dataUtc.getUTCDate() + quantidadeDias);
  return dataUtc.toISOString().slice(0, 10);
}

function datasEntre(inicio, fim) {
  if (!inicio || !fim || fim < inicio) return [];

  const [anoInicio, mesInicio, diaInicio] = inicio.split("-").map(Number);
  const [anoFim, mesFim, diaFim] = fim.split("-").map(Number);
  const atual = new Date(Date.UTC(anoInicio, mesInicio - 1, diaInicio));
  const limite = new Date(Date.UTC(anoFim, mesFim - 1, diaFim));
  const datas = [];

  while (atual <= limite) {
    datas.push(atual.toISOString().slice(0, 10));
    atual.setUTCDate(atual.getUTCDate() + 1);
  }

  return datas;
}

function mapaLojas(lojas, registros = []) {
  return lojas.reduce((acc, loja) => {
    const registro = registros.find((item) => String(item.loja_id) === String(loja.id));
    acc[String(loja.id)] = {
      vendas: registro?.vendas ?? "",
      pecas: registro?.pecas ?? "",
    };
    return acc;
  }, {});
}

function formularioVazio(lojas, data = hojeLocal()) {
  return {
    data,
    situacao: "trabalhado",
    lojasSelecionadas: [],
    lojas: mapaLojas(lojas),
    feriasInicio: data,
    feriasFim: data,
  };
}

function normalizarSituacao(situacao) {
  if (["folga", "falta", "atestado"].includes(situacao)) return "nao_trabalhou";
  return situacao;
}

function formularioDoDia(dia, lojas) {
  const registros = dia?.lancamentos_pa || [];
  const situacao = normalizarSituacao(dia.situacao);

  return {
    data: dia.data,
    situacao,
    lojasSelecionadas: situacao === "trabalhado"
      ? registros.map((item) => String(item.loja_id))
      : [],
    lojas: mapaLojas(lojas, registros),
    feriasInicio: dia.data,
    feriasFim: dia.data,
  };
}

const situacoes = [
  ["trabalhado", "Trabalhando"],
  ["nao_trabalhou", "Não trabalhei"],
  ["ferias", "Férias"],
];

export default function Home() {
  const supabase = useMemo(() => createClient(), []);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [processandoAuth, setProcessandoAuth] = useState(false);
  const [sessao, setSessao] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [modoAuth, setModoAuth] = useState("entrar");
  const [recuperacaoSenha, setRecuperacaoSenha] = useState(false);
  const [login, setLogin] = useState({ email: "", senha: "" });
  const [cadastro, setCadastro] = useState({
    nome: "",
    numeroAthos: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [novaSenha, setNovaSenha] = useState({ senha: "", confirmarSenha: "" });
  const [mes, setMes] = useState(hojeLocal().slice(0, 7));
  const [lojas, setLojas] = useState([]);
  const [dias, setDias] = useState([]);
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [form, setForm] = useState(formularioVazio([]));

  useEffect(() => {
    async function iniciar() {
      if (typeof window !== "undefined") {
        const parametros = new URLSearchParams(window.location.search);
        if (parametros.get("recuperacao") === "1") setRecuperacaoSenha(true);
      }

      const { data } = await supabase.auth.getSession();
      setSessao(data.session);
      if (data.session && !recuperacaoSenha) await carregarPerfil(data.session.user.id);
      setCarregando(false);
    }

    iniciar();
    const { data: listener } = supabase.auth.onAuthStateChange(async (evento, novaSessao) => {
      setSessao(novaSessao);

      if (evento === "PASSWORD_RECOVERY") {
        setRecuperacaoSenha(true);
        setPerfil(null);
        return;
      }

      if (novaSessao && !recuperacaoSenha) await carregarPerfil(novaSessao.user.id);
      else if (!novaSessao) setPerfil(null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (sessao && perfil?.ativo && !recuperacaoSenha) carregarDados();
  }, [sessao, perfil, mes, recuperacaoSenha]);

  async function carregarPerfil(id) {
    const { data, error } = await supabase
      .from("usuarios_pa")
      .select("id,nome,numero_athos,tipo_usuario,ativo")
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
    const diasDoMes = diasResp.data || [];
    setLojas(lojasAtivas);
    setDias(diasDoMes);

    const hoje = hojeLocal();
    setForm((atual) => {
      if (atual.data !== hoje) {
        const diaSelecionado = diasDoMes.find((dia) => dia.data === atual.data);
        return diaSelecionado
          ? formularioDoDia(diaSelecionado, lojasAtivas)
          : formularioVazio(lojasAtivas, atual.data);
      }

      if (mes !== hoje.slice(0, 7)) return formularioVazio(lojasAtivas, hoje);

      const diaHoje = diasDoMes.find((dia) => dia.data === hoje);
      return diaHoje ? formularioDoDia(diaHoje, lojasAtivas) : formularioVazio(lojasAtivas, hoje);
    });

    setCarregando(false);
  }

  function trocarModoAuth(modo) {
    setMensagem("");
    setModoAuth(modo);
  }

  async function entrar(evento) {
    evento.preventDefault();
    setMensagem("");
    setProcessandoAuth(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: login.email.trim(),
      password: login.senha,
    });

    if (error) setMensagem("E-mail ou senha incorretos.");
    setProcessandoAuth(false);
  }

  async function criarConta(evento) {
    evento.preventDefault();
    setMensagem("");

    const numeroAthos = Number(cadastro.numeroAthos);
    if (!Number.isInteger(numeroAthos) || numeroAthos < 1 || numeroAthos > 18) {
      setMensagem("Escolha um número de vendedora no Athos entre 1 e 18.");
      return;
    }

    if (cadastro.senha.length < 6) {
      setMensagem("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (cadastro.senha !== cadastro.confirmarSenha) {
      setMensagem("As senhas não conferem.");
      return;
    }

    setProcessandoAuth(true);
    const { data, error } = await supabase.auth.signUp({
      email: cadastro.email.trim(),
      password: cadastro.senha,
      options: {
        data: {
          nome: cadastro.nome.trim(),
          numero_athos: numeroAthos,
        },
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });

    if (error) {
      const erroNumero = error.message.toLowerCase().includes("database") || error.message.toLowerCase().includes("duplicate");
      setMensagem(
        error.message.includes("already")
          ? "Já existe uma conta com este e-mail."
          : erroNumero
            ? "Esse número de vendedora no Athos já está em uso ou não está disponível. Escolha outro."
            : error.message
      );
      setProcessandoAuth(false);
      return;
    }

    setCadastro({
      nome: "",
      numeroAthos: "",
      email: "",
      senha: "",
      confirmarSenha: "",
    });

    if (data.session) {
      setMensagem("Conta criada com sucesso.");
    } else {
      setLogin((atual) => ({ ...atual, email: cadastro.email.trim(), senha: "" }));
      setModoAuth("entrar");
      setMensagem("Conta criada. Confira seu e-mail para confirmar o cadastro antes de entrar.");
    }

    setProcessandoAuth(false);
  }

  async function enviarRecuperacao(evento) {
    evento.preventDefault();
    setMensagem("");

    if (!login.email.trim()) {
      setMensagem("Informe seu e-mail.");
      return;
    }

    setProcessandoAuth(true);
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/?recuperacao=1` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(login.email.trim(), { redirectTo });

    if (error) setMensagem(error.message);
    else setMensagem("Enviamos um link para redefinir sua senha. Confira seu e-mail.");

    setProcessandoAuth(false);
  }

  async function salvarNovaSenha(evento) {
    evento.preventDefault();
    setMensagem("");

    if (novaSenha.senha.length < 6) {
      setMensagem("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha.senha !== novaSenha.confirmarSenha) {
      setMensagem("As senhas não conferem.");
      return;
    }

    setProcessandoAuth(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha.senha });

    if (error) {
      setMensagem(error.message);
      setProcessandoAuth(false);
      return;
    }

    await supabase.auth.signOut();
    setNovaSenha({ senha: "", confirmarSenha: "" });
    setRecuperacaoSenha(false);
    setModoAuth("entrar");
    setMensagem("Senha alterada com sucesso. Entre novamente com a nova senha.");

    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", window.location.pathname);
    }

    setProcessandoAuth(false);
  }

  async function sair() {
    await supabase.auth.signOut();
  }

  function selecionarData(data) {
    if (!data) return;

    const hoje = hojeLocal();
    if (data > hoje) {
      setMensagem("Não é possível fazer lançamentos em datas futuras.");
      return;
    }

    setMensagem("");
    const diaExistente = dias.find((dia) => dia.data === data);
    setForm(diaExistente ? formularioDoDia(diaExistente, lojas) : formularioVazio(lojas, data));

    const mesDaData = data.slice(0, 7);
    if (mesDaData !== mes) setMes(mesDaData);
  }

  function navegarDia(deslocamento) {
    const novaData = deslocarData(form.data, deslocamento);
    if (novaData > hojeLocal()) return;
    selecionarData(novaData);
  }

  function selecionarSituacao(situacao) {
    setMensagem("");
    setForm((atual) => ({
      ...atual,
      situacao,
      lojasSelecionadas: situacao === "trabalhado" ? atual.lojasSelecionadas : [],
      feriasInicio: situacao === "ferias" ? atual.data : atual.feriasInicio,
      feriasFim: situacao === "ferias" ? atual.data : atual.feriasFim,
    }));
  }

  function alternarLoja(lojaId) {
    const id = String(lojaId);
    setForm((atual) => {
      const selecionada = atual.lojasSelecionadas.includes(id);
      return {
        ...atual,
        lojasSelecionadas: selecionada
          ? atual.lojasSelecionadas.filter((item) => item !== id)
          : [...atual.lojasSelecionadas, id],
      };
    });
  }

  function alterarLoja(lojaId, campo, valor) {
    const id = String(lojaId);
    const somenteDigitos = String(valor).replace(/\D/g, "").slice(0, 3);
    const numero = somenteDigitos === "" ? "" : Number(somenteDigitos);

    setForm((atual) => ({
      ...atual,
      lojas: {
        ...atual.lojas,
        [id]: {
          ...(atual.lojas[id] || { vendas: "", pecas: "" }),
          [campo]: numero,
        },
      },
    }));
  }

  async function carregarHoje() {
    const hoje = hojeLocal();
    const { data: diaHoje } = await supabase
      .from("dias_pa")
      .select("id,data,situacao,observacao,lancamentos_pa(id,loja_id,vendas,pecas)")
      .eq("usuario_id", sessao.user.id)
      .eq("data", hoje)
      .maybeSingle();

    setForm(diaHoje ? formularioDoDia(diaHoje, lojas) : formularioVazio(lojas, hoje));
    if (mes !== hoje.slice(0, 7)) setMes(hoje.slice(0, 7));
    else await carregarDados();
  }

  async function voltarParaHoje() {
    setMensagem("");
    await carregarHoje();
  }

  function abrirDia(dia) {
    setForm(formularioDoDia(dia, lojas));
    setHistoricoAberto(false);
    setMensagem("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvarFerias() {
    const periodo = datasEntre(form.feriasInicio, form.feriasFim);

    if (periodo.length === 0) {
      setMensagem("Confira as datas de início e fim das férias.");
      return false;
    }

    const registros = periodo.map((data) => ({
      usuario_id: sessao.user.id,
      data,
      situacao: "ferias",
      observacao: null,
    }));

    const { data: diasSalvos, error } = await supabase
      .from("dias_pa")
      .upsert(registros, { onConflict: "usuario_id,data" })
      .select("id");

    if (error) {
      setMensagem(error.message);
      return false;
    }

    const ids = (diasSalvos || []).map((dia) => dia.id);
    if (ids.length > 0) {
      const { error: erroLimpeza } = await supabase
        .from("lancamentos_pa")
        .delete()
        .in("dia_id", ids);

      if (erroLimpeza) {
        setMensagem(erroLimpeza.message);
        return false;
      }
    }

    return true;
  }

  async function salvarDia(evento) {
    evento.preventDefault();
    setSalvando(true);
    setMensagem("");

    if (form.data > hojeLocal()) {
      setMensagem("Não é possível fazer lançamentos em datas futuras.");
      setSalvando(false);
      return;
    }

    if (form.situacao === "ferias") {
      const inicioFerias = form.feriasInicio;
      const fimFerias = form.feriasFim;
      const sucesso = await salvarFerias();

      if (sucesso) {
        await carregarDados();
        setMensagem(`Férias registradas de ${formatarData(inicioFerias)} a ${formatarData(fimFerias)}.`);
      }

      setSalvando(false);
      return;
    }

    if (form.situacao === "trabalhado" && form.lojasSelecionadas.length === 0) {
      setMensagem("Selecione pelo menos uma loja.");
      setSalvando(false);
      return;
    }

    if (form.situacao === "trabalhado") {
      const valorInvalido = form.lojasSelecionadas.some((lojaId) => {
        const valores = form.lojas[lojaId] || {};
        return [valores.vendas, valores.pecas].some((valor) => {
          if (valor === "" || valor == null) return false;
          const numero = Number(valor);
          return !Number.isInteger(numero) || numero < 0 || numero > 999;
        });
      });

      if (valorInvalido) {
        setMensagem("Quantidade de vendas e peças devem ser números inteiros de 0 a 999.");
        setSalvando(false);
        return;
      }

      const pecasMenoresQueVendas = form.lojasSelecionadas.some((lojaId) => {
        const valores = form.lojas[lojaId] || {};
        const vendas = Number(valores.vendas || 0);
        const pecas = Number(valores.pecas || 0);
        return pecas < vendas;
      });

      if (pecasMenoresQueVendas) {
        setMensagem("A quantidade de peças não pode ser menor que a quantidade de vendas.");
        setSalvando(false);
        return;
      }
    }

    const { data: diaSalvo, error: erroDia } = await supabase
      .from("dias_pa")
      .upsert(
        {
          usuario_id: sessao.user.id,
          data: form.data,
          situacao: form.situacao,
          observacao: null,
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

    const { error: erroLimpeza } = await supabase
      .from("lancamentos_pa")
      .delete()
      .eq("dia_id", diaSalvo.id);

    if (erroLimpeza) {
      setMensagem(erroLimpeza.message);
      setSalvando(false);
      return;
    }

    if (form.situacao === "trabalhado") {
      const registros = form.lojasSelecionadas.map((lojaId) => ({
        dia_id: diaSalvo.id,
        loja_id: Number(lojaId),
        vendas: Number(form.lojas[lojaId]?.vendas || 0),
        pecas: Number(form.lojas[lojaId]?.pecas || 0),
      }));

      const { error } = await supabase.from("lancamentos_pa").insert(registros);

      if (error) {
        setMensagem(error.message);
        setSalvando(false);
        return;
      }
    }

    await carregarDados();
    setMensagem("Lançamento salvo com sucesso.");
    setSalvando(false);
  }

  const totaisForm = useMemo(() => {
    if (form.situacao !== "trabalhado") return { vendas: 0, pecas: 0, pa: 0 };

    const valores = form.lojasSelecionadas.map((lojaId) => form.lojas[lojaId] || { vendas: 0, pecas: 0 });
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

  if (recuperacaoSenha && sessao) {
    return (
      <main className="loginPage">
        <section className="card loginCard">
          <p className="muted">Segurança da conta</p>
          <h1>Redefinir senha</h1>
          <p className="muted">Crie uma nova senha para acessar o Meu PA.</p>
          <form className="formStack" onSubmit={salvarNovaSenha}>
            <label>
              Nova senha
              <input type="password" minLength="6" required autoComplete="new-password" value={novaSenha.senha} onChange={(e) => setNovaSenha({ ...novaSenha, senha: e.target.value })} />
            </label>
            <label>
              Confirmar nova senha
              <input type="password" minLength="6" required autoComplete="new-password" value={novaSenha.confirmarSenha} onChange={(e) => setNovaSenha({ ...novaSenha, confirmarSenha: e.target.value })} />
            </label>
            <button className="primary" type="submit" disabled={processandoAuth}>{processandoAuth ? "Alterando..." : "Salvar nova senha"}</button>
          </form>
          {mensagem && <p className="message">{mensagem}</p>}
        </section>
      </main>
    );
  }

  if (!sessao) {
    return (
      <main className="loginPage">
        <section className="card loginCard">
          <div className="authBrand">PA</div>
          <h1>{modoAuth === "cadastro" ? "Criar conta" : modoAuth === "recuperar" ? "Recuperar senha" : "Meu PA"}</h1>
          <p className="muted">{modoAuth === "cadastro" ? "Crie seu acesso para acompanhar e lançar seu PA." : modoAuth === "recuperar" ? "Informe seu e-mail para receber o link de recuperação." : "Entre para lançar a quantidade de vendas e peças de cada loja."}</p>

          {modoAuth === "entrar" && (
            <form className="formStack" onSubmit={entrar}>
              <label>E-mail<input type="email" required autoComplete="email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} /></label>
              <label>Senha<input type="password" required autoComplete="current-password" value={login.senha} onChange={(e) => setLogin({ ...login, senha: e.target.value })} /></label>
              <button className="primary" type="submit" disabled={processandoAuth}>{processandoAuth ? "Entrando..." : "Entrar"}</button>
            </form>
          )}

          {modoAuth === "cadastro" && (
            <form className="formStack" onSubmit={criarConta}>
              <label>Nome<input type="text" required autoComplete="name" value={cadastro.nome} onChange={(e) => setCadastro({ ...cadastro, nome: e.target.value })} /></label>
              <label>Número de vendedora no Athos<input type="number" min="1" max="18" step="1" required value={cadastro.numeroAthos} onChange={(e) => setCadastro({ ...cadastro, numeroAthos: e.target.value })} /></label>
              <label>E-mail<input type="email" required autoComplete="email" value={cadastro.email} onChange={(e) => setCadastro({ ...cadastro, email: e.target.value })} /></label>
              <label>Senha<input type="password" minLength="6" required autoComplete="new-password" value={cadastro.senha} onChange={(e) => setCadastro({ ...cadastro, senha: e.target.value })} /></label>
              <label>Confirmar senha<input type="password" minLength="6" required autoComplete="new-password" value={cadastro.confirmarSenha} onChange={(e) => setCadastro({ ...cadastro, confirmarSenha: e.target.value })} /></label>
              <button className="primary" type="submit" disabled={processandoAuth}>{processandoAuth ? "Criando..." : "Criar conta"}</button>
            </form>
          )}

          {modoAuth === "recuperar" && (
            <form className="formStack" onSubmit={enviarRecuperacao}>
              <label>E-mail<input type="email" required autoComplete="email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} /></label>
              <button className="primary" type="submit" disabled={processandoAuth}>{processandoAuth ? "Enviando..." : "Enviar link de recuperação"}</button>
            </form>
          )}

          <div className="authActions">
            {modoAuth === "entrar" ? (
              <>
                <button className="textButton" type="button" onClick={() => trocarModoAuth("cadastro")}>Criar conta</button>
                <button className="textButton" type="button" onClick={() => trocarModoAuth("recuperar")}>Esqueci minha senha</button>
              </>
            ) : (
              <button className="textButton" type="button" onClick={() => trocarModoAuth("entrar")}>Voltar para o login</button>
            )}
          </div>

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

  if (!perfil.ativo) {
    return (
      <main>
        <section className="card">
          <h1>Acesso suspenso</h1>
          <p>Seu acesso ao Cálculo PA está suspenso.</p>
          <button className="secondary" type="button" onClick={sair}>Sair</button>
        </section>
      </main>
    );
  }

  const nomeExibicao = (perfil.nome || "").trim().toUpperCase();
  const editandoOutroDia = form.data !== hojeLocal();

  return (
    <main className="dashboard">
      <header className="dashboardHeader">
        <div>
          <h1 className="greeting">
            Olá {nomeExibicao}{perfil.numero_athos ? ` (${perfil.numero_athos})` : ""}
          </h1>
          <button className="textButton subtleAction" type="button" onClick={sair}>Sair</button>
        </div>

        <label className="monthControl">
          Mês
          <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
        </label>
      </header>

      <section className="card dailyCard">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">{editandoOutroDia ? "Lançamento anterior" : "Lançamento de hoje"}</p>
            <h2>{formatarData(form.data)}</h2>
          </div>
          {editandoOutroDia && (
            <button className="secondary compactButton" type="button" onClick={voltarParaHoje}>Voltar para hoje</button>
          )}
        </div>

        <form className="dailyForm" onSubmit={salvarDia}>
          <label>
            Data do lançamento
            <input
              type="date"
              required
              max={hojeLocal()}
              value={form.data}
              onChange={(e) => selecionarData(e.target.value)}
            />
          </label>
          <p className="helperText">A data começa em hoje, mas você pode escolher dias anteriores. Datas futuras não são permitidas.</p>
          <div className="dateNavigation" aria-label="Navegação entre dias">
            <button className="dateNavButton" type="button" onClick={() => navegarDia(-1)} aria-label="Ir para o dia anterior">
              ← Anterior
            </button>
            <button
              className="dateNavButton"
              type="button"
              onClick={() => navegarDia(1)}
              disabled={form.data >= hojeLocal()}
              aria-label="Ir para o próximo dia"
            >
              Próximo →
            </button>
          </div>

          <div>
            <span className="fieldTitle">Como foi o dia?</span>
            <div className="choiceGrid statusChoices" role="group" aria-label="Situação do dia">
              {situacoes.map(([valor, texto]) => (
                <button
                  key={valor}
                  className={`choiceButton ${form.situacao === valor ? "active" : ""}`}
                  type="button"
                  aria-pressed={form.situacao === valor}
                  onClick={() => selecionarSituacao(valor)}
                >
                  {texto}
                </button>
              ))}
            </div>
          </div>

          {form.situacao === "trabalhado" && (
            <>
              <div>
                <span className="fieldTitle">Em qual loja?</span>
                <p className="helperText">Você pode selecionar mais de uma loja no mesmo dia.</p>
                <div className="choiceGrid storeChoices" role="group" aria-label="Lojas trabalhadas">
                  {lojas.map((loja) => {
                    const id = String(loja.id);
                    const selecionada = form.lojasSelecionadas.includes(id);
                    return (
                      <button
                        key={loja.id}
                        className={`choiceButton storeChoice ${selecionada ? "active" : ""}`}
                        type="button"
                        aria-pressed={selecionada}
                        onClick={() => alternarLoja(loja.id)}
                      >
                        {loja.sigla || loja.nome}
                      </button>
                    );
                  })}
                </div>
              </div>

              {form.lojasSelecionadas.length > 0 && (
                <div className="selectedStores">
                  {form.lojasSelecionadas.map((lojaId) => {
                    const loja = lojas.find((item) => String(item.id) === lojaId);
                    if (!loja) return null;

                    const valores = form.lojas[lojaId] || { vendas: "", pecas: "" };
                    const valorPa = pa(Number(valores.pecas || 0), Number(valores.vendas || 0));

                    return (
                      <div className="storeEntry" key={lojaId}>
                        <div className="storeEntryHeader">
                          <strong>{loja.sigla || loja.nome}</strong>
                          <span>PA {valorPa.toFixed(2).replace(".", ",")}</span>
                        </div>
                        <div className="storeFields">
                          <label>
                            Quantidade de vendas
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]{1,3}"
                              maxLength={3}
                              value={valores.vendas}
                              onChange={(e) => alterarLoja(lojaId, "vendas", e.target.value)}
                            />
                          </label>
                          <label>
                            Peças
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]{1,3}"
                              maxLength={3}
                              value={valores.pecas}
                              onChange={(e) => alterarLoja(lojaId, "pecas", e.target.value)}
                            />
                          </label>
                        </div>
                        <p className="helperText">Somente números inteiros, de 0 a 999.</p>
                      </div>
                    );
                  })}

                  <div className="dailyTotal">
                    <span>Total do dia</span>
                    <strong>{totaisForm.vendas} vendas · {totaisForm.pecas} peças · PA {totaisForm.pa.toFixed(2).replace(".", ",")}</strong>
                  </div>
                </div>
              )}
            </>
          )}

          {form.situacao === "ferias" && (
            <div className="vacationBox">
              <span className="fieldTitle">Período de férias</span>
              <div className="vacationRange">
                <label>
                  Início
                  <input
                    type="date"
                    required
                    value={form.feriasInicio}
                    onChange={(e) => setForm((atual) => ({ ...atual, feriasInicio: e.target.value }))}
                  />
                </label>
                <label>
                  Fim
                  <input
                    type="date"
                    required
                    min={form.feriasInicio || undefined}
                    value={form.feriasFim}
                    onChange={(e) => setForm((atual) => ({ ...atual, feriasFim: e.target.value }))}
                  />
                </label>
              </div>
              <p className="helperText">Todos os dias do período serão registrados como férias.</p>
            </div>
          )}

          <button className="primary saveButton" type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : form.situacao === "ferias" ? "Salvar período de férias" : "Salvar lançamento"}
          </button>
        </form>

        {mensagem && <p className="message">{mensagem}</p>}
      </section>

      <section className="summarySection" aria-label="Resumo do mês">
        <div className="summaryHeading">
          <h2>Resumo do mês</h2>
        </div>
        <div className="summaryGrid">
          <div className="metric"><span>Dias válidos</span><strong>{resumoMes.diasValidos}</strong></div>
          <div className="metric"><span>Quantidade de vendas</span><strong>{resumoMes.vendas}</strong></div>
          <div className="metric"><span>Peças</span><strong>{resumoMes.pecas}</strong></div>
          <div className="metric"><span>PA</span><strong>{resumoMes.pa.toFixed(2).replace(".", ",")}</strong></div>
        </div>
        <div className="prize">{premioDoMes(resumoMes.pa, resumoMes.diasValidos, mesFechado(mes))}</div>
      </section>

      <section className="historySection">
        <button
          className="historyToggle"
          type="button"
          aria-expanded={historicoAberto}
          onClick={() => setHistoricoAberto((aberto) => !aberto)}
        >
          <span>Histórico do mês</span>
          <span aria-hidden="true">{historicoAberto ? "−" : "+"}</span>
        </button>

        {historicoAberto && (
          <div className="historyPanel">
            {carregando ? (
              <p>Carregando...</p>
            ) : dias.length === 0 ? (
              <p className="muted">Nenhum lançamento neste mês.</p>
            ) : (
              <div className="history">
                {dias.map((dia) => {
                  const vendas = (dia.lancamentos_pa || []).reduce((soma, item) => soma + Number(item.vendas || 0), 0);
                  const pecas = (dia.lancamentos_pa || []).reduce((soma, item) => soma + Number(item.pecas || 0), 0);
                  const situacaoNormalizada = normalizarSituacao(dia.situacao);
                  const situacao = situacoes.find(([valor]) => valor === situacaoNormalizada)?.[1] || situacaoNormalizada;

                  return (
                    <button className="historyItem" type="button" key={dia.id} onClick={() => abrirDia(dia)}>
                      <div>
                        <strong>{formatarData(dia.data)}</strong>
                        <span>{situacao}</span>
                      </div>
                      <span className="historySummary">
                        {dia.situacao === "trabalhado"
                          ? `${vendas} vendas · ${pecas} peças · PA ${pa(pecas, vendas).toFixed(2).replace(".", ",")}`
                          : "Não conta como dia trabalhado"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
