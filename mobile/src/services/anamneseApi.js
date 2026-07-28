import { API_BASE_URL } from '../config/apiConfig';

async function parseResponse(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    throw new Error(data?.message || data || `Erro HTTP ${response.status}`);
  }
  return data;
}

function authHeaders(token) {
  return { Accept: 'application/json', Authorization: `Bearer ${token}` };
}

export async function buscarAnamnese(alunoId, token) {
  const response = await fetch(`${API_BASE_URL}/api/alunos/${alunoId}/anamnese`, {
    headers: authHeaders(token),
  });
  return parseResponse(response);
}

export async function salvarEtapaAnamnese(alunoId, etapa, values, token) {
  const response = await fetch(`${API_BASE_URL}/api/alunos/${alunoId}/anamnese/etapas/${etapa}`, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  return parseResponse(response);
}

export async function buscarNaAnamnese(alunoId, termo, token) {
  const response = await fetch(`${API_BASE_URL}/api/alunos/${alunoId}/anamnese/pesquisa?q=${encodeURIComponent(termo || '')}`, {
    headers: authHeaders(token),
  });
  return parseResponse(response);
}

export async function listarHistoricoAnamnese(alunoId, token) {
  const response = await fetch(`${API_BASE_URL}/api/alunos/${alunoId}/anamnese/historico`, {
    headers: authHeaders(token),
  });
  return parseResponse(response);
}

export async function gerarRelatorioAnamnese(alunoId, token) {
  const response = await fetch(`${API_BASE_URL}/api/alunos/${alunoId}/anamnese/relatorio`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  return parseResponse(response);
}

export async function salvarAnexoAnamnese({ alunoId, token, values, file }) {
  const data = new FormData();
  data.append('titulo', values.titulo);
  data.append('descricao', values.descricao || '');
  data.append('categoria', values.categoria);
  if (values.dataDocumento) data.append('dataDocumento', values.dataDocumento);
  if (file) {
    data.append('arquivo', {
      uri: file.uri,
      name: file.name || file.fileName || 'anexo',
      type: file.mimeType || file.type || 'application/octet-stream',
    });
  }
  const response = await fetch(`${API_BASE_URL}/api/alunos/${alunoId}/anamnese/anexos`, {
    method: 'POST',
    headers: authHeaders(token),
    body: data,
  });
  return parseResponse(response);
}
