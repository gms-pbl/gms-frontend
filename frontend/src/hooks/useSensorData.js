import { useState, useEffect } from 'react';
import { apiRequest } from '../services/apiClient';

export function useSensorData({ enabled = true } = {}) {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const fetchReadings = () =>
      apiRequest('/v1/dashboard/live')
        .then(data => setReadings(Array.isArray(data) ? data : []))
        .catch(() => {});

    fetchReadings();
    const id = setInterval(fetchReadings, 10000);
    return () => clearInterval(id);
  }, [enabled]);

  return enabled ? readings : [];
}
