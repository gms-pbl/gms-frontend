import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useZoneRegistry } from '../../hooks/useZoneRegistry';
import ZoneDeviceModal from './ZoneDeviceModal';
import ZoneThresholdModal from './ZoneThresholdModal';
import { useTheme } from '../../hooks/useTheme';

const mono = { fontFamily: "'Source Code Pro', monospace" };
const serif = { fontFamily: "'Playfair Display', Georgia, serif" };

const OFFLINE_AFTER_MS = 60_000;
const AVAILABILITY_FILTERS = [
  { value: 'LIVE', label: 'Live' },
  { value: 'OFFLINE', label: 'Offline' },
  { value: 'ALL', label: 'All' },
];

function isDeviceLive(lastSeenAt) {
  if (!lastSeenAt) return false;
  const seenAt = new Date(lastSeenAt).getTime();
  if (Number.isNaN(seenAt)) return false;
  return Date.now() - seenAt <= OFFLINE_AFTER_MS;
}

function withAvailability(device) {
  const live = isDeviceLive(device?.last_seen_at);
  return { ...device, is_live: live, availability: live ? 'LIVE' : 'OFFLINE' };
}

function matchesAvailability(device, filter) {
  return filter === 'ALL' ? true : device.availability === filter;
}

function emptyListMessage(filter, section) {
  if (section === 'discovered') {
    if (filter === 'LIVE') return 'No live discovered devices right now.';
    if (filter === 'OFFLINE') return 'No offline discovered devices right now.';
    return 'No discovered devices right now.';
  }
  if (filter === 'LIVE') return 'No live assigned zones right now.';
  if (filter === 'OFFLINE') return 'No offline assigned zones right now.';
  return 'No assigned zones yet.';
}

function formatTimestamp(value) {
  if (!value) return 'n/a';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'n/a';
  return date.toLocaleString();
}

export default function ZoneManagementPage({ greenhouseId }) {
  const { isDark, toggleTheme } = useTheme();
  const { registry, loading, pending, error, refresh, assign, unassign, rename, sync } =
    useZoneRegistry({ greenhouseId });

  const [assignDrafts, setAssignDrafts] = useState({});
  const [renameDrafts, setRenameDrafts] = useState({});
  const [message, setMessage] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [thresholdsZone, setThresholdsZone] = useState(null);
  const [availabilityFilter, setAvailabilityFilter] = useState('LIVE');

  const discoveredDevices = useMemo(
    () => (registry?.discovered_devices ?? []).map(withAvailability),
    [registry]
  );
  const assignedZones = useMemo(
    () => (registry?.assigned_zones ?? []).map(withAvailability),
    [registry]
  );
  const filteredDiscovered = useMemo(
    () => discoveredDevices.filter((d) => matchesAvailability(d, availabilityFilter)),
    [availabilityFilter, discoveredDevices]
  );
  const filteredAssigned = useMemo(
    () => assignedZones.filter((z) => matchesAvailability(z, availabilityFilter)),
    [assignedZones, availabilityFilter]
  );

  const handleAssign = async (deviceId) => {
    const draftName = (assignDrafts[deviceId] ?? '').trim();
    await assign({ deviceId, zoneName: draftName || undefined });
    setAssignDrafts((prev) => ({ ...prev, [deviceId]: '' }));
    setMessage(`Assigned device ${deviceId} to a zone.`);
  };

  const handleRename = async (deviceId, zoneId, currentZoneName) => {
    const draftName = (renameDrafts[deviceId] ?? '').trim();
    const nextZoneName = draftName || currentZoneName;
    if (!nextZoneName) return;
    await rename({ deviceId, zoneId, zoneName: nextZoneName });
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

  const openDeviceModal = (device) => { setSelectedDevice(device); setMessage(''); };
  const closeDeviceModal = () => { setSelectedDevice(null); };

  return (
    <div className="min-h-screen bg-bg">

      {/* ── Page header ──────────────────────────── */}
      <header className="border-b border-border bg-surface">
        <div className="flex items-center justify-between px-5 sm:px-8 h-16">
          <div className="flex flex-col justify-center">
            <span className="text-ink leading-tight" style={{ ...serif, fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)' }}>
              Greenhouse Management System
            </span>
            <span className="text-muted text-[10px] tracking-[0.16em] uppercase mt-0.5" style={mono}>
              greenhouse / {registry?.greenhouse_id ?? greenhouseId ?? 'n/a'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/g"
              className="hidden sm:inline-flex min-h-[38px] items-center border border-border px-3 text-[10px] uppercase tracking-[0.14em] text-ink hover:bg-surface2 transition-colors"
              style={mono}
            >
              Greenhouses
            </a>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={pending}
              className="min-h-[38px] border border-border px-3 text-[10px] uppercase tracking-[0.14em] text-ink hover:bg-surface2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={mono}
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => void handleSync()}
              disabled={pending}
              className="min-h-[38px] border border-accent/40 bg-accent/10 px-3 text-[10px] uppercase tracking-[0.14em] text-accent hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={mono}
            >
              Sync
            </button>
            <button
              onClick={toggleTheme}
              className="text-muted hover:text-ink transition-colors flex items-center justify-center w-9 h-9 border border-border shrink-0"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-5 sm:p-7">

        {/* Feedback banners */}
        {error && (
          <p className="border border-crit/30 bg-crit/10 px-3 py-2 text-[10px] tracking-wide text-crit" style={mono}>
            {error}
          </p>
        )}
        {!error && message && (
          <p className="border border-accent/30 bg-accent/10 px-3 py-2 text-[10px] tracking-wide text-ink" style={mono}>
            {message}
          </p>
        )}

        {/* ── Availability filter ─────────────────── */}
        <div className="flex flex-wrap items-center gap-2 border border-border bg-surface px-3 py-2.5">
          <span className="text-[10px] tracking-widest uppercase text-muted mr-1" style={mono}>
            Filter
          </span>
          {AVAILABILITY_FILTERS.map((opt) => {
            const active = availabilityFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAvailabilityFilter(opt.value)}
                className={`min-h-[28px] px-3 text-[9px] uppercase tracking-widest border transition-colors ${
                  active
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-border text-muted hover:text-ink hover:border-border/80'
                }`}
                style={mono}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* ── Two-column grid ─────────────────────── */}
        <div className="grid gap-5 lg:grid-cols-2">

          {/* Discovered Devices */}
          <section className="border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-xl text-ink leading-none" style={serif}>Discovered Devices</h2>
              <p className="text-[10px] tracking-widest uppercase text-muted mt-1" style={mono}>
                Unassigned devices announcing to this gateway
              </p>
            </div>

            <div className="flex flex-col">
              {loading ? (
                <p className="px-4 py-6 text-[10px] tracking-widest uppercase text-muted" style={mono}>
                  Loading…
                </p>
              ) : filteredDiscovered.length === 0 ? (
                <p className="px-4 py-6 text-[10px] tracking-widest uppercase text-muted" style={mono}>
                  {emptyListMessage(availabilityFilter, 'discovered')}
                </p>
              ) : (
                filteredDiscovered.map((device) => (
                  <article
                    key={device.device_id}
                    onClick={() => openDeviceModal(device)}
                    className={`border-b border-border/50 last:border-b-0 px-4 py-3 cursor-pointer transition-colors ${
                      device.is_live ? 'hover:bg-surface2/40' : 'bg-warn/5 hover:bg-warn/10'
                    }`}
                    style={{ borderLeftWidth: '3px', borderLeftColor: device.is_live ? 'var(--color-accent)' : 'var(--color-warn)' }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm text-ink leading-snug truncate" style={mono}>
                          {device.device_id}
                        </p>
                        <p className="text-[10px] text-muted mt-0.5" style={mono}>
                          fw / {device.firmware_version || 'unknown'}
                        </p>
                        <p className="text-[10px] text-muted" style={mono}>
                          seen / {formatTimestamp(device.last_seen_at)}
                        </p>
                        {!device.is_live && (
                          <p className="text-[10px] text-warn mt-1" style={mono}>
                            Offline — wait for heartbeat before assigning
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span
                          className={`text-[9px] tracking-widest uppercase px-1.5 py-0.5 border ${
                            device.is_live
                              ? 'border-accent/30 bg-accent/10 text-accent'
                              : 'border-warn/40 bg-warn/10 text-warn'
                          }`}
                          style={mono}
                        >
                          {device.availability}
                        </span>
                        <button
                          type="button"
                          onClick={() => openDeviceModal(device)}
                          disabled={!device.is_live}
                          className="min-h-[30px] border border-border px-2 text-[9px] uppercase tracking-widest text-ink hover:bg-surface2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          style={mono}
                        >
                          Control
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={assignDrafts[device.device_id] ?? ''}
                        onChange={(e) => setAssignDrafts((p) => ({ ...p, [device.device_id]: e.target.value }))}
                        placeholder="Zone name (optional)"
                        className="min-h-[36px] flex-1 border border-border bg-bg px-3 text-sm text-ink outline-none focus:border-accent transition-colors"
                        style={mono}
                      />
                      <button
                        type="button"
                        onClick={() => void handleAssign(device.device_id)}
                        disabled={pending || !device.is_live}
                        className="min-h-[36px] border border-accent/40 bg-accent/10 px-3 text-[9px] uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        style={mono}
                      >
                        Assign
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          {/* Assigned Zones */}
          <section className="border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-xl text-ink leading-none" style={serif}>Assigned Zones</h2>
              <p className="text-[10px] tracking-widest uppercase text-muted mt-1" style={mono}>
                Active mappings for command routing and telemetry
              </p>
            </div>

            <div className="flex flex-col">
              {loading ? (
                <p className="px-4 py-6 text-[10px] tracking-widest uppercase text-muted" style={mono}>
                  Loading…
                </p>
              ) : filteredAssigned.length === 0 ? (
                <p className="px-4 py-6 text-[10px] tracking-widest uppercase text-muted" style={mono}>
                  {emptyListMessage(availabilityFilter, 'assigned')}
                </p>
              ) : (
                filteredAssigned.map((zone) => (
                  <article
                    key={zone.device_id}
                    onClick={() => openDeviceModal(zone)}
                    className={`border-b border-border/50 last:border-b-0 px-4 py-3 cursor-pointer transition-colors ${
                      zone.is_live ? 'hover:bg-surface2/40' : 'bg-warn/5 hover:bg-warn/10'
                    }`}
                    style={{ borderLeftWidth: '3px', borderLeftColor: zone.is_live ? 'var(--color-accent)' : 'var(--color-warn)' }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm text-ink leading-snug" style={serif}>
                          {zone.zone_name || 'Unnamed zone'}
                        </p>
                        <p className="text-[10px] text-muted truncate mt-0.5" style={mono}>
                          zone / {zone.zone_id}
                        </p>
                        <p className="text-[10px] text-muted truncate" style={mono}>
                          device / {zone.device_id}
                        </p>
                        <p className="text-[10px] text-muted" style={mono}>
                          seen / {formatTimestamp(zone.last_seen_at)}
                        </p>
                        {!zone.is_live && (
                          <p className="text-[10px] text-warn mt-1" style={mono}>
                            Offline — command control disabled
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span
                          className={`text-[9px] tracking-widest uppercase px-1.5 py-0.5 border ${
                            zone.is_live
                              ? 'border-accent/30 bg-accent/10 text-accent'
                              : 'border-warn/40 bg-warn/10 text-warn'
                          }`}
                          style={mono}
                        >
                          {zone.availability}
                        </span>
                        <button
                          type="button"
                          onClick={() => openDeviceModal(zone)}
                          disabled={!zone.is_live}
                          className="min-h-[30px] border border-border px-2 text-[9px] uppercase tracking-widest text-ink hover:bg-surface2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          style={mono}
                        >
                          Control
                        </button>
                        <button
                          type="button"
                          onClick={() => setThresholdsZone(zone)}
                          className="min-h-[30px] border border-border px-2 text-[9px] uppercase tracking-widest text-ink hover:bg-surface2 transition-colors"
                          style={mono}
                        >
                          Thresholds
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={renameDrafts[zone.device_id] ?? ''}
                        onChange={(e) => setRenameDrafts((p) => ({ ...p, [zone.device_id]: e.target.value }))}
                        placeholder="Rename zone"
                        className="min-h-[36px] flex-1 border border-border bg-bg px-3 text-sm text-ink outline-none focus:border-accent transition-colors"
                        style={mono}
                      />
                      <button
                        type="button"
                        onClick={() => void handleRename(zone.device_id, zone.zone_id, zone.zone_name)}
                        disabled={pending}
                        className="min-h-[36px] border border-border px-3 text-[9px] uppercase tracking-widest text-ink hover:bg-surface2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        style={mono}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleUnassign(zone.device_id)}
                        disabled={pending}
                        className="min-h-[36px] border border-crit/40 bg-crit/10 px-3 text-[9px] uppercase tracking-widest text-crit hover:bg-crit/20 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        style={mono}
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

        <ZoneThresholdModal
          isOpen={Boolean(thresholdsZone)}
          onClose={() => setThresholdsZone(null)}
          zone={thresholdsZone}
          greenhouseId={registry?.greenhouse_id ?? greenhouseId ?? ''}
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
