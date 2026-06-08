import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import { dashboardService, patientService, agendaService } from "./services";

// Dashboard + Layout stay eager (Dashboard is the landing route, so no
// Suspense flash on first paint). Everything else is split into its own
// chunk and loaded on demand — this is what moves @fullcalendar out of the
// initial bundle, since Agenda is the only consumer.
const Agenda = lazy(() => import("./pages/Agenda"));
const Pacientes = lazy(() => import("./pages/Pacientes"));
const PacienteDetail = lazy(() => import("./pages/PacienteDetail"));
const PacienteResumo = lazy(() => import("./pages/PacienteResumo"));
const PlanoTratamento = lazy(() => import("./pages/PlanoTratamento"));
const PacienteDocumentos = lazy(() => import("./pages/PacienteDocumentos"));
const Evolucao = lazy(() => import("./pages/Evolucao"));
const NovaAvaliacao = lazy(() => import("./pages/NovaAvaliacao"));
const Documentos = lazy(() => import("./pages/Documentos"));
const Biblioteca = lazy(() => import("./pages/Biblioteca"));
const CadastroPaciente = lazy(() => import("./pages/CadastroPaciente"));
const CadastroExercicio = lazy(() => import("./pages/CadastroExercicio"));
const DesignSystem = lazy(() => import("./pages/DesignSystem"));
// Design-system showcase (not linked in the sidebar; visit /styleguide directly).
const Styleguide = lazy(() => import("./pages/Styleguide"));

const { doctor, stats, agendaHoje, alertCount } = dashboardService.getOverview();
const pacientes = patientService.getAll();
const eventos = agendaService.getWeek();

/**
 * Fallback spinner shown by `<Suspense>` while a lazy-loaded page chunk loads.
 *
 * @returns A centered `<div>` with a CSS spinner, aria-labeled as busy.
 */
function RouteFallback() {
  return (
    <div className="route-fallback" aria-busy="true">
      <span className="route-spinner" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <SplashScreen />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<Layout doctor={doctor} alertCount={alertCount} />}>
            <Route
              index
              element={
                <Dashboard
                  stats={stats}
                  agendaHoje={agendaHoje}
                  doctorName={doctor.name}
                  pacientes={pacientes}
                />
              }
            />
            <Route path="agenda" element={<Agenda eventos={eventos} pacientes={pacientes} />} />
            <Route path="pacientes" element={<Pacientes pacientes={pacientes} />} />
            <Route path="pacientes/:id" element={<PacienteDetail pacientes={pacientes} />}>
              <Route index element={<PacienteResumo />} />
              <Route path="plano" element={<PlanoTratamento />} />
              <Route path="evolucao" element={<Evolucao />} />
              <Route path="avaliacao/nova" element={<NovaAvaliacao />} />
              <Route path="documentos" element={<PacienteDocumentos />} />
            </Route>
            <Route path="biblioteca" element={<Biblioteca />} />
            <Route path="biblioteca/novo" element={<CadastroExercicio />} />
            <Route path="pacientes/novo" element={<CadastroPaciente />} />
            <Route path="documentos" element={<Documentos />} />
            <Route path="design-system" element={<DesignSystem />} />
          </Route>
          <Route path="/styleguide" element={<Styleguide />} />
        </Routes>
      </Suspense>
    </>
  );
}
