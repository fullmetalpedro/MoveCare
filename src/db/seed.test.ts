import { describe, it, expect, beforeEach } from "vitest";
import { db, TEMPLATE_SCOPE } from "./schema";
import { seedIfEmpty, resetDatabase } from "./seed";
import type { Paciente } from "../types";

/** Minimal valid patient used to verify writes survive re-seeding. */
const extraPatient: Paciente = {
  id: "p-test", nome: "Teste", initials: "TE", idade: 30, sexo: "Outro",
  status: "Ativo", condicao: "Teste", sessoes: 0, totalSessoes: 10, adesao: 0,
  adesaoVariacao: 0, ultimaVisita: "—", dorEVA: 0, dorInicio: 0, previsaoAlta: "—",
  proximaSessao: null, ultimaEvolucao: null, adesaoSemanal: [], planoTratamento: null,
};

describe("seedIfEmpty", () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it("populates every table from the bundled dataset", async () => {
    await seedIfEmpty();

    expect(await db.doctor.count()).toBe(1);
    expect(await db.pacientes.count()).toBe(7);
    expect(await db.alertas.count()).toBe(3);
    expect(await db.exerciseLibrary.count()).toBe(15);
    // 2 templates + 2 sample docs per patient (7 patients) = 16.
    expect(await db.documents.count()).toBe(16);
  });

  it("stores the seed-version guard in meta", async () => {
    await seedIfEmpty();
    expect((await db.meta.get("seedVersion"))?.value).toBe(2);
  });

  it("tags templates and patient documents with the right scope", async () => {
    await seedIfEmpty();

    const templates = await db.documents.where("patientId").equals(TEMPLATE_SCOPE).toArray();
    expect(templates).toHaveLength(2);

    const p1docs = await db.documents.where("patientId").equals("p1").toArray();
    expect(p1docs).toHaveLength(2);
  });

  it("is idempotent — re-running does not wipe later writes", async () => {
    await seedIfEmpty();
    await db.pacientes.add(extraPatient);
    expect(await db.pacientes.count()).toBe(8);

    await seedIfEmpty(); // version already current → must be a no-op

    expect(await db.pacientes.count()).toBe(8);
    expect(await db.pacientes.get("p-test")).toBeTruthy();
  });
});

describe("resetDatabase", () => {
  it("wipes user changes and restores the seeded state", async () => {
    await resetDatabase();
    await db.pacientes.add(extraPatient);
    expect(await db.pacientes.count()).toBe(8);

    await resetDatabase();

    expect(await db.pacientes.count()).toBe(7);
    expect(await db.pacientes.get("p-test")).toBeUndefined();
  });
});
