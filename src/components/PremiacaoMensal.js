"use client";

import { useEffect, useRef } from "react";
import "./premiacao.css";

export default function PremiacaoMensal({ mes, premio, valorPa, diasValidos, pronto }) {
  const dialogRef = useRef(null);
  const celebracoesVistas = useRef(new Set());
  const valor = premio.valor;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!pronto || !valor) {
      dialog?.close();
      return;
    }

    // Uma comemoração por mês e faixa nesta visita, sem repetir a cada salvamento.
    const chave = `${mes}:${valor}`;
    if (!celebracoesVistas.current.has(chave)) {
      dialog.showModal();
      celebracoesVistas.current.add(chave);
    }
  }, [mes, valor, pronto]);

  const mesFormatado = new Date(`${mes}-01T12:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <>
      <div className={`prize ${pronto && valor ? "prizeEligible" : ""}`}>
        {!pronto ? "Calculando premiação..." : valor ? (
          <>
            <strong>{premio.mensagem}</strong>
            <span>Aguardando verificação dos lançamentos.</span>
            <button className="textButton" type="button" onClick={() => dialogRef.current.showModal()} aria-haspopup="dialog">
              Ver minha premiação
            </button>
          </>
        ) : premio.mensagem}
      </div>

      <dialog
        ref={dialogRef}
        className="prizeDialog"
        aria-labelledby="prizeTitle"
        aria-describedby="prizeVerification"
        onClick={(evento) => { if (evento.target === evento.currentTarget) evento.currentTarget.close(); }}
      >
        <div className="prizeContent">
          <div className="prizeConfetti" aria-hidden="true">
            {Array.from({ length: 24 }, (_, i) => (
              <i key={i} style={{ "--x": `${(i * 37) % 100}%`, "--delay": `${(i % 6) * 0.13}s`, "--rotation": `${i * 29}deg` }} />
            ))}
          </div>
          <button className="prizeClose" type="button" aria-label="Fechar premiação" onClick={() => dialogRef.current.close()}>×</button>
          <div className="prizeHeader">
            <div className="prizeMedal" aria-hidden="true">🏆</div>
            <p className="prizeMonth">{mesFormatado}</p>
          </div>
          <h2 id="prizeTitle">Parabéns pelo seu resultado!</h2>
          <div className="prizeAmount">
            <span>Premiação prevista</span>
            <strong>R$ {valor}</strong>
            <span>em peças</span>
          </div>
          <p className="prizeStats">PA {valorPa.toFixed(2).replace(".", ",")} <span aria-hidden="true">·</span> {diasValidos} dias trabalhados</p>
          <div id="prizeVerification" className="prizeVerification">
            <strong>Aguardando verificação</strong>
            <p>A liberação depende da verificação e aprovação dos lançamentos. O valor pode mudar após a conferência.</p>
          </div>
          <button className="primary prizeConfirm" type="button" autoFocus onClick={() => dialogRef.current.close()}>Entendi, vamos comemorar!</button>
        </div>
      </dialog>
    </>
  );
}
