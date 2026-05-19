import { useState, useRef, useEffect, useCallback } from "react";
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

export default function Agenda({ eventos }: AgendaProps) {
  const [view, setView] = useState<string>("Semana");
  const viewRef = useRef<HTMLDivElement>(null);
  const [vSlider, setVSlider] = useState({ left: 0, width: 0 });

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
              return (
                <div key={`${dia.label}-${hora}`} className="agenda-cell">
                  {ev && (
                    <div className={`agenda-event event-${ev.cor}`}>
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
    </div>
  );
}
