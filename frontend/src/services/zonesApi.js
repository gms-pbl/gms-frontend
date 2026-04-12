import { apiRequest } from './apiClient';

export async function getZoneRegistry({ tenantId, greenhouseId }) {
  const params = new URLSearchParams({
    tenant_id: tenantId,
    greenhouse_id: greenhouseId,
  });

  return apiRequest(`/v1/zones/registry?${params.toString()}`, { method: 'GET' });
}

export async function assignZone({ tenantId, greenhouseId, deviceId, zoneId, zoneName, metadata }) {
  return apiRequest('/v1/zones/assign', {
    method: 'POST',
    body: {
      tenant_id: tenantId,
      greenhouse_id: greenhouseId,
      device_id: deviceId,
      zone_id: zoneId,
      zone_name: zoneName,
      metadata,
    },
  });
}

export async function unassignZone({ tenantId, greenhouseId, deviceId }) {
  return apiRequest('/v1/zones/unassign', {
    method: 'POST',
    body: {
      tenant_id: tenantId,
      greenhouse_id: greenhouseId,
      device_id: deviceId,
    },
  });
}

export async function syncZoneRegistry({ tenantId, greenhouseId }) {
  return apiRequest('/v1/zones/sync', {
    method: 'POST',
    body: {
      tenant_id: tenantId,
      greenhouse_id: greenhouseId,
    },
  });
}

export async function sendZoneCommand({
  tenantId,
  greenhouseId,
  action,
  zoneId,
  deviceId,
  payload,
}) {
  return apiRequest('/v1/zones/command', {
    method: 'POST',
    body: {
      tenant_id: tenantId,
      greenhouse_id: greenhouseId,
      action,
      zone_id: zoneId,
      device_id: deviceId,
      payload,
    },
  });
}

export async function getZoneCommandAck({ commandId }) {
  if (!commandId) {
    throw new Error('commandId is required to query command ACK');
  }
  const params = new URLSearchParams({ command_id: commandId });
  return apiRequest(`/v1/zones/command-ack?${params.toString()}`, { method: 'GET' });
}

export async function getZoneLiveReadings({ greenhouseId, zoneId }) {
  const params = new URLSearchParams();
  if (greenhouseId) {
    params.set('greenhouse_id', greenhouseId);
  }
  if (zoneId) {
    params.set('zone_id', zoneId);
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/v1/dashboard/live${suffix}`, { method: 'GET' });
}
