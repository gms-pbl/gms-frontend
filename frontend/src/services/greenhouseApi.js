import { apiRequest } from './apiClient';

export async function listGreenhouses() {
  return apiRequest('/v1/g', { method: 'GET' });
}

export async function getGreenhouse({ greenhouseId }) {
  return apiRequest(`/v1/g/${encodeURIComponent(greenhouseId)}`, { method: 'GET' });
}

export async function createGreenhouse({ name, greenhouseId, gatewayId }) {
  return apiRequest('/v1/g', {
    method: 'POST',
    body: {
      name,
      greenhouse_id: greenhouseId,
      gateway_id: gatewayId,
    },
  });
}

export async function updateGreenhouse({ greenhouseId, name, gatewayId }) {
  return apiRequest(`/v1/g/${encodeURIComponent(greenhouseId)}`, {
    method: 'PATCH',
    body: {
      name,
      gateway_id: gatewayId,
    },
  });
}

export async function deleteGreenhouse({ greenhouseId }) {
  return apiRequest(`/v1/g/${encodeURIComponent(greenhouseId)}`, {
    method: 'DELETE',
  });
}

export async function getGreenhouseGatewayConfig({ greenhouseId }) {
  return apiRequest(`/v1/g/${encodeURIComponent(greenhouseId)}/gateway-config`, {
    method: 'GET',
  });
}
