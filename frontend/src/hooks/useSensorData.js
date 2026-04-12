import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8081';

export function useSensorData() {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    const fetchReadings = () =>
      fetch(`${API_BASE}/v1/dashboard/live`)
        .then(r => r.json())
        .then(setReadings)
        .catch(() => {});

    fetchReadings();
    const id = setInterval(fetchReadings, 10000);
    return () => clearInterval(id);
  }, []);

  return readings;
}
