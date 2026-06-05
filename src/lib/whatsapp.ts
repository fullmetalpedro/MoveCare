import type { Paciente, Exercicio, AvaliacaoTeste, TesteResult } from "../types";

/**
 * Formats a single test result as a WhatsApp-ready text block.
 *
 * Each `caso` type gets a dedicated emoji prefix and a human-readable label.
 * Called by {@link buildAvaliacaoWhatsAppText} for every test in an assessment.
 *
 * @param t - The test result to format; the discriminated union `tipo` field
 *   determines which branch is rendered.
 * @returns A newline-joined string block for the given test, e.g.:
 *   `"⏱ *TUG — Timed Up and Go*\n   Tempo: 12.3s  |  Distância: 3m"`.
 *
 * @example
 * const block = formatTesteWA({ tipo: "tug", tempoSegundos: 12.3, distanciaMetros: 3 });
 * // "⏱ *TUG — Timed Up and Go*\n   Tempo: 12.3s  |  Distância: 3m"
 */
export function formatTesteWA(t: TesteResult): string {
  const lines: string[] = [];
  switch (t.tipo) {
    case "tug":
      lines.push(`⏱ *TUG — Timed Up and Go*`);
      lines.push(`   Tempo: ${t.tempoSegundos}s  |  Distância: ${t.distanciaMetros}m`);
      break;
    case "dinamometria":
      lines.push(`💪 *Dinamometria de Preensão*`);
      lines.push(`   Esquerda: ${t.esquerda} kgf  |  Direita: ${t.direita} kgf`);
      break;
    case "mrc":
      lines.push(`📋 *Escala MRC*`);
      t.grupos.forEach(g => lines.push(`   ${g.nome}: ${g.valor}/5`));
      break;
    case "sit_to_stand":
      lines.push(`🪑 *Sentar-Levantar 30s*`);
      lines.push(`   Repetições: ${t.repeticoes}`);
      break;
    case "10mwt":
      lines.push(`🚶 *10MWT — Teste de Caminhada*`);
      lines.push(`   Tempo: ${t.tempoSegundos}s  |  Velocidade: ${t.velocidade} m/s`);
      break;
    case "dgi":
      lines.push(`🏃 *DGI — Índice de Marcha Dinâmica*`);
      lines.push(`   Total: ${t.total}/24`);
      break;
    case "tdr":
      lines.push(`🕐 *Teste do Relógio*`);
      if (t.observacao) lines.push(`   Obs: ${t.observacao}`);
      break;
    case "mmse":
      lines.push(`🧠 *MMSE*`);
      lines.push(`   Total: ${t.total}/30`);
      break;
    case "moca":
      lines.push(`🧩 *MoCA*`);
      lines.push(`   Total: ${t.total}/30`);
      break;
  }
  return lines.join("\n");
}

/**
 * Builds a WhatsApp-ready treatment plan message for a patient.
 *
 * The output is an emoji-prefixed, bold-formatted list of exercises suitable
 * for pasting directly into a WhatsApp conversation.
 *
 * @param paciente - The patient whose plan is being shared; `nome` and
 *   `condicao` appear in the message header.
 * @param exercicios - Ordered list of exercises to include; each item renders
 *   its name, category, series count, and optional video link or description.
 * @returns A newline-joined string ready for `navigator.clipboard.writeText`.
 *
 * @example
 * const text = buildPlanWhatsAppText(paciente, plano.fases.flatMap(f => f.exercicios));
 * await navigator.clipboard.writeText(text);
 */
export function buildPlanWhatsAppText(paciente: Paciente, exercicios: Exercicio[]): string {
  const lines: string[] = [];
  lines.push(`🏥 *Plano de Tratamento*`);
  lines.push(`👤 *${paciente.nome}*`);
  lines.push(`📋 ${paciente.condicao}`);
  lines.push(``);
  lines.push(`*Exercícios:*`);
  lines.push(``);

  exercicios.forEach((ex, idx) => {
    const num = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"][idx] ?? `${idx + 1}.`;
    lines.push(`${num} *${ex.nome}*`);
    lines.push(`   📌 ${ex.categoria}`);
    lines.push(`   🔁 ${ex.series}`);
    if (ex.videoUrl) {
      lines.push(`   🎥 ${ex.videoUrl}`);
    } else if (ex.descricao) {
      lines.push(`   📝 ${ex.descricao}`);
    }
    lines.push(``);
  });

  lines.push(`_Dúvidas? Entre em contato com seu fisioterapeuta._`);
  return lines.join("\n");
}

/**
 * Builds a WhatsApp-ready clinical assessment report for a patient.
 *
 * Composes all test results from an {@link AvaliacaoTeste} record into a
 * single formatted message by calling {@link formatTesteWA} for each test.
 *
 * @param paciente - The patient the assessment belongs to; `nome` appears in
 *   the message header.
 * @param av - The assessment record containing the date, clinician name, and
 *   individual test results.
 * @returns A newline-joined string ready for `navigator.clipboard.writeText`.
 *
 * @example
 * const text = buildAvaliacaoWhatsAppText(paciente, avaliacoes[0]);
 * await navigator.clipboard.writeText(text);
 */
export function buildAvaliacaoWhatsAppText(paciente: Paciente, av: AvaliacaoTeste): string {
  const lines: string[] = [];
  lines.push(`📊 *Avaliação Clínica — ${av.data}*`);
  lines.push(`👤 *${paciente.nome}*`);
  lines.push(`🩺 ${av.doutor}`);
  lines.push(``);
  lines.push(`*Resultados:*`);
  lines.push(``);
  av.testes.forEach(t => {
    lines.push(formatTesteWA(t));
    lines.push(``);
  });
  lines.push(`_Relatório gerado via MoveCare_`);
  return lines.join("\n");
}
