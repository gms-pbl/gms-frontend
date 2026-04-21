import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config/runtimeConfig';
import { MOCK_IRRIGATION_ZONES } from '../services/mockData';

export function useIrrigation(siteId) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const timers = useRef({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/v1/sites/${siteId}/irrigation/zones`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => setZones(d.zones))
      .catch(() => setZones(MOCK_IRRIGATION_ZONES))
      .finally(() => setLoading(false));

    return () => { Object.values(timers.current).forEach(clearInterval); };
  }, [siteId]);

  const toggleZone = useCallback((zoneId, active) => {
    if (timers.current[zoneId]) {
      clearInterval(timers.current[zoneId]);
      delete timers.current[zoneId];
    }
    setZones(prev => prev.map(z =>
      z.id === zoneId ? { ...z, status: active ? 'ACTIVE' : 'IDLE', countdown: null } : z
    ));
    fetch(`${API_BASE_URL}/v1/sites/${siteId}/irrigation/zones/${zoneId}/toggle`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ active }),
    }).catch(() => {});
  }, [siteId]);

  const manualOverride = useCallback((zoneId) => {
    if (timers.current[zoneId]) {
      clearInterval(timers.current[zoneId]);
    }
    let remaining = 30;
    setZones(prev => prev.map(z =>
      z.id === zoneId ? { ...z, status: 'ACTIVE', countdown: remaining } : z
    ));
    fetch(`${API_BASE_URL}/v1/sites/${siteId}/irrigation/zones/${zoneId}/toggle`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ active: true }),
    }).catch(() => {});

    timers.current[zoneId] = setInterval(() => {
      remaining -= 1;
      setZones(prev => prev.map(z =>
        z.id === zoneId ? { ...z, countdown: remaining } : z
      ));
      if (remaining <= 0) {
        clearInterval(timers.current[zoneId]);
        delete timers.current[zoneId];
        setZones(prev => prev.map(z =>
          z.id === zoneId ? { ...z, status: 'IDLE', countdown: null } : z
        ));
        fetch(`${API_BASE_URL}/v1/sites/${siteId}/irrigation/zones/${zoneId}/toggle`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ active: false }),
        }).catch(() => {});
      }
    }, 1000);
  }, [siteId]);

  const emergencyStop = useCallback(() => {
    Object.values(timers.current).forEach(clearInterval);
    timers.current = {};
    setZones(prev => prev.map(z => ({ ...z, status: 'IDLE', countdown: null })));
    fetch(`${API_BASE_URL}/v1/sites/${siteId}/irrigation/emergency-stop`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => {});
  }, [siteId]);

  return { zones, loading, toggleZone, manualOverride, emergencyStop };
}
