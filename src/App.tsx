import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Agenda from "./pages/Agenda";
import Pacientes from "./pages/Pacientes";
import PacienteDetail from "./pages/PacienteDetail";
import PacienteResumo from "./pages/PacienteResumo";
import PlanoTratamento from "./pages/PlanoTratamento";
import PacienteDocumentos from "./pages/PacienteDocumentos";
import Documentos from "./pages/Documentos";
import Biblioteca from "./pages/Biblioteca";
import CadastroPaciente from "./pages/CadastroPaciente";
import CadastroExercicio from "./pages/CadastroExercicio";
import mockData from "./data/mock.json";
import type { MockData } from "./types";

const data = mockData as MockData;

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ padding: 40, color: "#6b8f7b", fontSize: 18, textAlign: "center" }}>
      {title} — em breve
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout doctor={data.doctor} alertCount={data.alertas.length} />}>
        <Route
          index
          element={
            <Dashboard
              stats={data.stats}
              agendaHoje={data.agendaHoje}
              alertas={data.alertas}
              doctorName={data.doctor.name}
            />
          }
        />
        <Route path="agenda" element={<Agenda eventos={data.agendaSemanal} />} />
        <Route path="pacientes" element={<Pacientes pacientes={data.pacientes} />} />
        <Route path="pacientes/:id" element={<PacienteDetail pacientes={data.pacientes} />}>
          <Route index element={<PacienteResumo />} />
          <Route path="plano" element={<PlanoTratamento />} />
          <Route path="evolucao" element={<PlaceholderPage title="Evolução" />} />
          <Route path="documentos" element={<PacienteDocumentos />} />
        </Route>
        <Route path="biblioteca" element={<Biblioteca />} />
        <Route path="biblioteca/novo" element={<CadastroExercicio />} />
        <Route path="pacientes/novo" element={<CadastroPaciente />} />
        <Route path="documentos" element={<Documentos />} />
      </Route>
    </Routes>
  );
}
