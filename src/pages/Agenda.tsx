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
  EventClickArg,
  DatesSetArg,
} from "@fullcalendar/core";
import PageHeader from "../components/PageHeader";
import AgendamentoModal from "../components/AgendamentoModal";
import { usePacientes } from "../hooks";
import { patientService } from "../services";
import {
  REFERENCE_WEEK,
  sessionDates,
  weekdayLabel,
  dateForWeekdayInWeek,
  addDaysISO,
  formatDayMonth,
  calcAltaDate,
} from "../lib/schedule";
import type { AgendaSemanal, Paciente } from "../types";
import "./Agenda.css";

/**
 * Weekly/daily/monthly calendar page powered by FullCalendar.
 *
 * The calendar is **derived from patients' recurring session slots** ({@link
 * usePacientes}): each patient with a `sessao` contributes `totalSessoes` weekly
 * occurrences, so a slot stays booked for the full course of treatment. There is
 * no standalone event store — scheduling and rescheduling write back to the
 * patient via `patientService.update`, and the live query re-renders the grid.
 *
 * Dragging or editing any occurrence moves the **whole series** (a patient's
 * day/time is fixed unless the doctor changes it). FullCalendar is lazy-loaded
 * in its own chunk — this page is the sole consumer.
 *
 * @returns The agenda page `<div>` containing the FullCalendar instance and
 *   the scheduling modal portal.
 *
 * @example
 * // Mounted at /agenda in App.tsx:
 * <Agenda />
 */

const INITIAL_DATE = "2026-04-28";

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

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// JS Date.getDay() (0=Sun..6=Sat) → weekday label used across the app.
const DOW_TO_LABEL: Record<number, string> = {
  1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex",
};

/** Colour class suffix for an event, by patient status. */
function corForStatus(status: string): string {
  if (status === "Avaliação") return "yellow";
  if (status === "Alta") return "blue";
  return "green";
}

/** `yyyy-mm-dd` from a Date's local calendar fields (no timezone shift). */
function localISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Expands every patient's recurring slot into FullCalendar events. */
function buildEvents(pacientes: Paciente[]): EventInput[] {
  return pacientes
    .filter((p): p is Paciente & { sessao: NonNullable<Paciente["sessao"]> } => !!p.sessao)
    .flatMap((p) => {
      const { dataInicio, hora } = p.sessao;
      const [h, m] = hora.split(":").map(Number);
      const cor = corForStatus(p.status);
      return sessionDates(dataInicio, p.totalSessoes).map((d, i) => {
        const start = `${d}T${hora}:00`;
        const end = `${d}T${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
        return {
          id: `${p.id}#${i}`,
          title: p.nome,
          start,
          end,
          classNames: [`fc-event-${cor}`],
          extendedProps: {
            pacienteId: p.id,
            paciente: p.nome,
            tipo: `Sessão ${i + 1}/${p.totalSessoes}`,
            cor,
          },
        };
      });
    });
}

type PendingMove = {
  info: EventDropArg;
  paciente: string;
  quando: string;
  /** Id of the patient whose series is being moved. */
  pacienteId: string;
  /** Whole-day shift to apply to the series start, derived from the drag. */
  deltaDays: number;
  /** New time-of-day for the series, e.g. `"10:00"`. */
  hora: string;
};

export default function Agenda() {
  const { t, i18n } = useTranslation();
  const pacientes = usePacientes();
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
  const [agendarInit, setAgendarInit] = useState<{
    dia: string;
    hora: string | null;
    /** ISO date of the clicked slot — forwarded to the new-patient form. */
    data?: string | null;
    /** Set when rescheduling — pre-selects the patient. */
    paciente?: Paciente | null;
    /** Id of the patient whose series is being rescheduled. */
    pacienteId?: string;
  } | null>(null);
  const [viewAnim, setViewAnim] = useState(true);
  const viewRef = useRef<HTMLDivElement>(null);
  const [vSlider, setVSlider] = useState({ left: 0, width: 0 });

  const lista = useMemo(() => pacientes ?? [], [pacientes]);
  const events = useMemo(() => buildEvents(lista), [lista]);

  // Synthetic weekday/time events so the modal can mark occupied slots. One per
  // patient slot, keyed by patient id so a patient's own slot can be excluded
  // when rescheduling them.
  const occupiedEventos = useMemo<AgendaSemanal[]>(
    () =>
      lista
        .filter((p) => p.sessao)
        .map((p) => ({
          id: p.id,
          dia: weekdayLabel(p.sessao!.dataInicio),
          diaNum: 0,
          hora: p.sessao!.hora,
          paciente: p.nome,
          tipo: "Sessão",
          cor: corForStatus(p.status),
        })),
    [lista],
  );

  /**
   * Sets (or reschedules) a patient's recurring slot. Keeps the series' existing
   * start week when it has one, otherwise anchors to the reference week.
   */
  async function handleAgendamentoConfirm(pacienteId: string, dia: string, hora: string) {
    const paciente = lista.find((p) => p.id === pacienteId);
    if (!paciente) return;
    const base = paciente.sessao?.dataInicio ?? REFERENCE_WEEK.Seg;
    const dataInicio = dateForWeekdayInWeek(base, dia);
    await patientService.update(pacienteId, {
      sessao: { dataInicio, hora },
      proximaSessao: { data: formatDayMonth(dataInicio), hora, label: "" },
      previsaoAlta: calcAltaDate(dataInicio, paciente.totalSessoes),
    });
  }

  function abrirAgendamento(
    init: {
      dia: string;
      hora: string | null;
      data?: string | null;
      paciente?: Paciente | null;
      pacienteId?: string;
    } | null,
  ) {
    setAgendarInit(init);
    setShowAgendar(true);
  }

  // Clicking an existing session opens the modal to reschedule the whole series.
  function handleEventClick(arg: EventClickArg) {
    const start = arg.event.start;
    if (!start) return;
    const dia = DOW_TO_LABEL[start.getDay()];
    if (!dia) return;
    const hora = `${String(start.getHours()).padStart(2, "0")}:00`;
    const pacienteId = arg.event.extendedProps.pacienteId as string;
    const paciente = lista.find((p) => p.id === pacienteId) ?? null;
    abrirAgendamento({ dia, hora, paciente, pacienteId });
  }

  // Clicking an empty slot opens the modal pre-filled with that day/time.
  function handleDateClick(arg: DateClickArg) {
    const dia = DOW_TO_LABEL[arg.date.getDay()];
    if (!dia) return; // ignore weekends / unsupported days
    const data = localISODate(arg.date);
    if (arg.allDay) {
      // Month view: only the day is known — let the user pick the time.
      abrirAgendamento({ dia, hora: null, data });
      return;
    }
    const hora = `${String(arg.date.getHours()).padStart(2, "0")}:00`;
    const ocupado = occupiedEventos.some((e) => e.dia === dia && e.hora === hora);
    abrirAgendamento({ dia, hora: ocupado ? null : hora, data });
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
    const old = info.oldEvent.start;
    if (!start || !old) return;
    const diaLongo = capitalize(
      new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(start),
    );
    const hora = `${String(start.getHours()).padStart(2, "0")}:00`;
    // Whole-day shift between the dragged occurrence's old and new dates; applied
    // to the series start so every remaining session moves with it.
    const deltaDays = Math.round((start.getTime() - old.getTime()) / 86_400_000);
    setPendingMove({
      info,
      paciente: info.event.extendedProps.paciente,
      quando: `${diaLongo}, ${hora}`,
      pacienteId: info.event.extendedProps.pacienteId as string,
      deltaDays,
      hora,
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

  async function confirmMove() {
    if (pendingMove) {
      const paciente = lista.find((p) => p.id === pendingMove.pacienteId);
      if (paciente?.sessao) {
        const dataInicio = addDaysISO(paciente.sessao.dataInicio, pendingMove.deltaDays);
        await patientService.update(pendingMove.pacienteId, {
          sessao: { dataInicio, hora: pendingMove.hora },
          proximaSessao: { data: formatDayMonth(dataInicio), hora: pendingMove.hora, label: "" },
          previsaoAlta: calcAltaDate(dataInicio, paciente.totalSessoes),
        });
      }
    }
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
          eventClick={handleEventClick}
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
          pacientes={lista}
          // When rescheduling, exclude the patient's own slot so it shows as
          // selected (and reselectable) rather than disabled-occupied.
          eventos={
            agendarInit?.pacienteId
              ? occupiedEventos.filter((e) => e.id !== agendarInit.pacienteId)
              : occupiedEventos
          }
          diaInicial={agendarInit?.dia}
          horaInicial={agendarInit?.hora ?? null}
          dataInicial={agendarInit?.data ?? null}
          pacienteInicial={agendarInit?.paciente ?? null}
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
