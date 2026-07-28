export const PERIODOS = [
  { value: 'MANHA', label: 'Manhã' },
  { value: 'TARDE', label: 'Tarde' },
  { value: 'NOITE', label: 'Noite' },
];

export const OBSERVACAO_CATEGORIAS = [
  { value: 'PARTICIPACAO', label: 'Participação', icon: 'hand-heart-outline', color: '#29BE9E' },
  { value: 'COMPORTAMENTO', label: 'Comportamento', icon: 'emoticon-outline', color: '#7D70BA' },
  { value: 'INTERACAO', label: 'Interação', icon: 'account-group-outline', color: '#1D8B77' },
  { value: 'COMUNICACAO', label: 'Comunicação', icon: 'message-text-outline', color: '#7D70BA' },
  { value: 'ATIVIDADE', label: 'Atividade', icon: 'clipboard-check-outline', color: '#F6C500' },
  { value: 'ALIMENTACAO', label: 'Alimentação', icon: 'food-apple-outline', color: '#29BE9E' },
  { value: 'HIGIENE', label: 'Higiene', icon: 'hand-wash-outline', color: '#1D8B77' },
  { value: 'RECREIO', label: 'Recreio', icon: 'play-circle-outline', color: '#F6C500' },
  { value: 'CRISE', label: 'Crise', icon: 'alert-circle-outline', color: '#B42318' },
  { value: 'AUTORREGULACAO', label: 'Autorregulação', icon: 'heart-pulse', color: '#7D70BA' },
  { value: 'TRANSICAO', label: 'Transição', icon: 'swap-horizontal', color: '#1D8B77' },
  { value: 'OUTRO', label: 'Outro', icon: 'dots-horizontal-circle-outline', color: '#667085' },
];

export const ATALHOS_OBSERVACAO = [
  { label: 'Participou', categoria: 'PARTICIPACAO', descricao: 'Participou da atividade.' },
  { label: 'Precisou de ajuda', categoria: 'ATIVIDADE', descricao: 'Precisou de ajuda para iniciar ou concluir a atividade.' },
  { label: 'Concluiu atividade', categoria: 'ATIVIDADE', descricao: 'Concluiu a atividade proposta.' },
  { label: 'Interagiu', categoria: 'INTERACAO', descricao: 'Interagiu com colegas ou equipe escolar.' },
  { label: 'Crise', categoria: 'CRISE', descricao: 'Apresentou momento de crise.' },
  { label: 'Autorregulação', categoria: 'AUTORREGULACAO', descricao: 'Realizou autorregulação com apoio/estratégia.' },
  { label: 'Recreio', categoria: 'RECREIO', descricao: 'Registro realizado durante o recreio.' },
  { label: 'Alimentação', categoria: 'ALIMENTACAO', descricao: 'Registro relacionado à alimentação.' },
];

const DESCRICOES_CATEGORIAS = {
  PARTICIPACAO: 'Participou da atividade proposta.',
  COMPORTAMENTO: 'Apresentou comportamento observado durante o acompanhamento.',
  INTERACAO: 'Interagiu com colegas ou com a equipe escolar.',
  COMUNICACAO: 'Realizou uma iniciativa ou resposta de comunicação.',
  ATIVIDADE: 'Realizou a atividade proposta durante o acompanhamento.',
  ALIMENTACAO: 'Registro relacionado ao momento de alimentação.',
  HIGIENE: 'Registro relacionado aos cuidados de higiene.',
  RECREIO: 'Participou do momento de recreio.',
  CRISE: 'Apresentou um momento de crise ou desregulação.',
  AUTORREGULACAO: 'Realizou autorregulação com apoio ou estratégia.',
  TRANSICAO: 'Realizou uma transição entre ambientes ou atividades.',
  OUTRO: 'Registro adicional do acompanhamento.',
};

export function categoriaObservacaoDescricao(value) {
  return DESCRICOES_CATEGORIAS[value] || '';
}

export function categoriaObservacaoLabel(value) {
  return OBSERVACAO_CATEGORIAS.find((item) => item.value === value)?.label || value || 'Observação';
}

export function categoriaObservacaoIcon(value) {
  return OBSERVACAO_CATEGORIAS.find((item) => item.value === value)?.icon || 'note-text-outline';
}

export function categoriaObservacaoColor(value) {
  return OBSERVACAO_CATEGORIAS.find((item) => item.value === value)?.color || '#667085';
}
