export const ANAMNESE_STEPS = [
  { id: 1, title: 'Identificação', subtitle: 'Dados do aluno e do responsável' },
  { id: 2, title: 'Informações familiares', subtitle: 'Moradia e acompanhamento escolar' },
  { id: 3, title: 'Informações gerais', subtitle: 'Perfil, interesses e orientações' },
  { id: 4, title: 'Saúde', subtitle: 'Diagnósticos, medicamentos e terapias' },
  { id: 5, title: 'Comunicação', subtitle: 'Forma de comunicação e pedido de ajuda' },
  { id: 6, title: 'Escola', subtitle: 'Adaptação, estratégias e observações' },
];

export const MORADIA_OPTIONS = [
  'Pai', 'Mãe', 'Avós', 'Tios', 'Irmãos', 'Responsável Legal', 'Família Acolhedora', 'Outros',
];

export const COMUNICACAO_OPTIONS = [
  'Verbal', 'Não verbal', 'Comunicação alternativa', 'Libras', 'Outra',
];

export const TERAPIA_OPTIONS = [
  'Psicologia', 'Terapia Ocupacional', 'Fonoaudiologia', 'Psicopedagogia',
  'Fisioterapia', 'Equoterapia', 'Outros',
];

export const ANAMNESE_ATTACHMENT_CATEGORIES = [
  { value: 'LAUDO', label: 'Laudo' },
  { value: 'RECEITA', label: 'Receita' },
  { value: 'RELATORIO_PEDAGOGICO', label: 'Relatório' },
  { value: 'AVALIACAO', label: 'Avaliação' },
  { value: 'PDI', label: 'PDI' },
  { value: 'OUTRO', label: 'Outro' },
];

export const EMPTY_ANAMNESE = {
  serie: '',
  responsavelNome: '',
  responsavelParentesco: '',
  responsavelTelefone: '',
  comQuemMora: [],
  comQuemMoraOutro: '',
  ondeMora: '',
  acompanhaRotinaEscolar: '',
  descricaoFamilia: '',
  interessesPotencialidades: '',
  atividadesPreferidas: '',
  dificuldadeImportante: '',
  orientacaoEscola: '',
  diagnosticos: [],
  usaMedicacao: null,
  medicamentos: [],
  terapias: [],
  terapiaOutra: '',
  alergias: '',
  restricoesAlimentares: '',
  comunicacaoTipo: '',
  comunicacaoOutra: '',
  comoPedeAjuda: '',
  adaptacaoEscolar: '',
  estrategiasFuncionam: '',
  recomendacaoProfessorAnterior: '',
  observacoesGerais: '',
  anexos: [],
};

export function normalizeAnamnese(data) {
  const comQuemMora = data?.comQuemMora || [];
  const terapias = data?.terapias || [];
  return {
    ...EMPTY_ANAMNESE,
    ...(data || {}),
    comQuemMora: data?.comQuemMoraOutro && !comQuemMora.includes('Outros') ? [...comQuemMora, 'Outros'] : comQuemMora,
    diagnosticos: data?.diagnosticos || [],
    medicamentos: data?.medicamentos || [],
    terapias: data?.terapiaOutra && !terapias.includes('Outros') ? [...terapias, 'Outros'] : terapias,
    anexos: data?.anexos || [],
  };
}

export function anamnesePayload(values) {
  return values;
}
