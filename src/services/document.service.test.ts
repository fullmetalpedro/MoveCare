import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase, TEMPLATE_SCOPE } from "../db";
import { documentService } from "./document.service";

describe("documentService", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("getTemplates returns only clinic-level templates", async () => {
    const templates = await documentService.getTemplates();
    expect(templates).toHaveLength(2);
    expect(templates.every((d) => d.patientId === TEMPLATE_SCOPE)).toBe(true);
  });

  it("getForPatient returns that patient's documents with a primary key", async () => {
    const docs = await documentService.getForPatient("p1");
    expect(docs).toHaveLength(2);
    expect(docs.every((d) => d.patientId === "p1")).toBe(true);
    expect(docs.every((d) => typeof d.pk === "number")).toBe(true);
  });

  it("getForPatient returns an empty list for an unknown patient", async () => {
    expect(await documentService.getForPatient("nope")).toHaveLength(0);
  });

  it("remove deletes a single document permanently", async () => {
    const docs = await documentService.getForPatient("p1");
    await documentService.remove(docs[0].pk!);

    const after = await documentService.getForPatient("p1");
    expect(after).toHaveLength(1);
    expect(after.find((d) => d.pk === docs[0].pk)).toBeUndefined();
  });
});
