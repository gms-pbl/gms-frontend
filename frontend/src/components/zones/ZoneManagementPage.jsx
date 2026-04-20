import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useZoneRegistry } from '../../hooks/useZoneRegistry';
import ZoneDeviceModal from './ZoneDeviceModal';

const OFFLINE_AFTER_MS = 45_000;

const AVAILABILITY_FILTERS = [
  { value: 'LIVE', label: 'Live' },
  { value: 'OFFLINE', label: 'Offline' },
  { value: 'ALL', label: 'All' },
];

function isDeviceLive(lastSeenAt) {
  if (!lastSeenAt) {
    return false;
  }

  const seenAt = new Date(lastSeenAt).getTime();
  if (Number.isNaN(seenAt)) {
    return false;
  }

  return Date.now() - seenAt <= OFFLINE_AFTER_MS;
}

function withAvailability(device) {
  const live = isDeviceLive(device?.last_seen_at);
  return {
    ...device,
    is_live: live,
    availability: live ? 'LIVE' : 'OFFLINE',
  };
}

function matchesAvailability(device, filter) {
  if (filter === 'ALL') {
    return true;
  }
  return device.availability === filter;
}

function emptyListMessage(filter, section) {
  if (section === 'discovered') {
    if (filter === 'LIVE') {
      return 'No live discovered devices right now.';
    }
    if (filter === 'OFFLINE') {
      return 'No offline discovered devices right now.';
    }
    return 'No discovered devices right now.';
  }

  if (filter === 'LIVE') {
    return 'No live assigned zones right now.';
  }
  if (filter === 'OFFLINE') {
    return 'No offline assigned zones right now.';
  }
  return 'No assigned zones yet.';
}

function formatTimestamp(value) {
  if (!value) return 'n/a';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'n/a';
  return date.toLocaleString();
}

export default function ZoneManagementPage({ greenhouseId }) {
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
    greenhouseId,
  });

  const [assignDrafts, setAssignDrafts] = useState({});
  const [renameDrafts, setRenameDrafts] = useState({});
  const [message, setMessage] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [availabilityFilter, setAvailabilityFilter] = useState('LIVE');

  const discoveredDevices = useMemo(
    () => (registry?.discovered_devices ?? []).map(withAvailability),
    [registry]
  );

  const assignedZones = useMemo(
    () => (registry?.assigned_zones ?? []).map(withAvailability),
    [registry]
  );

  const filteredDiscoveredDevices = useMemo(
    () => discoveredDevices.filter((device) => matchesAvailability(device, availabilityFilter)),
    [availabilityFilter, discoveredDevices]
  );

  const filteredAssignedZones = useMemo(
    () => assignedZones.filter((zone) => matchesAvailability(zone, availabilityFilter)),
    [assignedZones, availabilityFilter]
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
              tenant `{registry?.tenant_id ?? 'n/a'}` / greenhouse `{registry?.greenhouse_id ?? greenhouseId ?? 'n/a'}`
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/g"
              className="inline-flex min-h-[40px] items-center rounded border border-border px-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:bg-surface2"
              style={{ fontFamily: "'Source Code Pro', monospace" }}
            >
              Greenhouses
            </a>
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

        <div className="flex flex-wrap items-center gap-2 rounded border border-border bg-surface px-3 py-2">
          <p className="text-xs text-muted">Status filter:</p>
          {AVAILABILITY_FILTERS.map((option) => {
            const selected = availabilityFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setAvailabilityFilter(option.value)}
                className={`min-h-[32px] rounded border px-3 text-[11px] font-semibold uppercase tracking-[0.1em] transition ${
                  selected
                    ? 'border-accent bg-accent text-white'
                    : 'border-border text-ink hover:bg-surface2'
                }`}
                style={{ fontFamily: "'Source Code Pro', monospace" }}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-base font-semibold text-ink">Discovered Devices</h2>
              <p className="text-xs text-muted">Unassigned Portentas announcing to this greenhouse gateway.</p>
            </div>

            <div className="grid gap-3 p-4">
              {loading ? (
                <p className="text-sm text-muted">Loading discovered devices...</p>
              ) : filteredDiscoveredDevices.length === 0 ? (
                <p className="text-sm text-muted">{emptyListMessage(availabilityFilter, 'discovered')}</p>
              ) : (
                filteredDiscoveredDevices.map((device) => (
                  <article
                    key={device.device_id}
                    onClick={() => openDeviceModal(device)}
                    className={`rounded border px-3 py-3 transition ${
                      device.is_live
                        ? 'cursor-pointer border-border/70 bg-surface2/40 hover:border-accent/40'
                        : 'cursor-pointer border-warn/40 bg-warn/5 hover:border-warn'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-ink">{device.device_id}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${
                            device.is_live
                              ? 'border-accent/30 bg-accent/10 text-accent'
                              : 'border-warn/40 bg-warn/10 text-warn'
                          }`}
                        >
                          {device.availability}
                        </span>
                        <button
                          type="button"
                          onClick={() => openDeviceModal(device)}
                          disabled={!device.is_live}
                          className="min-h-[34px] rounded border border-border px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ fontFamily: "'Source Code Pro', monospace" }}
                        >
                          Control
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted">Firmware: {device.firmware_version || 'unknown'}</p>
                    <p className="text-xs text-muted">Last seen: {formatTimestamp(device.last_seen_at)}</p>
                    {!device.is_live && (
                      <p className="mt-1 text-xs text-warn">
                        Device is offline. Wait for heartbeat before assigning.
                      </p>
                    )}

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
                        disabled={pending || !device.is_live}
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
              ) : filteredAssignedZones.length === 0 ? (
                <p className="text-sm text-muted">{emptyListMessage(availabilityFilter, 'assigned')}</p>
              ) : (
                filteredAssignedZones.map((zone) => (
                  <article
                    key={zone.device_id}
                    onClick={() => openDeviceModal(zone)}
                    className={`cursor-pointer rounded border px-3 py-3 transition ${
                      zone.is_live
                        ? 'border-border/70 bg-surface2/40 hover:border-accent/40'
                        : 'border-warn/40 bg-warn/5 hover:border-warn'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">{zone.zone_name || 'Unnamed zone'}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${
                            zone.is_live
                              ? 'border-accent/30 bg-accent/10 text-accent'
                              : 'border-warn/40 bg-warn/10 text-warn'
                          }`}
                        >
                          {zone.availability}
                        </span>
                        <button
                          type="button"
                          onClick={() => openDeviceModal(zone)}
                          disabled={!zone.is_live}
                          className="min-h-[34px] rounded border border-border px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ fontFamily: "'Source Code Pro', monospace" }}
                        >
                          Control
                        </button>
                      </div>
                    </div>
                    <p className="truncate text-xs text-muted">Zone ID: {zone.zone_id}</p>
                    <p className="truncate text-xs text-muted">Device ID: {zone.device_id}</p>
                    <p className="text-xs text-muted">Last seen: {formatTimestamp(zone.last_seen_at)}</p>
                    {!zone.is_live && (
                      <p className="mt-1 text-xs text-warn">Zone device is offline. Command control is disabled.</p>
                    )}

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
          greenhouseId={registry?.greenhouse_id ?? greenhouseId ?? ''}
          onNotify={setMessage}
        />
      </div>
    </div>
  );
}

ZoneManagementPage.propTypes = {
  greenhouseId: PropTypes.string,
};

ZoneManagementPage.defaultProps = {
  greenhouseId: '',
};
