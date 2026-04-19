import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/runtimeConfig';

const SEVERITY_ORDER = { CRITICAL: 0, WARNING: 1, INFO: 2 };

function sortAlerts(list) {
  return [...list].sort((a, b) => {
    if (a.acknowledged !== b.acknowledged) return a.acknowledged ? 1 : -1;
    return (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3);
  });
}

export function useAlerts({ enabled = true } = {}) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    fetch(`${API_BASE_URL}/v1/alerts`)
      .then(r => r.json())
      .then(data => setAlerts(sortAlerts(data)))
      .catch(() => {});
  }, [enabled]);

  const acknowledge = useCallback((id) => {
    fetch(`${API_BASE_URL}/v1/alerts/${id}/acknowledge`, { method: 'POST' })
      .then(r => r.json())
      .then(updated =>
        setAlerts(prev => sortAlerts(prev.map(a => a.id === id ? updated : a)))
      )
      .catch(() => {});
  }, []);

  const dismiss = useCallback((id) => {
    fetch(`${API_BASE_URL}/v1/alerts/${id}`, { method: 'DELETE' })
      .then(() => setAlerts(prev => prev.filter(a => a.id !== id)))
      .catch(() => {});
  }, []);

  return { alerts: enabled ? alerts : [], acknowledge, dismiss };
}
