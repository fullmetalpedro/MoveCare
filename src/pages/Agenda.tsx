import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import esLocale from "@fullcalendar/core/locales/es";
import type {
  EventInput,
  EventContentArg,
  EventDropArg,
  DatesSetArg,
} from "@fullcalendar/core";
import PageHeader from "../components/PageHeader";
import AgendamentoModal from "../components/AgendamentoModal";
import type { AgendaSemanal, Paciente } from "../types";
import "./Agenda.css";

interface AgendaProps {
  /** Weekly schedule events used to populate the FullCalendar instance. */
  eventos: AgendaSemanal[];
  /** Full patient list forwarded to {@link AgendamentoModal} for patient selection. */
  pacientes: Paciente[];
}

/**
 * Weekly/daily/monthly calendar page powered by FullCalendar.
 *
 * Receives data as props from `App.tsx` (sourced via `agendaService` and
 * `patientService`). Supports event drag-and-drop rescheduling (with a
 * pending-confirmation dialog), day/week/month view switching, and opening
 * the {@link AgendamentoModal} from date clicks or the "+ Agendar" button.
 *
 * FullCalendar is lazy-loaded in its own chunk — this page is the sole
 * consumer, keeping the library out of the main bundle.
 *
 * @param props - {@link AgendaProps}
 * @returns The agenda page `<div>` containing the FullCalendar instance and
 *   the scheduling modal portal.
 *
 * @example
 * // Mounted at /agenda in App.tsx:
 * <Agenda eventos={eventos} pacientes={pacientes} />
 */

/**
 * The mock data is anchored to a reference week (Abril 2026, semana 18).
 * We map the weekday labels to real ISO dates so FullCalendar can render
 * proper Date objects. Seg=28/04 ... Sex=02/05/2026.
 */
const REFERENCE_WEEK: Record<string, string> = {
  Seg: "2026-04-28",
  Ter: "2026-04-29",
  Qua: "2026-04-30",
  Qui: "2026-05-01",
  Sex: "2026-05-02",
};

const INITIAL_DATE = "2026-04-29";

const VIEWS = [
  { labelKey: "agenda.viewDay", value: "timeGridDay" },
  { labelKey: "agenda.viewWeek", value: "timeGridWeek" },
  { labelKey: "agenda.viewMonth", value: "dayGridMonth" },
] as const;

type ViewValue = (typeof VIEWS)[number]["value"];

// Maps the ?view= query param (used by dashboard shortcuts) to a calendar view.
const VIEW_PARAM_MAP: Record<string, ViewValue> = {
  dia: "timeGridDay",
  semana: "timeGridWeek",
  mes: "dayGridMonth",
};

function mapEventos(eventos: AgendaSemanal[]): EventInput[] {
  return eventos.flatMap((e) => {
    const date = REFERENCE_WEEK[e.dia];
    if (!date) return [];
    const start = `${date}T${e.hora}:00`;
    const [h, m] = e.hora.split(":").map(Number);
    const endH = String(h + 1).padStart(2, "0");
    const end = `${date}T${endH}:${String(m).padStart(2, "0")}:00`;
    return [
      {
        id: e.id,
        title: e.paciente,
        start,
        end,
        classNames: [`fc-event-${e.cor}`],
        extendedProps: { paciente: e.paciente, tipo: e.tipo, cor: e.cor },
      },
    ];
  });
}

type PendingMove = {
  info: EventDropArg;
  paciente: string;
  quando: string;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Maps weekday label to the calendar day-number in the reference week
const REFERENCE_WEEK_NUMS: Record<string, number> = {
  Seg: 28, Ter: 29, Qua: 30, Qui: 1, Sex: 2,
};

// JS Date.getDay() (0=Sun..6=Sat) → weekday label used across the app.
const DOW_TO_LABEL: Record<number, string> = {
  1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex",
};

// Abbreviate full name to "Nome S." format matching mock data style
function abreviarNome(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export default function Agenda({ eventos, pacientes }: AgendaProps) {
  const { t, i18n } = useTranslation();
  const fcLocale = (
    { pt: ptBrLocale, es: esLocale, en: "en" } as const
  )[(i18n.language || "pt").slice(0, 2) as "pt" | "es" | "en"] ?? ptBrLocale;
  const calendarRef = useRef<FullCalendar>(null);
  const [searchParams] = useSearchParams();
  const initialView = VIEW_PARAM_MAP[searchParams.get("view") ?? ""] ?? "timeGridWeek";
  const [view, setView] = useState<ViewValue>(initialView);
  const [periodo, setPeriodo] = useState("");
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [closingModal, setClosingModal] = useState(false);
  const [showAgendar, setShowAgendar] = useState(false);
  const [agendarInit, setAgendarInit] = useState<{ dia: string; hora: string | null } | null>(null);
  const [localEventos, setLocalEventos] = useState<AgendaSemanal[]>([]);
  const [viewAnim, setViewAnim] = useState(true);
  const viewRef = useRef<HTMLDivElement>(null);
  const [vSlider, setVSlider] = useState({ left: 0, width: 0 });

  const todosEventos = useMemo(() => [...eventos, ...localEventos], [eventos, localEventos]);
  const events = useMemo(() => mapEventos(todosEventos), [todosEventos]);

  function handleAgendamentoConfirm(pacienteId: string, dia: string, hora: string) {
    const paciente = pacientes.find((p) => p.id === pacienteId);
    if (!paciente) return;
    const novoEvento: AgendaSemanal = {
      id: `local-${pacienteId}-${dia}-${hora}`,
      dia,
      diaNum: REFERENCE_WEEK_NUMS[dia] ?? 0,
      hora,
      paciente: abreviarNome(paciente.nome),
      tipo: "Sessão",
      cor: "green",
    };
    setLocalEventos((prev) => [...prev, novoEvento]);
  }

  function abrirAgendamento(init: { dia: string; hora: string | null } | null) {
    setAgendarInit(init);
    setShowAgendar(true);
  }

  // Clicking an empty slot opens the modal pre-filled with that day/time.
  function handleDateClick(arg: DateClickArg) {
    const dia = DOW_TO_LABEL[arg.date.getDay()];
    if (!dia) return; // ignore weekends / unsupported days
    if (arg.allDay) {
      // Month view: only the day is known — let the user pick the time.
      abrirAgendamento({ dia, hora: null });
      return;
    }
    const hora = `${String(arg.date.getHours()).padStart(2, "0")}:00`;
    const ocupado = todosEventos.some((e) => e.dia === dia && e.hora === hora);
    abrirAgendamento({ dia, hora: ocupado ? null : hora });
  }

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

  function api() {
    return calendarRef.current?.getApi();
  }

  function changeView(v: ViewValue) {
    if (v === view) return;
    // Hide first (base opacity 0), swap the view while hidden, then replay the
    // global pageFadeIn animation — avoids the new view flashing at full opacity.
    setViewAnim(false);
    requestAnimationFrame(() => {
      api()?.changeView(v);
      setView(v);
      requestAnimationFrame(() => setViewAnim(true));
    });
  }

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    // Short, fixed-format label so the nav buttons never shift position
    // when switching between day/week/month views.
    const label = new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(arg.view.currentStart);
    setPeriodo(capitalize(label));
  }, []);

  function handleEventDrop(info: EventDropArg) {
    const start = info.event.start;
    if (!start) return;
    const dia = capitalize(
      new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(start)
    );
    const hora = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(start);
    setPendingMove({
      info,
      paciente: info.event.extendedProps.paciente,
      quando: `${dia}, ${hora}`,
    });
  }

  function closeModal() {
    setClosingModal(true);
    setTimeout(() => {
      setPendingMove(null);
      setClosingModal(false);
    }, 180);
  }

  function cancelMove() {
    pendingMove?.info.revert();
    closeModal();
  }

  function confirmMove() {
    // The drag already mutated FullCalendar's internal state; nothing more to do.
    closeModal();
  }

  function renderEvent(arg: EventContentArg) {
    const { paciente, tipo } = arg.event.extendedProps as {
      paciente: string;
      tipo: string;
    };
    const isMonth = arg.view.type === "dayGridMonth";
    return (
      <div className="fc-ev-content">
        {isMonth && <span className="fc-ev-dot" />}
        <span className="fc-ev-name">{paciente}</span>
        {!isMonth && <span className="fc-ev-tipo">{tipo}</span>}
        {isMonth && <span className="fc-ev-time">{arg.timeText}</span>}
      </div>
    );
  }

  return (
    <div className="agenda-page">
      <PageHeader title={t("agenda.title")} backTo="/">
        <div className="agenda-nav">
          <button className="btn-hoje" onClick={() => api()?.today()}>
            {t("common.today")}
          </button>
          <div className="nav-arrows" role="group" aria-label={t("agenda.navigatePeriod")}>
            <button className="btn-nav" onClick={() => api()?.prev()} aria-label={t("agenda.previousPeriod")}>
              ‹
            </button>
            <button className="btn-nav" onClick={() => api()?.next()} aria-label={t("agenda.nextPeriod")}>
              ›
            </button>
          </div>
          <span className="agenda-periodo">{periodo}</span>
        </div>
        <div className="view-toggle slide-tabs" ref={viewRef}>
          <div className="slide-indicator" style={{ left: vSlider.left, width: vSlider.width }} />
          {VIEWS.map((v) => (
            <button
              key={v.value}
              className={`view-btn ${view === v.value ? "active" : ""}`}
              onClick={() => changeView(v.value)}
            >
              {t(v.labelKey)}
            </button>
          ))}
        </div>
        <button className="btn-agendar" onClick={() => abrirAgendamento(null)}>{t("agenda.schedule")}</button>
      </PageHeader>

      <div className={`agenda-calendar${viewAnim ? " view-fadein" : ""}`}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={initialView}
          initialDate={INITIAL_DATE}
          locale={fcLocale}
          headerToolbar={false}
          events={events}
          eventContent={renderEvent}
          datesSet={handleDatesSet}
          eventDrop={handleEventDrop}
          dateClick={handleDateClick}
          editable
          eventDurationEditable={false}
          droppable={false}
          weekends={false}
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="18:00:00"
          slotDuration="01:00:00"
          slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          dayHeaderFormat={{ weekday: "short", day: "2-digit" }}
          views={{
            dayGridMonth: {
              // Month view only needs weekday names in the header,
              // the day number already appears in each cell.
              dayHeaderFormat: { weekday: "short" },
            },
          }}
          nowIndicator
          expandRows
          height="100%"
          dayMaxEvents={3}
          firstDay={1}
        />
      </div>

      {showAgendar && (
        <AgendamentoModal
          pacientes={pacientes}
          eventos={todosEventos}
          diaInicial={agendarInit?.dia}
          horaInicial={agendarInit?.hora ?? null}
          onClose={() => setShowAgendar(false)}
          onConfirm={handleAgendamentoConfirm}
        />
      )}

      {pendingMove &&
        createPortal(
          <div
            className={`modal-overlay${closingModal ? " closing" : ""}`}
            onClick={cancelMove}
          >
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-warning-icon">
                <AlertTriangle size={24} aria-hidden="true" />
              </div>
              <h3 className="modal-title">{t("agenda.confirmReschedule")}</h3>
              <p className="modal-body">
                {t("agenda.rescheduleBodyText", {
                  patient: pendingMove.paciente,
                  when: pendingMove.quando,
                })}
              </p>
              <p className="modal-notice">
                {t("agenda.rescheduleNotice")}
              </p>
              <div className="modal-actions">
                <button className="modal-btn-cancel" onClick={cancelMove}>
                  {t("common.cancel")}
                </button>
                <button className="modal-btn-confirm" onClick={confirmMove}>
                  {t("common.confirm")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
