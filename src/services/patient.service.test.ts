import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "../db";
import { patientService } from "./patient.service";
import type { Paciente } from "../types";

const novo: Paciente = {
  id: "p-new", nome: "Novo Paciente", initials: "NP", idade: 40, sexo: "Masculino",
  status: "Avaliação", condicao: "Lombalgia", sessoes: 0, totalSessoes: 12, adesao: 0,
  adesaoVariacao: 0, ultimaVisita: "—", dorEVA: 5, dorInicio: 5, previsaoAlta: "—",
  proximaSessao: null, ultimaEvolucao: null, adesaoSemanal: [], planoTratamento: null,
};

describe("patientService", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("getAll returns every seeded patient", async () => {
    expect(await patientService.getAll()).toHaveLength(7);
  });

  it("getById resolves a known patient and undefined for an unknown one", async () => {
    expect((await patientService.getById("p1"))?.nome).toBe("Maria Silva");
    expect(await patientService.getById("nope")).toBeUndefined();
  });

  it("create persists a new patient", async () => {
    await patientService.create(novo);

    expect(await patientService.getAll()).toHaveLength(8);
    const stored = await patientService.getById("p-new");
    expect(stored?.nome).toBe("Novo Paciente");
  });

  it("update mutates fields and reports rows changed", async () => {
    const changed = await patientService.update("p1", { adesao: 99, dorEVA: 1 });
    expect(changed).toBe(1);

    const p = await patientService.getById("p1");
    expect(p?.adesao).toBe(99);
    expect(p?.dorEVA).toBe(1);
  });

  it("update persists a nested treatment-plan change", async () => {
    const plano = {
      observacoes: "Atualizado",
      fases: [{ id: "f1", nome: "Plano", exercicios: [] }],
    };
    await patientService.update("p1", { planoTratamento: plano });

    const p = await patientService.getById("p1");
    expect(p?.planoTratamento?.observacoes).toBe("Atualizado");
    expect(p?.planoTratamento?.fases).toHaveLength(1);
  });

  it("update returns 0 for a non-existent patient", async () => {
    expect(await patientService.update("nope", { adesao: 1 })).toBe(0);
  });

  it("remove deletes a patient permanently", async () => {
    await patientService.remove("p1");

    expect(await patientService.getById("p1")).toBeUndefined();
    expect(await patientService.getAll()).toHaveLength(6);
  });
});
