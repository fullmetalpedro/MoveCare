// ─── Patient form ─────────────────────────────────────────────────────────────

/**
 * Shape of the new-patient registration form, mirroring the fields in
 * `CadastroPaciente`.
 */
export interface PatientFormData {
  nome: string;
  idade: string;
  sexo: string;
  condicao: string;
  status: string;
  telefone: string;
  email: string;
  totalSessoes: string;
  dorEVA: string;
  proximaSessaoData: string;
  proximaSessaoHora: string;
  observacoes: string;
}

/**
 * Validates the new-patient registration form.
 *
 * Rules: `nome` and `condicao` are required; `idade` must be a positive
 * number; `email`, if provided, must match a basic format; `totalSessoes`,
 * if provided, must be a positive number.
 *
 * @param form - The current form values to validate.
 * @returns A partial record mapping field keys to their error messages.
 *   An empty object means the form is valid.
 *
 * @example
 * const errors = validatePatientForm(form);
 * if (Object.keys(errors).length > 0) {
 *   setErrors(errors);
 *   scrollToFirstError();
 * }
 */
export function validatePatientForm(
  form: PatientFormData,
): Partial<Record<keyof PatientFormData, string>> {
  const errs: Partial<Record<keyof PatientFormData, string>> = {};
  if (!form.nome.trim()) errs.nome = "Nome é obrigatório";
  if (!form.idade || isNaN(Number(form.idade)) || Number(form.idade) <= 0)
    errs.idade = "Idade inválida";
  if (!form.condicao.trim()) errs.condicao = "Condição é obrigatória";
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errs.email = "E-mail inválido";
  if (form.totalSessoes && (isNaN(Number(form.totalSessoes)) || Number(form.totalSessoes) <= 0))
    errs.totalSessoes = "Número inválido";
  return errs;
}

// ─── Exercise form ────────────────────────────────────────────────────────────

/**
 * Shape of the new-exercise registration form, mirroring the fields in
 * `CadastroExercicio`.
 */
export interface ExerciseFormData {
  nome: string;
  categoria: string;
  nivel: string;
  series: string;
  temVideo: boolean;
  videoUrl: string;
  descricao: string;
  instrucoes: string;
}

/**
 * Validates the new-exercise registration form.
 *
 * Rules: `nome` and `series` are required; `videoUrl` is required when
 * `temVideo` is `true`.
 *
 * @param form - The current form values to validate.
 * @returns A partial record mapping field keys to their error messages.
 *   An empty object means the form is valid.
 *
 * @example
 * const errors = validateExerciseForm(form);
 * if (Object.keys(errors).length > 0) setErrors(errors);
 */
export function validateExerciseForm(
  form: ExerciseFormData,
): Partial<Record<keyof ExerciseFormData, string>> {
  const errs: Partial<Record<keyof ExerciseFormData, string>> = {};
  if (!form.nome.trim()) errs.nome = "Nome do exercício é obrigatório";
  if (!form.series.trim()) errs.series = "Séries / duração é obrigatório";
  if (form.temVideo && !form.videoUrl.trim())
    errs.videoUrl = "Informe a URL do vídeo";
  return errs;
}

// ─── Session form ─────────────────────────────────────────────────────────────

/**
 * Shape of the session-registration form inside `Evolucao`.
 */
export interface SessionFormData {
  data: string;
  sessaoNum: string;
  observacoes: string;
  exerciciosFeitos: string;
  totalExercicios: string;
}

/**
 * Validates the session-registration form.
 *
 * Rules: all fields are required; `sessaoNum` must be a valid number;
 * `exerciciosFeitos` must be a non-negative number; `totalExercicios` must
 * be a positive number; `exerciciosFeitos` must not exceed `totalExercicios`.
 *
 * @param form - The current form values to validate.
 * @returns A partial record mapping field keys to their error messages.
 *   An empty object means the form is valid.
 *
 * @example
 * const errors = validateSessionForm(form);
 * if (Object.keys(errors).length === 0) saveSession();
 */
export function validateSessionForm(
  form: SessionFormData,
): Partial<Record<keyof SessionFormData, string>> {
  const errs: Partial<Record<keyof SessionFormData, string>> = {};
  if (!form.data.trim()) errs.data = "Informe a data";
  if (!form.sessaoNum.trim() || isNaN(Number(form.sessaoNum))) errs.sessaoNum = "Número inválido";
  if (!form.observacoes.trim()) errs.observacoes = "Adicione uma observação";
  const feitos = Number(form.exerciciosFeitos);
  const total  = Number(form.totalExercicios);
  if (!form.exerciciosFeitos.trim() || isNaN(feitos) || feitos < 0) errs.exerciciosFeitos = "Inválido";
  if (!form.totalExercicios.trim() || isNaN(total) || total <= 0)   errs.totalExercicios = "Inválido";
  if (!errs.exerciciosFeitos && !errs.totalExercicios && feitos > total) errs.exerciciosFeitos = "Maior que o total";
  return errs;
}
