import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import PageHeader from "../components/PageHeader";
import type { AgendaSemanal } from "../types";
import "./Agenda.css";

interface AgendaProps {
  eventos: AgendaSemanal[];
}

const HORAS = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
const DIAS = [
  { label: "Seg", num: 28 },
  { label: "Ter", num: 29, hoje: true },
  { label: "Qua", num: 30 },
  { label: "Qui", num: 1 },
  { label: "Sex", num: 2 },
];

const VIEWS = ["Dia", "Semana", "Mês"] as const;

type PendingMove = {
  evento: AgendaSemanal;
  toDia: string;
  toHora: string;
};

export default function Agenda({ eventos: initialEventos }: AgendaProps) {
  const [eventos, setEventos] = useState<AgendaSemanal[]>(initialEventos);
  const [view, setView] = useState<string>("Semana");
  const viewRef = useRef<HTMLDivElement>(null);
  const [vSlider, setVSlider] = useState({ left: 0, width: 0 });
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);

  const updateViewSlider = useCallback(() => {
    if (!viewRef.current) return;
    const active = viewRef.current.querySelector(".view-btn.active") as HTMLElement | null;
    if (active) {
      const parentRect = viewRef.current.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      setVSlider({ left: rect.left - parentRect.left, width: rect.width });
    }
  }, []);

  useEffect(() => { updateViewSlider(); }, [view, updateViewSlider]);
  useEffect(() => {
    window.addEventListener("resize", updateViewSlider);
    return () => window.removeEventListener("resize", updateViewSlider);
  }, [updateViewSlider]);

  function getEvento(dia: string, hora: string) {
    return eventos.find(e => e.dia === dia && e.hora === hora);
  }

  function cellKey(dia: string, hora: string) {
    return `${dia}::${hora}`;
  }

  function handleDragStart(e: React.DragEvent, evento: AgendaSemanal) {
    const key = cellKey(evento.dia, evento.hora);
    setDraggingKey(key);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", key);
  }

  function handleDragOver(e: React.DragEvent, dia: string, hora: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverKey(cellKey(dia, hora));
  }

  function handleDragLeave(e: React.DragEvent) {
    // Only clear if leaving the cell entirely (not entering a child)
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setDragOverKey(null);
    }
  }

  function handleDrop(e: React.DragEvent, toDia: string, toHora: string) {
    e.preventDefault();
    setDragOverKey(null);
    setDraggingKey(null);

    const key = e.dataTransfer.getData("text/plain");
    const [fromDia, fromHora] = key.split("::");

    if (fromDia === toDia && fromHora === toHora) return;

    const evento = getEvento(fromDia, fromHora);
    if (!evento) return;

    // Don't allow dropping on an occupied cell
    if (getEvento(toDia, toHora)) return;

    setPendingMove({ evento, toDia, toHora });
  }

  function handleDragEnd() {
    setDraggingKey(null);
    setDragOverKey(null);
  }

  function confirmMove() {
    if (!pendingMove) return;
    const { evento, toDia, toHora } = pendingMove;
    setEventos(prev =>
      prev.map(e =>
        e.dia === evento.dia && e.hora === evento.hora
          ? { ...e, dia: toDia, hora: toHora }
          : e
      )
    );
    setPendingMove(null);
  }

  const diaLabel: Record<string, string> = {
    Seg: "Segunda", Ter: "Terça", Qua: "Quarta", Qui: "Quinta", Sex: "Sexta",
  };

  return (
    <div className="agenda-page">
      <PageHeader title="Agenda" backTo="/">
        <div className="agenda-nav">
          <button className="btn-nav">‹</button>
          <button className="btn-hoje">Hoje</button>
          <button className="btn-nav">›</button>
          <span className="agenda-periodo">Abril 2026 · Semana 18</span>
        </div>
        <div className="view-toggle slide-tabs" ref={viewRef}>
          <div className="slide-indicator" style={{ left: vSlider.left, width: vSlider.width }} />
          {VIEWS.map(v => (
            <button key={v} className={`view-btn ${view === v ? "active" : ""}`} onClick={() => setView(v)}>{v}</button>
          ))}
        </div>
        <button className="btn-agendar">+ Agendar</button>
      </PageHeader>

      <div className="agenda-grid">
        <div className="agenda-corner" />
        {DIAS.map(dia => (
          <div key={dia.label} className={`agenda-day-header ${dia.hoje ? "hoje" : ""}`}>
            <span className="day-label">{dia.label}</span>
            <span className={`day-num ${dia.hoje ? "hoje-circle" : ""}`}>
              {dia.num < 10 ? `0${dia.num}` : dia.num}
            </span>
          </div>
        ))}

        {HORAS.map(hora => (
          <>
            <div key={`h-${hora}`} className="agenda-time">{hora}</div>
            {DIAS.map(dia => {
              const ev = getEvento(dia.label, hora);
              const key = cellKey(dia.label, hora);
              const isOver = dragOverKey === key;
              const isDraggingThis = draggingKey === key;
              return (
                <div
                  key={key}
                  className={`agenda-cell ${isOver && !ev ? "drag-over" : ""}`}
                  onDragOver={e => handleDragOver(e, dia.label, hora)}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, dia.label, hora)}
                >
                  {ev && (
                    <div
                      className={`agenda-event event-${ev.cor} ${isDraggingThis ? "is-dragging" : ""}`}
                      draggable
                      onDragStart={e => handleDragStart(e, ev)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="event-name">{ev.paciente}</div>
                      <div className="event-tipo">{ev.tipo}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>

      {pendingMove && createPortal(
        <div className="modal-overlay" onClick={() => setPendingMove(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-warning-icon">
              <AlertTriangle size={24} />
            </div>
            <h3 className="modal-title">Confirmar reagendamento</h3>
            <p className="modal-body">
              Você está movendo <strong>{pendingMove.evento.paciente}</strong> para{" "}
              <strong>{diaLabel[pendingMove.toDia] ?? pendingMove.toDia}, {pendingMove.toHora}</strong>.
            </p>
            <p className="modal-notice">
              Lembre-se de alinhar essa alteração com o paciente antes de confirmar.
            </p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setPendingMove(null)}>
                Cancelar
              </button>
              <button className="modal-btn-confirm" onClick={confirmMove}>
                Confirmar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
