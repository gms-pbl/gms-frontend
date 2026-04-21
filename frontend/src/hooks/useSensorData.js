import { useState, useEffect } from 'react';
import { apiRequest } from '../services/apiClient';

export function useSensorData({ enabled = true, greenhouseId = '', zoneId = '' } = {}) {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const params = new URLSearchParams();
    if (greenhouseId) params.set('greenhouse_id', greenhouseId);
    if (zoneId) params.set('zone_id', zoneId);
    const suffix = params.toString() ? `?${params.toString()}` : '';

    const fetchReadings = () =>
      apiRequest(`/v1/dashboard/live${suffix}`)
        .then(data => setReadings(Array.isArray(data) ? data : []))
        .catch(() => {});

    fetchReadings();
    const id = setInterval(fetchReadings, 10000);
    return () => clearInterval(id);
  }, [enabled, greenhouseId, zoneId]);

  return enabled ? readings : [];
}
