export const ANAMNESE_STEPS = [
  { id: 1, title: 'Identificação', subtitle: 'Equipe que acompanha o aluno' },
  { id: 2, title: 'Comprometimentos', subtitle: 'Informações clínicas já cadastradas' },
  { id: 3, title: 'Histórico', subtitle: 'Trajetória e desenvolvimento do aluno' },
  { id: 4, title: 'Saúde', subtitle: 'Medicações, terapias e cuidados' },
  { id: 5, title: 'Perfil pedagógico', subtitle: 'Potencialidades e formas de aprendizagem' },
  { id: 6, title: 'Família', subtitle: 'Rotina e informações familiares' },
  { id: 7, title: 'Escola', subtitle: 'Registros da equipe escolar e anexos' },
];

export const MORADIA_OPTIONS = ['Pai', 'Mãe', 'Avós', 'Tios', 'Responsável', 'Outros'];
export const COMUNICACAO_OPTIONS = ['Verbal', 'Não verbal', 'Comunicação alternativa', 'Libras'];
export const APRENDIZAGEM_OPTIONS = ['Visual', 'Auditivo', 'Leitura', 'Prática'];
export const TERAPIA_OPTIONS = ['Psicologia', 'TO', 'Fonoaudiologia', 'Fisioterapia', 'Psicopedagogia', 'Equoterapia'];

export const ANAMNESE_ATTACHMENT_CATEGORIES = [
  { value: 'LAUDO', label: 'Laudo' },
  { value: 'RECEITA', label: 'Receita' },
  { value: 'RELATORIO_PEDAGOGICO', label: 'Relatório' },
  { value: 'AVALIACAO', label: 'Avaliação' },
  { value: 'PDI', label: 'PDI' },
  { value: 'OUTRO', label: 'Outro' },
];

export const EMPTY_ANAMNESE = {
  professorSalaRecursos: '',
  profissionalApoio: '',
  funcaoProfissionalApoio: '',
  motivoMatriculaSrm: '',
  quemEAluno: '',
  ondeMora: '',
  comQuemMora: [],
  desenvolvimento: '',
  gestacao: '',
  complicacoesParto: '',
  possuiIrmaos: null,
  quantidadeIrmaos: '',
  comunicacao: [],
  usaMedicacao: null,
  medicamentos: [],
  terapias: [],
  alergias: '',
  restricoesAlimentares: '',
  crisesRecorrentes: '',
  informacoesMedicas: '',
  potencialidades: '',
  interesses: '',
  maiorFacilidade: '',
  maiorDificuldade: '',
  necessitaAdaptacoes: '',
  reacaoMudancas: '',
  hiperfoco: '',
  formasAprendizagem: [],
  responsavelRespondente: '',
  rotinaCasa: '',
  expectativasFamilia: '',
  orientacaoImportante: '',
  comportamentosForaEscola: '',
  observacaoSalaOutrosEspacos: '',
  professorRegente: '',
  salaRecursos: '',
  equipePedagogica: '',
  observacoesGerais: '',
};

export function normalizeAnamnese(data) {
  return {
    ...EMPTY_ANAMNESE,
    ...(data || {}),
    quantidadeIrmaos: data?.quantidadeIrmaos == null ? '' : String(data.quantidadeIrmaos),
    comQuemMora: data?.comQuemMora || [],
    comunicacao: data?.comunicacao || [],
    formasAprendizagem: data?.formasAprendizagem || [],
    medicamentos: data?.medicamentos || [],
    terapias: data?.terapias || [],
  };
}

export function anamnesePayload(values) {
  return {
    ...values,
    quantidadeIrmaos: values.quantidadeIrmaos === '' ? null : Number(values.quantidadeIrmaos),
  };
}
