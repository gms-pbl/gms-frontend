import { useState, useEffect, useCallback } from 'react';
import { MOCK_ALERTS } from '../services/mockData';

const SENSOR_KEYS = [
  'soil_moisture', 'soil_ec', 'soil_temp', 'soil_ph',
  'soil_nitrogen', 'soil_phosphorus', 'soil_potassium',
  'air_temperature', 'air_humidity',
];

const AUTO_MESSAGES = [
  'Value trending outside normal range',
  'Sensor reading fluctuation detected',
  'Parameter approaching threshold',
  'Brief anomaly recorded',
];

const SEVERITY_ORDER = { CRITICAL: 0, WARNING: 1, INFO: 2 };

let _counter = 100;

function generateAlert() {
  _counter += 1;
  const severity = Math.random() < 0.5 ? 'WARNING' : 'INFO';
  return {
    id: `auto-${_counter}`,
    severity,
    sensor_key: SENSOR_KEYS[Math.floor(Math.random() * SENSOR_KEYS.length)],
    message: AUTO_MESSAGES[Math.floor(Math.random() * AUTO_MESSAGES.length)],
    triggered_at: new Date().toISOString(),
    acknowledged: false,
  };
}

function sortAlerts(list) {
  return [...list].sort((a, b) => {
    if (a.acknowledged !== b.acknowledged) return a.acknowledged ? 1 : -1;
    return (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3);
  });
}

export function useAlerts() {
  const [alerts, setAlerts] = useState(() => sortAlerts(MOCK_ALERTS));

  useEffect(() => {
    const id = setInterval(() => {
      setAlerts(prev => sortAlerts([...prev, generateAlert()]));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const acknowledge = useCallback((id) => {
    setAlerts(prev => sortAlerts(prev.map(a => a.id === id ? { ...a, acknowledged: true } : a)));
  }, []);

  const dismiss = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  return { alerts, acknowledge, dismiss };
}
