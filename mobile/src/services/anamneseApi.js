import { API_BASE_URL } from '../config/apiConfig';
import { parseApiResponse } from './parseApiResponse';
import { appendUploadFile } from './uploadFilePart';

function authHeaders(token) {
  return { Accept: 'application/json', Authorization: `Bearer ${token}` };
}

export async function buscarAnamnese(alunoId, token) {
  const response = await fetch(`${API_BASE_URL}/api/alunos/${alunoId}/anamnese`, {
    headers: authHeaders(token),
  });
  return parseApiResponse(response);
}

export async function salvarEtapaAnamnese(alunoId, etapa, values, token) {
  const response = await fetch(`${API_BASE_URL}/api/alunos/${alunoId}/anamnese/etapas/${etapa}`, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  return parseApiResponse(response);
}

export async function buscarNaAnamnese(alunoId, termo, token) {
  const response = await fetch(`${API_BASE_URL}/api/alunos/${alunoId}/anamnese/pesquisa?q=${encodeURIComponent(termo || '')}`, {
    headers: authHeaders(token),
  });
  return parseApiResponse(response);
}

export async function listarHistoricoAnamnese(alunoId, token) {
  const response = await fetch(`${API_BASE_URL}/api/alunos/${alunoId}/anamnese/historico`, {
    headers: authHeaders(token),
  });
  return parseApiResponse(response);
}

export async function gerarRelatorioAnamnese(alunoId, token) {
  const response = await fetch(`${API_BASE_URL}/api/alunos/${alunoId}/anamnese/relatorio`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  return parseApiResponse(response);
}

export async function salvarAnexoAnamnese({ alunoId, token, values, file }) {
  const data = new FormData();
  data.append('titulo', values.titulo);
  data.append('descricao', values.descricao || '');
  data.append('categoria', values.categoria);
  if (values.dataDocumento) data.append('dataDocumento', values.dataDocumento);
  await appendUploadFile(data, 'arquivo', file, 'anexo');
  const response = await fetch(`${API_BASE_URL}/api/alunos/${alunoId}/anamnese/anexos`, {
    method: 'POST',
    headers: authHeaders(token),
    body: data,
  });
  return parseApiResponse(response);
}
