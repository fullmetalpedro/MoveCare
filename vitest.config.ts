import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for the data-layer test suite.
 *
 * Tests run in a Node environment against a fake IndexedDB (see
 * `src/test/setup.ts`), so the Dexie services exercise real persistence logic
 * — every create/update/delete is verified against an actual object store.
 */
export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts"],
  },
});
