export const DOCUMENT_CATEGORIES = [
  { value: 'LAUDO', label: 'Laudos', tab: 'Laudos', icon: 'file-document-heart-outline' },
  { value: 'PEI', label: 'PEI', tab: 'PEI / PDI', icon: 'clipboard-text-outline' },
  { value: 'PDI', label: 'PDI', tab: 'PEI / PDI', icon: 'clipboard-text-clock-outline' },
  { value: 'RELATORIO_MEDIACAO', label: 'Relatorio de mediacao', tab: 'Relatorios', icon: 'file-chart-outline' },
  { value: 'RELATORIO_PEDAGOGICO', label: 'Relatorio pedagogico', tab: 'Relatorios', icon: 'file-document-edit-outline' },
  { value: 'AVALIACAO', label: 'Avaliacao', tab: 'Avaliacoes', icon: 'clipboard-check-outline' },
  { value: 'RECEITA', label: 'Receita', tab: 'Receitas', icon: 'medical-bag' },
  { value: 'FOTO', label: 'Foto', tab: 'Fotos', icon: 'image-outline' },
  { value: 'ATA', label: 'Ata', tab: 'Atas', icon: 'account-group-outline' },
  { value: 'OUTRO', label: 'Outro', tab: 'Outros', icon: 'folder-outline' },
];

export const DOCUMENT_TABS = ['Todos', 'Laudos', 'PEI / PDI', 'Relatorios', 'Avaliacoes', 'Receitas', 'Fotos', 'Atas', 'Outros'];

export const SORT_OPTIONS = [
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'antigos', label: 'Mais antigos' },
  { value: 'nome', label: 'Nome A-Z' },
  { value: 'categoria', label: 'Categoria' },
];

export function categoryLabel(value) {
  return DOCUMENT_CATEGORIES.find((item) => item.value === value)?.label || value || 'Documento';
}

export function categoryIcon(value) {
  return DOCUMENT_CATEGORIES.find((item) => item.value === value)?.icon || 'file-outline';
}

export function tabForCategory(value) {
  return DOCUMENT_CATEGORIES.find((item) => item.value === value)?.tab || 'Outros';
}

export function isImageDocument(documento) {
  const type = documento?.tipoArquivo || '';
  const name = documento?.nomeArquivo || '';
  return type.startsWith('image/') || /\.(png|jpe?g)$/i.test(name);
}
