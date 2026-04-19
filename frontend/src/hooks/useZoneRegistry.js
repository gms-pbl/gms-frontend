import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_GREENHOUSE_ID, DEFAULT_TENANT_ID } from '../config/runtimeConfig';
import {
  assignZone,
  getZoneRegistry,
  syncZoneRegistry,
  unassignZone,
} from '../services/zonesApi';

export function useZoneRegistry({
  tenantId = DEFAULT_TENANT_ID,
  greenhouseId = DEFAULT_GREENHOUSE_ID,
} = {}) {
  const [registry, setRegistry] = useState({
    tenant_id: tenantId,
    greenhouse_id: greenhouseId,
    assigned_zones: [],
    discovered_devices: [],
  });
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const data = await getZoneRegistry({ tenantId, greenhouseId });
      setRegistry(data);
      setError('');
      return true;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
      return false;
    } finally {
      setLoading(false);
    }
  }, [tenantId, greenhouseId]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId;
    let failureStreak = 0;

    const nextDelay = () => {
      if (failureStreak <= 0) return 5000;
      if (failureStreak === 1) return 8000;
      if (failureStreak === 2) return 13000;
      return 20000;
    };

    const tick = async () => {
      const ok = await refresh();
      failureStreak = ok ? 0 : failureStreak + 1;

      if (cancelled) {
        return;
      }

      timeoutId = setTimeout(() => {
        void tick();
      }, nextDelay());
    };

    void tick();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [refresh]);

  const runMutation = useCallback(async (action) => {
    setPending(true);
    try {
      const result = await action();
      setError('');
      await refresh();
      return result;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
      throw nextError;
    } finally {
      setPending(false);
    }
  }, [refresh]);

  const assign = useCallback(async ({ deviceId, zoneName, zoneId, metadata }) => {
    return runMutation(() => assignZone({
      tenantId,
      greenhouseId,
      deviceId,
      zoneName,
      zoneId,
      metadata,
    }));
  }, [greenhouseId, runMutation, tenantId]);

  const unassign = useCallback(async (deviceId) => {
    return runMutation(() => unassignZone({
      tenantId,
      greenhouseId,
      deviceId,
    }));
  }, [greenhouseId, runMutation, tenantId]);

  const rename = useCallback(async ({ deviceId, zoneId, zoneName, metadata }) => {
    return assign({
      deviceId,
      zoneId,
      zoneName,
      metadata,
    });
  }, [assign]);

  const sync = useCallback(async () => {
    return runMutation(() => syncZoneRegistry({
      tenantId,
      greenhouseId,
    }));
  }, [greenhouseId, runMutation, tenantId]);

  return {
    registry,
    loading,
    pending,
    error,
    refresh,
    assign,
    unassign,
    rename,
    sync,
  };
}
