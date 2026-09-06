"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "./premiacao.css";

export default function PremiacaoMensal({ mes, premio, valorPa, diasValidos, pronto }) {
  const supabase = useMemo(() => createClient(), []);
  const dialogRef = useRef(null);
  const helpDialogRef = useRef(null);
  const celebracoesVistas = useRef(new Set());
  const [statusAprovacao, setStatusAprovacao] = useState("carregando");
  const valor = premio.valor;
  const aprovado = statusAprovacao === "aprovada";

  useEffect(() => {
    let ativo = true;

    async function carregarAprovacao() {
      if (!pronto || !valor) {
        if (ativo) setStatusAprovacao("nao_aplicavel");
        return;
      }

      setStatusAprovacao("carregando");

      const { data: authData } = await supabase.auth.getUser();
      const usuario = authData?.user;
      if (!usuario) {
        if (ativo) setStatusAprovacao("pendente");
        return;
      }

      const mesBanco = `${mes}-01`;
      const { data, error } = await supabase
        .from("aprovacoes_premiacao_pa")
        .select("status")
        .eq("usuario_id", usuario.id)
        .eq("mes", mesBanco)
        .maybeSingle();

      if (!ativo) return;

      if (!error && data?.status) {
        setStatusAprovacao(data.status);
        return;
      }

      if (error) {
        setStatusAprovacao("pendente");
        return;
      }

      const { data: criada, error: erroCriacao } = await supabase
        .from("aprovacoes_premiacao_pa")
        .insert({ usuario_id: usuario.id, mes: mesBanco })
        .select("status")
        .single();

      if (!ativo) return;
      setStatusAprovacao(erroCriacao ? "pendente" : criada?.status || "pendente");
    }

    carregarAprovacao();
    return () => {
      ativo = false;
    };
  }, [mes, pronto, supabase, valor]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!pronto || !valor || !aprovado) {
      dialog?.close();
      return;
    }

    const chave = `${mes}:${valor}:aprovada`;
    if (!celebracoesVistas.current.has(chave)) {
      dialog.showModal();
      celebracoesVistas.current.add(chave);
    }
  }, [aprovado, mes, pronto, valor]);

  const mesFormatado = new Date(`${mes}-01T12:00:00`).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const mensagemAprovada = `🎁 Parabéns! Você ganhou R$ ${valor} em peças. Aguarde as instruções da Vi no dia do pagamento.`;

  let conteudoPremiacao = premio.mensagem;

  if (!pronto) {
    conteudoPremiacao = "Calculando premiação...";
  } else if (valor && statusAprovacao === "carregando") {
    conteudoPremiacao = "Verificando status da premiação...";
  } else if (valor && aprovado) {
    conteudoPremiacao = mensagemAprovada;
  } else if (valor && statusAprovacao === "reprovada") {
    conteudoPremiacao = "Após a conferência, esta premiação não foi aprovada.";
  } else if (valor) {
    conteudoPremiacao = "Premiação aguardando conferência e aprovação.";
  }

  return (
    <>
      <div className={`prize ${pronto && valor ? "prizeEligible" : ""}`}>
        <strong>{conteudoPremiacao}</strong>
        {pronto && Boolean(valor) && !aprovado && statusAprovacao !== "reprovada" && (
          <span>PA dentro da faixa de R$ {valor} em peças.</span>
        )}
        {pronto && Boolean(valor) && aprovado && (
          <button
            className="textButton"
            type="button"
            onClick={() => dialogRef.current.showModal()}
            aria-haspopup="dialog"
          >
            Ver minha premiação
          </button>
        )}
      </div>

      <button
        className="prizeHelpButton"
        type="button"
        onClick={() => helpDialogRef.current?.showModal()}
        aria-haspopup="dialog"
      >
        Como funciona a premiação <span aria-hidden="true">ⓘ</span>
      </button>

      <dialog
        ref={helpDialogRef}
        className="prizeHelpDialog"
        aria-labelledby="prizeHelpTitle"
        onClick={(evento) => {
          if (evento.target === evento.currentTarget) evento.currentTarget.close();
        }}
      >
        <div className="prizeHelpContent">
          <button
            className="prizeClose"
            type="button"
            aria-label="Fechar regras da premiação"
            onClick={() => helpDialogRef.current?.close()}
          >
            ×
          </button>
          <h2 id="prizeHelpTitle">Como funciona a premiação</h2>
          <p>
            A premiação é válida para PA final a partir de <strong>2,20</strong>, desde que todas as regras sejam cumpridas.
          </p>
          <ul>
            <li>É necessário ter no mínimo <strong>15 dias trabalhados/preenchidos</strong> no mês.</li>
            <li>Dias trabalhados com venda ou com resultado zerado contam para os 15 dias.</li>
            <li>Folga, falta, atestado e férias não contam como dia trabalhado.</li>
            <li>A premiação só é calculada após o preenchimento do último dia do mês.</li>
            <li><strong>PA de 2,20 a 2,59:</strong> R$ 100 em peças.</li>
            <li><strong>PA a partir de 2,60:</strong> R$ 150 em peças.</li>
            <li>Atingir a faixa de PA não confirma a premiação automaticamente: é necessário aguardar a conferência e a aprovação.</li>
          </ul>
          <p className="prizeTooltipNote">
            Após a aprovação, aparecerá a confirmação da premiação e a orientação para aguardar as instruções da Vi no dia do pagamento.
          </p>
          <button
            className="primary prizeHelpConfirm"
            type="button"
            onClick={() => helpDialogRef.current?.close()}
          >
            Entendi
          </button>
        </div>
      </dialog>

      <dialog
        ref={dialogRef}
        className="prizeDialog"
        aria-labelledby="prizeTitle"
        aria-describedby="prizeVerification"
        onClick={(evento) => {
          if (evento.target === evento.currentTarget) evento.currentTarget.close();
        }}
      >
        <div className="prizeContent">
          <div className="prizeConfetti" aria-hidden="true">
            {Array.from({ length: 24 }, (_, i) => (
              <i
                key={i}
                style={{
                  "--x": `${(i * 37) % 100}%`,
                  "--delay": `${(i % 6) * 0.13}s`,
                  "--rotation": `${i * 29}deg`,
                }}
              />
            ))}
          </div>
          <button
            className="prizeClose"
            type="button"
            aria-label="Fechar premiação"
            onClick={() => dialogRef.current.close()}
          >
            ×
          </button>
          <div className="prizeHeader">
            <div className="prizeMedal" aria-hidden="true">🏆</div>
            <div>
              <h2 id="prizeTitle">Parabéns!</h2>
              <p className="prizeMonth">{mesFormatado}</p>
            </div>
          </div>
          <div className="prizeAmount">
            <span className="prizeAmountLabel">Premiação aprovada</span>
            <strong>R$ {valor}</strong>
            <span>em peças</span>
          </div>
          <p className="prizeStats">
            PA {valorPa.toFixed(2).replace(".", ",")} <span aria-hidden="true">·</span> {diasValidos} dias trabalhados
          </p>
          <div id="prizeVerification" className="prizeVerification prizeVerificationApproved">
            <strong>Premiação confirmada</strong>
            <p>Aguarde as instruções da Vi no dia do pagamento.</p>
          </div>
          <button
            className="primary prizeConfirm"
            type="button"
            autoFocus
            onClick={() => dialogRef.current.close()}
          >
            Entendi
          </button>
        </div>
      </dialog>
    </>
  );
}
