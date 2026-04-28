import { useState, useEffect, useCallback } from 'react';

function storageKey(greenhouseId, zoneId) {
  return `gms-thresholds-${greenhouseId}-${zoneId}`;
}

// Swap with: GET /v1/g/{greenhouseId}/zones/{zoneId}/thresholds
async function fetchThresholds(greenhouseId, zoneId) {
  const raw = localStorage.getItem(storageKey(greenhouseId, zoneId));
  return raw ? JSON.parse(raw) : {};
}

// Swap with: PUT /v1/g/{greenhouseId}/zones/{zoneId}/thresholds
async function persistThresholds(greenhouseId, zoneId, data) {
  localStorage.setItem(storageKey(greenhouseId, zoneId), JSON.stringify(data));
}

export function useZoneThresholds({ greenhouseId, zoneId }) {
  const [thresholds, setThresholds] = useState({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!greenhouseId || !zoneId) return;
    setThresholds({});
    setDirty(false);
    fetchThresholds(greenhouseId, zoneId).then(setThresholds);
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
      await persistThresholds(greenhouseId, zoneId, thresholds);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [greenhouseId, zoneId, thresholds]);

  const reset = useCallback(() => {
    if (!greenhouseId || !zoneId) return;
    fetchThresholds(greenhouseId, zoneId).then((stored) => {
      setThresholds(stored ?? {});
      setDirty(false);
    });
  }, [greenhouseId, zoneId]);

  return { thresholds, updateField, save, saving, dirty, reset };
}
