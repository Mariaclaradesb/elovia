import { API_BASE_URL } from '../config/apiConfig';

export async function atualizarFotoPerfil(token, file) {
  const data = new FormData();
  data.append('arquivo', {
    uri: file.uri,
    name: file.fileName || file.name || `perfil-${Date.now()}.jpg`,
    type: file.mimeType || file.type || 'image/jpeg',
  });

  const response = await fetch(`${API_BASE_URL}/api/auth/me/foto`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });
  const text = await response.text();
  const result = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(result?.message || `Erro HTTP ${response.status}`);
  }
  return result;
}
