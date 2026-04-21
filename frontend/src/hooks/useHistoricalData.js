import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/runtimeConfig';
import { MOCK_SENSOR_HISTORY } from '../services/mockData';

export function useHistoricalData(siteId, sensorKey, range = '24h') {
  const [data, setData] = useState([]);
  const [thresholds, setThresholds] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sensorKey) return;
    setIsLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/v1/sites/${siteId}/sensors/${sensorKey}/history?range=${range}`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(body => {
        setData(body.data_points ?? []);
        setThresholds(body.thresholds ?? null);
      })
      .catch(() => {
        const mock = MOCK_SENSOR_HISTORY[sensorKey];
        if (mock) {
          setData(mock.data_points);
          setThresholds(mock.thresholds ?? null);
        } else {
          setError('No historical data available for this sensor.');
        }
      })
      .finally(() => setIsLoading(false));
  }, [siteId, sensorKey, range]);

  return { data, thresholds, isLoading, error };
}
