import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/runtimeConfig';

export function useSensorData({ enabled = true } = {}) {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const fetchReadings = () =>
      fetch(`${API_BASE_URL}/v1/dashboard/live`)
        .then(r => r.json())
        .then(setReadings)
        .catch(() => {});

    fetchReadings();
    const id = setInterval(fetchReadings, 10000);
    return () => clearInterval(id);
  }, [enabled]);

  return enabled ? readings : [];
}
