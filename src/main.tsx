import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/tokens.css";
import "./index.css";
import "./i18n";
import { db, seedIfEmpty, resetDatabase } from "./db";
import App from "./App.tsx";

// The bundled mock dataset is NO LONGER loaded automatically — the app starts
// against whatever is already in IndexedDB (empty on a fresh install). The seed
// remains available on demand; in development it's exposed on `window` so the
// demo data can be managed from the console:
//   movecare.seed()   → load the mock dataset if the DB is empty
//   movecare.reset()  → wipe and reload the mock dataset
//   movecare.clear()  → empty the DB (drops any previously-seeded data) and reload
if (import.meta.env.DEV) {
  (window as unknown as { movecare: Record<string, () => Promise<void>> }).movecare = {
    seed: seedIfEmpty,
    reset: resetDatabase,
    clear: async () => {
      await db.delete();
      location.reload();
    },
  };
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
