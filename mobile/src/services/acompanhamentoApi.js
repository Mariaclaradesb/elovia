import { apiRequest } from './api';

export function buscarSessaoAtiva(token) {
  return apiRequest('/api/sessoes/ativas', { token });
}

export function listarSessoes(token) {
  return apiRequest('/api/sessoes', { token });
}

export function iniciarSessao(token, payload) {
  return apiRequest('/api/sessoes', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function encerrarSessao(token, sessaoId) {
  return apiRequest(`/api/sessoes/${sessaoId}/encerrar`, {
    method: 'PATCH',
    token,
  });
}

export function buscarTimeline(token, sessaoId) {
  return apiRequest(`/api/sessoes/${sessaoId}/timeline`, { token });
}

export function criarObservacao(token, payload) {
  return apiRequest('/api/observacoes', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function atualizarObservacao(token, id, payload) {
  return apiRequest(`/api/observacoes/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  });
}

export function excluirObservacao(token, id) {
  return apiRequest(`/api/observacoes/${id}`, {
    method: 'DELETE',
    token,
  });
}
