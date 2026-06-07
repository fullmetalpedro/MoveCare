// Installs a fake IndexedDB implementation onto the global scope so Dexie can
// open real object stores inside the Node test environment. Imported once via
// the Vitest `setupFiles` hook, before any test module runs.
import "fake-indexeddb/auto";
