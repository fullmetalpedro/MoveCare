import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "../db";
import { exerciseService } from "./exercise.service";

describe("exerciseService", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("getLibrary returns the full seeded catalogue", async () => {
    const lib = await exerciseService.getLibrary();
    expect(lib).toHaveLength(15);
    expect(lib.find((e) => e.id === "ex1")?.nome).toBe("Agachamento Livre");
  });
});
