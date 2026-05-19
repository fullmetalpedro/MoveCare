import { useOutletContext, useNavigate } from "react-router-dom";
import { Timer, Dumbbell, PlusCircle } from "lucide-react";
import type { Paciente, TUGResult, DinamometriaResult } from "../types";
import "./Evolucao.css";

const TEST_LABELS: Record<string, string> = {
  tug: "TUG",
  dinamometria: "Dinamometria",
  mrc: "Escala MRC",
  sit_to_stand: "Sentar-Levantar 30s",
  "10mwt": "10MWT",
  dgi: "DGI",
  tdr: "Teste do Relógio",
  mmse: "MMSE",
  moca: "MoCA",
};

function Sparkline({ values, color, invert = false }: { values: number[]; color: string; invert?: boolean }) {
  const W = 300, H = 72, PAD = 10;
  if (values.length < 2) return <p className="spark-na">Dados insuficientes para gráfico</p>;

  const display = invert ? values.map(v => -v) : values;
  const min = Math.min(...display);
  const max = Math.max(...display);
  const range = max - min || 1;

  const pts: [number, number][] = display.map((v, i) => [
    PAD + (i / (display.length - 1)) * (W - PAD * 2),
    PAD + (1 - (v - min) / range) * (H - PAD * 2),
  ]);

  const polyline = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `M${pts[0][0]},${H} ${pts.map(([x, y]) => `L${x},${y}`).join(" ")} L${pts[pts.length - 1][0]},${H} Z`;
  const gradId = `g${color.replace("#", "")}`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={polyline} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={color} stroke="var(--card-bg)" strokeWidth="2" />
      ))}
    </svg>
  );
}

function DeltaBadge({ first, last, invertGood }: { first: number; last: number; invertGood?: boolean }) {
  const diff = last - first;
  if (Math.abs(diff) < 0.01) return null;
  const good = invertGood ? diff < 0 : diff > 0;
  const pct = Math.abs(diff / first * 100).toFixed(0);
  return (
    <span className={`delta-badge ${good ? "delta-good" : "delta-bad"}`}>
      {diff < 0 ? "↓" : "↑"} {pct}%
    </span>
  );
}

export default function Evolucao() {
  const paciente = useOutletContext<Paciente>();
  const navigate = useNavigate();
  const avaliacoes = paciente.avaliacoes ?? [];

  const tugData = avaliacoes.flatMap(av =>
    av.testes
      .filter((t): t is TUGResult => t.tipo === "tug")
      .map(t => ({ data: av.data, tempo: t.tempoSegundos }))
  );

  const dinaData = avaliacoes.flatMap(av =>
    av.testes
      .filter((t): t is DinamometriaResult => t.tipo === "dinamometria")
      .map(t => ({ data: av.data, esquerda: t.esquerda, direita: t.direita }))
  );

  if (avaliacoes.length === 0) {
    return (
      <div className="evolucao-empty">
        <div className="evolucao-empty-icon">
          <Dumbbell size={40} />
        </div>
        <h2>Sem avaliações registradas</h2>
        <p>Realize a primeira avaliação para começar a acompanhar a evolução do paciente.</p>
        <button className="btn-nova-av" onClick={() => navigate(`/pacientes/${paciente.id}/avaliacao/nova`)}>
          <PlusCircle size={15} /> Nova Avaliação
        </button>
      </div>
    );
  }

  return (
    <div className="evolucao-page">
      <div className="evolucao-header">
        <div>
          <h1>Evolução</h1>
          <p className="evolucao-subtitle">
            {paciente.nome} · {avaliacoes.length} avaliação{avaliacoes.length !== 1 ? "ões" : ""}
          </p>
        </div>
        <button className="btn-nova-av" onClick={() => navigate(`/pacientes/${paciente.id}/avaliacao/nova`)}>
          <PlusCircle size={15} /> Nova Avaliação
        </button>
      </div>

      <div className="evolucao-charts">
        {tugData.length > 0 && (
          <div className="ev-chart-card">
            <div className="ev-chart-header">
              <div className="ev-chart-icon" style={{ background: "rgba(0,122,255,0.1)", color: "#007AFF" }}>
                <Timer size={18} />
              </div>
              <div className="ev-chart-titles">
                <div className="ev-chart-title">TUG — Timed Up and Go</div>
                <div className="ev-chart-sub">Tempo (s) · menor é melhor</div>
              </div>
              {tugData.length >= 2 && (
                <DeltaBadge first={tugData[0].tempo} last={tugData[tugData.length - 1].tempo} invertGood />
              )}
            </div>
            <div className="ev-chart-area">
              <Sparkline values={tugData.map(d => d.tempo)} color="#007AFF" invert />
            </div>
            <div className="ev-chart-points">
              {tugData.map((d, i) => (
                <div key={i} className="ev-point">
                  <span className="ev-point-date">{d.data}</span>
                  <span className="ev-point-val">{d.tempo}s</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {dinaData.length > 0 && (
          <div className="ev-chart-card">
            <div className="ev-chart-header">
              <div className="ev-chart-icon" style={{ background: "rgba(52,199,89,0.1)", color: "#34C759" }}>
                <Dumbbell size={18} />
              </div>
              <div className="ev-chart-titles">
                <div className="ev-chart-title">Dinamometria de Preensão</div>
                <div className="ev-chart-sub">Força média (kgf) · maior é melhor</div>
              </div>
              {dinaData.length >= 2 && (
                <DeltaBadge
                  first={(dinaData[0].esquerda + dinaData[0].direita) / 2}
                  last={(dinaData[dinaData.length - 1].esquerda + dinaData[dinaData.length - 1].direita) / 2}
                />
              )}
            </div>
            <div className="ev-chart-area">
              <Sparkline values={dinaData.map(d => (d.esquerda + d.direita) / 2)} color="#34C759" />
            </div>
            <div className="ev-chart-points">
              {dinaData.map((d, i) => (
                <div key={i} className="ev-point">
                  <span className="ev-point-date">{d.data}</span>
                  <span className="ev-point-val">E {d.esquerda} / D {d.direita} kgf</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="evolucao-timeline card">
        <h2>Histórico de Avaliações</h2>
        <div className="timeline-list">
          {[...avaliacoes].reverse().map((av, i, arr) => (
            <div key={av.id} className="tl-item">
              <div className="tl-dot-row">
                <div className="tl-dot" />
                {i < arr.length - 1 && <div className="tl-connector" />}
              </div>
              <div className="tl-content">
                <div className="tl-date">{av.data}</div>
                <div className="tl-doc">{av.doutor}</div>
                <div className="tl-tests">
                  {av.testes.map((t, j) => (
                    <span key={j} className="tl-chip">{TEST_LABELS[t.tipo] ?? t.tipo}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
