import { calendarioDoMes } from "@/lib/calendario.mjs";

export default function CalendarioLancamentos({ mes, dias, hoje, selecionado, pronto, carregando, salvando, onSelecionar }) {
  const calendario = calendarioDoMes(mes, pronto ? dias : [], hoje);
  const simbolos = { lancado: "✓", ausencia: "—", pendente: "!", futuro: "·" };

  return (
    <details className="card calendarCard" open aria-busy={carregando}>
      <summary className="calendarToggle">
        <span>Calendário de lançamentos</span>
      </summary>

      <div className="calendarBody">
        <p className="calendarProgress" role="status">
          {!pronto ? carregando ? "Carregando calendário…" : "Não foi possível conferir este mês."
            : mes > hoje.slice(0, 7) ? "Este mês ainda não começou."
            : calendario.pendentes ? `${calendario.pendentes} ${calendario.pendentes === 1 ? "dia pendente" : "dias pendentes"}${mes === hoje.slice(0, 7) ? " até hoje" : " no mês"}`
            : mes === hoje.slice(0, 7) ? "Tudo preenchido até hoje!" : "Todos os dias preenchidos!"}
        </p>

        <div className="calendarGrid" aria-label="Dias do mês">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => <span className="calendarWeekday" key={dia}>{dia}</span>)}
          {Array.from({ length: calendario.inicio }, (_, i) => <span key={`empty-${i}`} aria-hidden="true" />)}
          {calendario.dias.map((dia) => (
            <button key={dia.data} type="button"
              className={`calendarDay ${pronto ? dia.estado : "indisponivel"}`}
              disabled={!pronto || salvando || dia.futuro}
              aria-label={`${dia.data.split("-").reverse().join("/")} · ${pronto ? dia.descricao : "Aguardando dados"}${dia.data === hoje ? " · Hoje" : ""}`}
              aria-pressed={dia.data === selecionado}
              aria-current={dia.data === hoje ? "date" : undefined}
              onClick={() => onSelecionar(dia.data)}>
              <span>{dia.numero}</span><small aria-hidden="true">{pronto ? simbolos[dia.estado] : "·"}</small>
            </button>
          ))}
        </div>

        <div className="calendarLegend"><span>✓ Lançado</span><span>! Pendente</span><span>— Não trabalhou / férias</span></div>
        <p className="helperText calendarHelp">Clique em um dia para lançar ou corrigir. A marca indica preenchimento, não aprovação da premiação.</p>
      </div>
    </details>
  );
}