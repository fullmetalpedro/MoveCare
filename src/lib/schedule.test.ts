import { describe, it, expect } from "vitest";
import {
  addDaysISO,
  weekdayLabel,
  dateForWeekdayInWeek,
  sessionDates,
  calcAltaDate,
  formatDateBR,
  formatDayMonth,
  patientsOnDate,
} from "./schedule";
import type { Paciente } from "../types";

function patient(id: string, dataInicio: string | null, total: number): Paciente {
  return {
    id, nome: id, initials: "XX", idade: 30, sexo: "Outro", status: "Ativo",
    condicao: "—", sessoes: 0, totalSessoes: total, adesao: 0, adesaoVariacao: 0,
    ultimaVisita: "—", dorEVA: 0, dorInicio: 0, previsaoAlta: "—", proximaSessao: null,
    sessao: dataInicio ? { dataInicio, hora: "10:00" } : null,
    ultimaEvolucao: null, adesaoSemanal: [], planoTratamento: null,
  };
}

describe("schedule helpers", () => {
  it("addDaysISO handles month/year boundaries", () => {
    expect(addDaysISO("2026-04-29", 7)).toBe("2026-05-06");
    expect(addDaysISO("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysISO("2026-04-29", -1)).toBe("2026-04-28");
  });

  it("weekdayLabel returns the Portuguese short label", () => {
    expect(weekdayLabel("2026-04-28")).toBe("Ter");
    expect(weekdayLabel("2026-04-27")).toBe("Seg");
    expect(weekdayLabel("2026-05-02")).toBe("Sáb");
  });

  it("dateForWeekdayInWeek re-anchors a weekday within the same week", () => {
    // Within the week of Ter 28/04: Qui is 30/04, Seg is 27/04.
    expect(dateForWeekdayInWeek("2026-04-28", "Qui")).toBe("2026-04-30");
    expect(dateForWeekdayInWeek("2026-04-28", "Seg")).toBe("2026-04-27");
  });

  it("sessionDates produces one weekly occurrence per session", () => {
    expect(sessionDates("2026-04-28", 3)).toEqual([
      "2026-04-28", "2026-05-05", "2026-05-12",
    ]);
    expect(sessionDates("2026-04-28", 0)).toEqual([]);
  });

  it("calcAltaDate returns the last session's date, or em-dash", () => {
    // 10 sessions starting 28/04 → last is 9 weeks later = 30/06/2026.
    expect(calcAltaDate("2026-04-28", 10)).toBe("30/06/2026");
    expect(calcAltaDate("2026-04-28", 1)).toBe("28/04/2026");
    expect(calcAltaDate("", 10)).toBe("—");
    expect(calcAltaDate("2026-04-28", 0)).toBe("—");
  });

  it("formats dates for display", () => {
    expect(formatDateBR("2026-04-28")).toBe("28/04/2026");
    expect(formatDayMonth("2026-04-28")).toBe("28/04");
  });

  it("patientsOnDate finds patients whose series lands on a date", () => {
    const pacientes = [
      patient("a", "2026-04-28", 4),   // 28/04, 05/05, 12/05, 19/05
      patient("b", "2026-04-29", 4),   // different weekday
      patient("c", null, 4),           // unscheduled
    ];
    expect(patientsOnDate(pacientes, "2026-04-28").map((x) => x.paciente.id)).toEqual(["a"]);
    expect(patientsOnDate(pacientes, "2026-05-05").map((x) => x.paciente.id)).toEqual(["a"]);
    expect(patientsOnDate(pacientes, "2026-04-29").map((x) => x.paciente.id)).toEqual(["b"]);
    expect(patientsOnDate(pacientes, "2026-06-01")).toHaveLength(0);
  });
});
