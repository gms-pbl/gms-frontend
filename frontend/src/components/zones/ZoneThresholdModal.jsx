import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useZoneThresholds } from '../../hooks/useZoneThresholds';
import { useZoneDeviceTelemetry } from '../../hooks/useZoneDeviceTelemetry';

const mono = { fontFamily: "'Source Code Pro', monospace" };
const serif = { fontFamily: "'Playfair Display', Georgia, serif" };

const LEVELS = [
  {
    key: 'normal',
    label: 'Normal',
    description: 'Values within this range are healthy — no alert fired',
    border: 'border-accent/30',
    bg: 'bg-accent/10',
    text: 'text-accent',
    focusBorder: 'focus:border-accent',
  },
  {
    key: 'warn',
    label: 'Warning',
    description: 'Values breaching this band → WARNING alert',
    border: 'border-warn/30',
    bg: 'bg-warn/10',
    text: 'text-warn',
    focusBorder: 'focus:border-warn',
  },
  {
    key: 'critical',
    label: 'Critical',
    description: 'Values beyond this band → CRITICAL alert',
    border: 'border-crit/30',
    bg: 'bg-crit/10',
    text: 'text-crit',
    focusBorder: 'focus:border-crit',
  },
];

function prettifySensorKey(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function hasSensorData(levels) {
  if (!levels) return false;
  return Object.values(levels).some(
    (lvl) => (lvl?.min != null && lvl?.min !== '') || (lvl?.max != null && lvl?.max !== '')
  );
}

export default function ZoneThresholdModal({ isOpen, onClose, zone, greenhouseId }) {
  const [activeSensor, setActiveSensor] = useState(null);

  // Readings drive the sensor list — keys and units come from the API
  const { readings, loading: telemetryLoading } = useZoneDeviceTelemetry({
    greenhouseId,
    zoneIds: [zone?.zone_id, zone?.device_id].filter(Boolean),
    enabled: isOpen && Boolean(zone),
    pollMs: 15000,
  });

  const { thresholds, updateField, save, saving, dirty, reset } = useZoneThresholds({
    greenhouseId,
    zoneId: zone?.zone_id,
  });

  // Sensors from live telemetry (with units) — exclude DIN/DOUT channels
  const sensorsFromReadings = useMemo(() => {
    const seen = new Set();
    return readings
      .filter((r) => {
        if (!r.sensor_key) return false;
        if (seen.has(r.sensor_key)) return false;
        const k = r.sensor_key.toLowerCase();
        if (k.startsWith('din_') || k.startsWith('dout_')) return false;
        seen.add(r.sensor_key);
        return true;
      })
      .map((r) => ({ key: r.sensor_key, label: prettifySensorKey(r.sensor_key), unit: r.unit || '' }));
  }, [readings]);

  // Sensors that already have saved thresholds (visible even when offline)
  const sensorsFromThresholds = useMemo(
    () =>
      Object.entries(thresholds)
        .filter(([, levels]) => hasSensorData(levels))
        .map(([key]) => ({ key, label: prettifySensorKey(key), unit: '' })),
    [thresholds]
  );

  // Merge: readings override saved entries so units are always shown when available
  const sensors = useMemo(() => {
    const map = new Map();
    for (const s of sensorsFromThresholds) map.set(s.key, s);
    for (const s of sensorsFromReadings) map.set(s.key, s);
    return [...map.values()];
  }, [sensorsFromReadings, sensorsFromThresholds]);

  // Auto-select first sensor when list populates
  useEffect(() => {
    if (sensors.length > 0 && (!activeSensor || !sensors.find((s) => s.key === activeSensor))) {
      setActiveSensor(sensors[0].key);
    }
  }, [sensors, activeSensor]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return undefined;
    const onEscape = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !zone) return null;

  const activeSensorMeta = sensors.find((s) => s.key === activeSensor);
  const activeThresholds = activeSensor ? (thresholds[activeSensor] ?? {}) : {};

  const handleSave = async () => { await save(); };

  const handleClose = () => {
    if (dirty) reset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-3 py-4 sm:py-6"
      onClick={handleClose}
      role="presentation"
    >
      <article
        className="my-auto flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ───────────────────────────────── */}
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3 shrink-0">
          <div>
            <h2 className="text-lg text-ink leading-snug" style={serif}>
              Sensor Thresholds
            </h2>
            <p className="text-[10px] tracking-widest uppercase text-muted mt-0.5" style={mono}>
              zone / {zone.zone_name || zone.zone_id}
            </p>
            {dirty && (
              <p className="text-[9px] text-warn mt-0.5" style={mono}>Unsaved changes</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !dirty}
              className="min-h-[36px] border border-accent/40 bg-accent/10 px-3 text-[9px] uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={mono}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="min-h-[36px] border border-border px-3 text-[9px] uppercase tracking-widest text-ink hover:bg-surface2 transition-colors"
              style={mono}
            >
              Close
            </button>
          </div>
        </header>

        {/* ── Body ─────────────────────────────────── */}
        <div className="min-h-0 flex-1 flex overflow-hidden">

          {/* Left: sensor selector */}
          <aside className="w-44 shrink-0 border-r border-border overflow-y-auto">
            {telemetryLoading && sensors.length === 0 ? (
              <p className="px-3 py-4 text-[9px] uppercase tracking-widest text-muted" style={mono}>
                Loading…
              </p>
            ) : sensors.length === 0 ? (
              <p className="px-3 py-4 text-[9px] uppercase tracking-widest text-muted leading-relaxed" style={mono}>
                No sensors. Connect the device to populate.
              </p>
            ) : (
              sensors.map((sensor) => {
                const isActive = sensor.key === activeSensor;
                const hasData = hasSensorData(thresholds[sensor.key]);
                return (
                  <button
                    key={sensor.key}
                    type="button"
                    onClick={() => setActiveSensor(sensor.key)}
                    className={`w-full text-left px-3 py-2.5 border-b border-border/50 last:border-b-0 transition-colors ${
                      isActive
                        ? 'bg-accent/10 border-l-2 border-l-accent'
                        : 'hover:bg-surface2/40 border-l-2 border-l-transparent'
                    }`}
                  >
                    <p
                      className={`text-[10px] uppercase tracking-[0.10em] leading-snug ${
                        isActive ? 'text-accent' : 'text-ink'
                      }`}
                      style={mono}
                    >
                      {sensor.label}
                    </p>
                    <p className="text-[9px] text-muted mt-0.5 flex items-center gap-1" style={mono}>
                      {sensor.unit || '—'}
                      {hasData && <span className="text-accent">●</span>}
                    </p>
                  </button>
                );
              })
            )}
          </aside>

          {/* Right: threshold fields */}
          <div className="flex-1 overflow-y-auto p-4">
            {!activeSensorMeta ? (
              <div className="flex items-center justify-center h-full py-12">
                <p className="text-[10px] uppercase tracking-widest text-muted text-center" style={mono}>
                  Select a sensor on the left.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-ink" style={serif}>
                    {activeSensorMeta.label}
                    {activeSensorMeta.unit && (
                      <span className="text-muted text-xs ml-2" style={mono}>
                        ({activeSensorMeta.unit})
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-muted mt-1" style={mono}>
                    Set min / max bounds per alert level. Leave blank to disable that level.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {LEVELS.map((level) => {
                    const levelData = activeThresholds[level.key] ?? { min: '', max: '' };
                    return (
                      <div key={level.key} className={`border ${level.border} ${level.bg} px-3 py-3`}>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 mb-2">
                          <p className={`text-[9px] uppercase tracking-widest font-semibold ${level.text}`} style={mono}>
                            {level.label}
                          </p>
                          <p className="text-[9px] text-muted" style={mono}>
                            {level.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <label className="flex flex-col gap-1 flex-1 min-w-[100px]">
                            <span className="text-[9px] uppercase tracking-widest text-muted" style={mono}>
                              Min{activeSensorMeta.unit ? ` (${activeSensorMeta.unit})` : ''}
                            </span>
                            <input
                              type="number"
                              step="any"
                              value={levelData.min ?? ''}
                              onChange={(e) => updateField(activeSensor, level.key, 'min', e.target.value)}
                              placeholder="—"
                              className={`min-h-[36px] border border-border bg-bg px-3 text-sm text-ink outline-none transition-colors ${level.focusBorder}`}
                              style={mono}
                            />
                          </label>

                          <label className="flex flex-col gap-1 flex-1 min-w-[100px]">
                            <span className="text-[9px] uppercase tracking-widest text-muted" style={mono}>
                              Max{activeSensorMeta.unit ? ` (${activeSensorMeta.unit})` : ''}
                            </span>
                            <input
                              type="number"
                              step="any"
                              value={levelData.max ?? ''}
                              onChange={(e) => updateField(activeSensor, level.key, 'max', e.target.value)}
                              placeholder="—"
                              className={`min-h-[36px] border border-border bg-bg px-3 text-sm text-ink outline-none transition-colors ${level.focusBorder}`}
                              style={mono}
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

      </article>
    </div>
  );
}

ZoneThresholdModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  zone: PropTypes.shape({
    zone_id: PropTypes.string,
    zone_name: PropTypes.string,
    device_id: PropTypes.string,
  }),
  greenhouseId: PropTypes.string.isRequired,
};

ZoneThresholdModal.defaultProps = {
  zone: null,
};
