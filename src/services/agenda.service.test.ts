import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "../db";
import { agendaService } from "./agenda.service";
import { patientService } from "./patient.service";

describe("agendaService", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("getTodayItems derives a day's list from patients' weekly slots", async () => {
    const hoje = await agendaService.getTodayItems("2026-04-28");
    // On Ter 28/04: Maria 08, João 09, Pedro 14, Fernanda 15.
    expect(hoje).toHaveLength(4);
    expect(hoje[0]).toMatchObject({ hora: "08:00", paciente: "Maria Silva", status: "confirmado" });
    // João is in evaluation → "avaliacao" status.
    expect(hoje[1]).toMatchObject({ hora: "09:00", paciente: "João Pereira", status: "avaliacao" });
  });

  it("reflects a newly scheduled patient on the day they start", async () => {
    await patientService.create({
      id: "p-new", nome: "Novo Hoje", initials: "NH", idade: 30, sexo: "Outro",
      status: "Ativo", condicao: "Teste", sessoes: 0, totalSessoes: 4, adesao: 0,
      adesaoVariacao: 0, ultimaVisita: "—", dorEVA: 0, dorInicio: 0, previsaoAlta: "—",
      proximaSessao: null, sessao: { dataInicio: "2026-04-28", hora: "16:00" },
      ultimaEvolucao: null, adesaoSemanal: [], planoTratamento: null,
    });

    const hoje = await agendaService.getTodayItems("2026-04-28");
    expect(hoje).toHaveLength(5);
    expect(hoje.find((i) => i.paciente === "Novo Hoje")?.hora).toBe("16:00");
  });

  it("getAlerts returns the seeded alerts", async () => {
    expect(await agendaService.getAlerts()).toHaveLength(3);
  });
});
