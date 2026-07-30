import { API_BASE_URL } from '../config/apiConfig';
import { parseApiResponse } from './parseApiResponse';
import { appendUploadFile } from './uploadFilePart';

export async function listarDocumentosAluno(alunoId, token) {
  const response = await fetch(`${API_BASE_URL}/api/alunos/${alunoId}/documentos`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return parseApiResponse(response);
}

export async function buscarDocumento(id, token) {
  const response = await fetch(`${API_BASE_URL}/api/documentos/${id}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return parseApiResponse(response);
}

export async function obterLinkDocumento(id, token) {
  const response = await fetch(`${API_BASE_URL}/api/documentos/link/${id}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return parseApiResponse(response);
}

export async function salvarDocumentoAluno({ alunoId, documentoId, token, values, file }) {
  const data = new FormData();
  data.append('titulo', values.titulo);
  data.append('descricao', values.descricao || '');
  data.append('categoria', values.categoria);
  if (values.dataDocumento) {
    data.append('dataDocumento', values.dataDocumento);
  }

  await appendUploadFile(data, 'arquivo', file, 'documento');

  const path = documentoId ? `/api/documentos/${documentoId}` : `/api/alunos/${alunoId}/documentos`;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: documentoId ? 'PUT' : 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });
  return parseApiResponse(response);
}

export async function excluirDocumento(id, token) {
  const response = await fetch(`${API_BASE_URL}/api/documentos/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return parseApiResponse(response);
}
