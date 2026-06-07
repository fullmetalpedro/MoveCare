import { describe, it, expect, beforeEach } from "vitest";
import { db, resetDatabase } from "../db";
import { dashboardService } from "./dashboard.service";
import { patientService } from "./patient.service";

describe("dashboardService", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("computes stats live from the seeded database", async () => {
    const { doctor, stats, agendaHoje, alertCount } = await dashboardService.getOverview("2026-04-28");

    expect(doctor.name).toBe("Dra. Ana Paula");
    // 5 active patients (p1,p3,p4,p5,p7); 1 in evaluation (p2).
    expect(stats.pacientesAtivos).toBe(5);
    expect(stats.pacientesEmAvaliacao).toBe(1);
    // Mean adherence of the active patients: (88+72+65+40+95)/5 = 72.
    expect(stats.adesaoGeral).toBe(72);
    // Mean variation: (5-2-8-15+0)/5 = -4.
    expect(stats.adesaoVariacao).toBe(-4);
    // Today (29/04) has 4 sessions: 2 morning (08,09), 2 afternoon (14,15).
    expect(stats.pacientesHoje).toBe(4);
    expect(stats.pacientesHojeDetalhe).toBe("2 manhã · 2 tarde");
    expect(agendaHoje).toHaveLength(4);
    expect(alertCount).toBe(3);
  });

  it("reflects writes — adding an active patient raises the count and adherence", async () => {
    await patientService.create({
      id: "p-new", nome: "Novo Ativo", initials: "NA", idade: 30, sexo: "Outro",
      status: "Ativo", condicao: "Teste", sessoes: 0, totalSessoes: 10, adesao: 100,
      adesaoVariacao: 0, ultimaVisita: "—", dorEVA: 0, dorInicio: 0, previsaoAlta: "—",
      proximaSessao: null, ultimaEvolucao: null, adesaoSemanal: [], planoTratamento: null,
    });

    const { stats } = await dashboardService.getOverview("2026-04-28");
    expect(stats.pacientesAtivos).toBe(6);
    // (88+72+65+40+95+100)/6 = 76.67 → 77.
    expect(stats.adesaoGeral).toBe(77);
  });

  it("returns zeroed stats but always the clinician identity on an empty database", async () => {
    await db.delete();
    await db.open();

    const { doctor, stats, agendaHoje, alertCount } = await dashboardService.getOverview("2026-04-28");
    expect(doctor.name).toBe("Dra. Ana Paula");
    expect(stats).toMatchObject({
      pacientesHoje: 0,
      pacientesAtivos: 0,
      pacientesEmAvaliacao: 0,
      adesaoGeral: 0,
      adesaoVariacao: 0,
    });
    expect(agendaHoje).toHaveLength(0);
    expect(alertCount).toBe(0);
  });
});
