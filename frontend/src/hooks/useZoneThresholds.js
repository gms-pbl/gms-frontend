import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/apiClient';

function thresholdsPath(greenhouseId, zoneId) {
  return `/v1/g/${encodeURIComponent(greenhouseId)}/zones/${encodeURIComponent(zoneId)}/thresholds`;
}

async function fetchThresholds(greenhouseId, zoneId) {
  return apiRequest(thresholdsPath(greenhouseId, zoneId), { method: 'GET' });
}

function coerceNumbers(thresholds) {
  const out = {};
  for (const [sensor, levels] of Object.entries(thresholds)) {
    out[sensor] = {};
    for (const [level, bounds] of Object.entries(levels)) {
      out[sensor][level] = {};
      for (const [bound, val] of Object.entries(bounds)) {
        out[sensor][level][bound] = val === '' || val == null ? null : Number(val);
      }
    }
  }
  return out;
}

async function persistThresholds(greenhouseId, zoneId, data) {
  return apiRequest(thresholdsPath(greenhouseId, zoneId), { method: 'PUT', body: coerceNumbers(data) });
}

export function useZoneThresholds({ greenhouseId, zoneId }) {
  const [thresholds, setThresholds] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!greenhouseId || !zoneId) return;
    setThresholds({});
    setDirty(false);
    setLoading(true);
    fetchThresholds(greenhouseId, zoneId)
      .then(setThresholds)
      .catch(() => setThresholds({}))
      .finally(() => setLoading(false));
  }, [greenhouseId, zoneId]);

  const updateField = useCallback((sensorKey, level, bound, value) => {
    setThresholds((prev) => ({
      ...prev,
      [sensorKey]: {
        ...prev[sensorKey],
        [level]: { ...prev[sensorKey]?.[level], [bound]: value },
      },
    }));
    setDirty(true);
  }, []);

  const save = useCallback(async () => {
    if (!greenhouseId || !zoneId) return;
    setSaving(true);
    try {
      const saved = await persistThresholds(greenhouseId, zoneId, thresholds);
      setThresholds(saved);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [greenhouseId, zoneId, thresholds]);

  const reset = useCallback(() => {
    if (!greenhouseId || !zoneId) return;
    fetchThresholds(greenhouseId, zoneId)
      .then((data) => { setThresholds(data ?? {}); setDirty(false); })
      .catch(() => {});
  }, [greenhouseId, zoneId]);

  return { thresholds, updateField, save, saving, dirty, reset, loading };
}
