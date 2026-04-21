import PropTypes from 'prop-types';
import { motion } from 'motion/react';
import ZoneCard from './ZoneCard';

export default function IrrigationControlPanel({
  zones,
  loading,
  onToggle,
  onManualOverride,
  onEmergencyStop,
}) {
  const activeCount    = zones.filter(z => z.status === 'ACTIVE').length;
  const faultCount     = zones.filter(z => z.status === 'FAULT').length;
  const scheduledCount = zones.filter(z => z.status === 'SCHEDULED').length;
  const hasActive      = activeCount > 0;

  return (
    <div className="p-5 sm:p-7">
      {/* Section header */}
      <div className="flex items-end justify-between mb-5 pb-4 border-b border-border">
        <div>
          <h2
            className="text-ink text-xl sm:text-2xl leading-none"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Irrigation Zones
          </h2>
          <p
            className="text-muted text-[9px] tracking-widest uppercase mt-1.5"
            style={{ fontFamily: "'Source Code Pro', monospace" }}
          >
            {zones.length} zone{zones.length !== 1 ? 's' : ''} configured
          </p>
        </div>

        <div className="flex items-center gap-2 mb-0.5">
          {faultCount > 0 && (
            <span
              className="text-[9px] tracking-widest uppercase px-2 py-0.5 bg-crit/10 text-crit border border-crit/30 rounded-sm"
              style={{ fontFamily: "'Source Code Pro', monospace" }}
            >
              {faultCount} fault
            </span>
          )}
          {scheduledCount > 0 && (
            <span
              className="text-[9px] tracking-widest uppercase px-2 py-0.5 bg-warn/10 text-warn border border-warn/30 rounded-sm"
              style={{ fontFamily: "'Source Code Pro', monospace" }}
            >
              {scheduledCount} scheduled
            </span>
          )}
          {activeCount > 0 && (
            <span
              className="text-[9px] tracking-widest uppercase px-2 py-0.5 bg-accent/10 text-accent border border-accent/30 rounded-sm"
              style={{ fontFamily: "'Source Code Pro', monospace" }}
            >
              {activeCount} active
            </span>
          )}
          {!hasActive && faultCount === 0 && scheduledCount === 0 && !loading && (
            <span
              className="text-[9px] tracking-widest uppercase px-2 py-0.5 bg-muted/10 text-muted border border-muted/30 rounded-sm"
              style={{ fontFamily: "'Source Code Pro', monospace" }}
            >
              all idle
            </span>
          )}

          {/* Emergency stop — only visible when any zone is active */}
          {hasActive && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={onEmergencyStop}
              className="text-[9px] uppercase tracking-widest px-3 py-1.5 bg-crit/10 text-crit border border-crit/40 hover:bg-crit/20 transition-colors ml-1"
              style={{ fontFamily: "'Source Code Pro', monospace" }}
            >
              Emergency Stop
            </motion.button>
          )}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-bg border border-border h-[84px] animate-pulse"
              style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--color-border)' }}
            />
          ))}
        </div>
      )}

      {/* Zone grid */}
      {!loading && zones.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {zones.map((zone, i) => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              index={i}
              onToggle={onToggle}
              onManualOverride={onManualOverride}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && zones.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span
            className="text-muted text-[10px] tracking-widest uppercase"
            style={{ fontFamily: "'Source Code Pro', monospace" }}
          >
            No irrigation zones configured
          </span>
        </div>
      )}

      {/* Flow rate summary bar — only when zones are active */}
      {!loading && hasActive && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 pt-4 border-t border-border flex items-center gap-6"
        >
          <span
            className="text-[9px] tracking-widest uppercase text-muted"
            style={{ fontFamily: "'Source Code Pro', monospace" }}
          >
            Total flow
          </span>
          <span
            className="text-accent tabular-nums text-sm"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {zones
              .filter(z => z.status === 'ACTIVE')
              .reduce((sum, z) => sum + z.flow_rate_lph, 0)}{' '}
            <span className="text-muted text-[10px]">L/h</span>
          </span>
          <span
            className="text-[9px] tracking-widest uppercase text-muted ml-auto"
            style={{ fontFamily: "'Source Code Pro', monospace" }}
          >
            {activeCount} of {zones.length} zones running
          </span>
        </motion.div>
      )}
    </div>
  );
}

IrrigationControlPanel.propTypes = {
  zones:            PropTypes.array.isRequired,
  loading:          PropTypes.bool.isRequired,
  onToggle:         PropTypes.func.isRequired,
  onManualOverride: PropTypes.func.isRequired,
  onEmergencyStop:  PropTypes.func.isRequired,
};
