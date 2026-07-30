import { API_BASE_URL } from '../config/apiConfig';
import { parseApiResponse } from './parseApiResponse';
import { appendUploadFile } from './uploadFilePart';

export async function atualizarFotoPerfil(token, file) {
  const data = new FormData();
  await appendUploadFile(data, 'arquivo', file, `perfil-${Date.now()}.jpg`, 'image/jpeg');

  const response = await fetch(`${API_BASE_URL}/api/auth/me/foto`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });
  return parseApiResponse(response);
}
