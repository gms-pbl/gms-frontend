import { useState, useEffect } from 'react';
import { MOCK_SENSOR_READINGS } from '../services/mockData';

const JITTER_FACTOR = 0.02;

function applyJitter(reading) {
  const range = Math.max(reading.value * JITTER_FACTOR, 0.1);
  const delta = (Math.random() - 0.5) * 2 * range;
  const next = Math.round((reading.value + delta) * 100) / 100;
  return {
    ...reading,
    value: next,
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function useSensorData() {
  const [readings, setReadings] = useState(() =>
    MOCK_SENSOR_READINGS.map(r => ({ ...r, lastUpdatedAt: new Date().toISOString() }))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setReadings(prev => prev.map(applyJitter));
    }, 10000);
    return () => clearInterval(id);
  }, []);

  return readings;
}
