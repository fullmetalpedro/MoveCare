import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import mockData from "./data/mock.json";
import type { MockData } from "./types";

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
// Design-system showcase (not linked in the sidebar; visit /styleguide directly).
const Styleguide = lazy(() => import("./pages/Styleguide"));

const data = mockData as MockData;

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
          <Route element={<Layout doctor={data.doctor} alertCount={data.alertas.length} />}>
            <Route
              index
              element={
                <Dashboard
                  stats={data.stats}
                  agendaHoje={data.agendaHoje}
                  doctorName={data.doctor.name}
                  pacientes={data.pacientes}
                />
              }
            />
            <Route path="agenda" element={<Agenda eventos={data.agendaSemanal} pacientes={data.pacientes} />} />
            <Route path="pacientes" element={<Pacientes pacientes={data.pacientes} />} />
            <Route path="pacientes/:id" element={<PacienteDetail pacientes={data.pacientes} />}>
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
          </Route>
          <Route path="/styleguide" element={<Styleguide />} />
        </Routes>
      </Suspense>
    </>
  );
}
