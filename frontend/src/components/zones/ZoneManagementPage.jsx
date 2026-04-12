import { useMemo, useState } from 'react';
import { DEFAULT_GREENHOUSE_ID, DEFAULT_TENANT_ID } from '../../config/runtimeConfig';
import { useZoneRegistry } from '../../hooks/useZoneRegistry';
import ZoneDeviceModal from './ZoneDeviceModal';

function formatTimestamp(value) {
  if (!value) return 'n/a';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'n/a';
  return date.toLocaleString();
}

export default function ZoneManagementPage() {
  const {
    registry,
    loading,
    pending,
    error,
    refresh,
    assign,
    unassign,
    rename,
    sync,
  } = useZoneRegistry({
    tenantId: DEFAULT_TENANT_ID,
    greenhouseId: DEFAULT_GREENHOUSE_ID,
  });

  const [assignDrafts, setAssignDrafts] = useState({});
  const [renameDrafts, setRenameDrafts] = useState({});
  const [message, setMessage] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);

  const discoveredDevices = useMemo(
    () => registry?.discovered_devices ?? [],
    [registry]
  );

  const assignedZones = useMemo(
    () => registry?.assigned_zones ?? [],
    [registry]
  );

  const handleAssign = async (deviceId) => {
    const draftName = (assignDrafts[deviceId] ?? '').trim();
    await assign({
      deviceId,
      zoneName: draftName || undefined,
    });

    setAssignDrafts((prev) => ({ ...prev, [deviceId]: '' }));
    setMessage(`Assigned device ${deviceId} to a zone.`);
  };

  const handleRename = async (deviceId, zoneId, currentZoneName) => {
    const draftName = (renameDrafts[deviceId] ?? '').trim();
    const nextZoneName = draftName || currentZoneName;
    if (!nextZoneName) {
      return;
    }

    await rename({
      deviceId,
      zoneId,
      zoneName: nextZoneName,
    });

    setRenameDrafts((prev) => ({ ...prev, [deviceId]: '' }));
    setMessage(`Updated zone name for device ${deviceId}.`);
  };

  const handleUnassign = async (deviceId) => {
    await unassign(deviceId);
    setMessage(`Unassigned device ${deviceId}.`);
  };

  const handleSync = async () => {
    await sync();
    setMessage('Published full zone registry sync to gateway.');
  };

  const openDeviceModal = (device) => {
    setSelectedDevice(device);
    setMessage('');
  };

  const closeDeviceModal = () => {
    setSelectedDevice(null);
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3">
          <div>
            <h1 className="text-xl font-semibold text-ink">Zone Management</h1>
            <p className="text-xs uppercase tracking-[0.14em] text-muted" style={{ fontFamily: "'Source Code Pro', monospace" }}>
              tenant `{registry?.tenant_id ?? DEFAULT_TENANT_ID}` / greenhouse `{registry?.greenhouse_id ?? DEFAULT_GREENHOUSE_ID}`
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/"
              className="inline-flex min-h-[40px] items-center rounded border border-border px-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:bg-surface2"
              style={{ fontFamily: "'Source Code Pro', monospace" }}
            >
              Dashboard
            </a>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={pending}
              className="inline-flex min-h-[40px] items-center rounded border border-border px-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:bg-surface2 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ fontFamily: "'Source Code Pro', monospace" }}
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => void handleSync()}
              disabled={pending}
              className="inline-flex min-h-[40px] items-center rounded bg-accent px-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ fontFamily: "'Source Code Pro', monospace" }}
            >
              Sync Gateway
            </button>
          </div>
        </header>

        {error && (
          <p className="rounded border border-crit/30 bg-crit/10 px-3 py-2 text-sm text-crit">
            {error}
          </p>
        )}

        {!error && message && (
          <p className="rounded border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-ink">
            {message}
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-base font-semibold text-ink">Discovered Devices</h2>
              <p className="text-xs text-muted">Unassigned Portentas announcing to this greenhouse gateway.</p>
            </div>

            <div className="grid gap-3 p-4">
              {loading ? (
                <p className="text-sm text-muted">Loading discovered devices...</p>
              ) : discoveredDevices.length === 0 ? (
                <p className="text-sm text-muted">No discovered devices right now.</p>
              ) : (
                discoveredDevices.map((device) => (
                  <article
                    key={device.device_id}
                    onClick={() => openDeviceModal(device)}
                    className="cursor-pointer rounded border border-border/70 bg-surface2/40 px-3 py-3 transition hover:border-accent/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-ink">{device.device_id}</p>
                      <button
                        type="button"
                        onClick={() => openDeviceModal(device)}
                        className="min-h-[34px] rounded border border-border px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:bg-surface"
                        style={{ fontFamily: "'Source Code Pro', monospace" }}
                      >
                        Control
                      </button>
                    </div>
                    <p className="text-xs text-muted">Firmware: {device.firmware_version || 'unknown'}</p>
                    <p className="text-xs text-muted">Last seen: {formatTimestamp(device.last_seen_at)}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2" onClick={(event) => event.stopPropagation()}>
                      <input
                        type="text"
                        value={assignDrafts[device.device_id] ?? ''}
                        onChange={(event) => setAssignDrafts((prev) => ({ ...prev, [device.device_id]: event.target.value }))}
                        placeholder="Zone name (optional)"
                        className="min-h-[40px] flex-1 rounded border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-accent"
                      />
                      <button
                        type="button"
                        onClick={() => void handleAssign(device.device_id)}
                        disabled={pending}
                        className="min-h-[40px] rounded bg-accent px-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ fontFamily: "'Source Code Pro', monospace" }}
                      >
                        Assign
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-base font-semibold text-ink">Assigned Zones</h2>
              <p className="text-xs text-muted">Active zone mappings used by command routing and telemetry scoping.</p>
            </div>

            <div className="grid gap-3 p-4">
              {loading ? (
                <p className="text-sm text-muted">Loading assigned zones...</p>
              ) : assignedZones.length === 0 ? (
                <p className="text-sm text-muted">No assigned zones yet.</p>
              ) : (
                assignedZones.map((zone) => (
                  <article
                    key={zone.device_id}
                    onClick={() => openDeviceModal(zone)}
                    className="cursor-pointer rounded border border-border/70 bg-surface2/40 px-3 py-3 transition hover:border-accent/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">{zone.zone_name || 'Unnamed zone'}</p>
                      <button
                        type="button"
                        onClick={() => openDeviceModal(zone)}
                        className="min-h-[34px] rounded border border-border px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:bg-surface"
                        style={{ fontFamily: "'Source Code Pro', monospace" }}
                      >
                        Control
                      </button>
                    </div>
                    <p className="truncate text-xs text-muted">Zone ID: {zone.zone_id}</p>
                    <p className="truncate text-xs text-muted">Device ID: {zone.device_id}</p>
                    <p className="text-xs text-muted">Last seen: {formatTimestamp(zone.last_seen_at)}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2" onClick={(event) => event.stopPropagation()}>
                      <input
                        type="text"
                        value={renameDrafts[zone.device_id] ?? ''}
                        onChange={(event) => setRenameDrafts((prev) => ({ ...prev, [zone.device_id]: event.target.value }))}
                        placeholder="Rename zone"
                        className="min-h-[40px] flex-1 rounded border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-accent"
                      />
                      <button
                        type="button"
                        onClick={() => void handleRename(zone.device_id, zone.zone_id, zone.zone_name)}
                        disabled={pending}
                        className="min-h-[40px] rounded border border-border px-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ fontFamily: "'Source Code Pro', monospace" }}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleUnassign(zone.device_id)}
                        disabled={pending}
                        className="min-h-[40px] rounded border border-crit px-3 text-xs font-semibold uppercase tracking-[0.12em] text-crit transition hover:bg-crit/10 disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ fontFamily: "'Source Code Pro', monospace" }}
                      >
                        Unassign
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

        <ZoneDeviceModal
          isOpen={Boolean(selectedDevice)}
          onClose={closeDeviceModal}
          device={selectedDevice}
          tenantId={registry?.tenant_id ?? DEFAULT_TENANT_ID}
          greenhouseId={registry?.greenhouse_id ?? DEFAULT_GREENHOUSE_ID}
          onNotify={setMessage}
        />
      </div>
    </div>
  );
}
