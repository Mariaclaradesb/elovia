import { API_BASE_URL } from '../config/apiConfig';
import { parseApiResponse } from './parseApiResponse';
import { appendUploadFile } from './uploadFilePart';

export async function atualizarFotoAluno(alunoId, token, file) {
  const data = new FormData();
  await appendUploadFile(data, 'arquivo', file, `aluno-${Date.now()}.jpg`, 'image/jpeg');

  const response = await fetch(`${API_BASE_URL}/api/alunos/${alunoId}/foto`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });
  return parseApiResponse(response);
}
