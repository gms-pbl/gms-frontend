import PropTypes from 'prop-types';
import { motion } from 'motion/react';
import CountdownTimer from './CountdownTimer';

const STATUS_CFG = {
  ACTIVE:    { pill: 'bg-accent/10 text-accent border-accent/30',   bar: 'var(--color-accent)' },
  IDLE:      { pill: 'bg-muted/10  text-muted  border-muted/30',    bar: 'var(--color-border)' },
  SCHEDULED: { pill: 'bg-warn/10  text-warn   border-warn/30',      bar: 'var(--color-warn)'   },
  FAULT:     { pill: 'bg-crit/10  text-crit   border-crit/30',      bar: 'var(--color-crit)'   },
};

function formatTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function ZoneCard({ zone, index, onToggle, onManualOverride }) {
  const cfg = STATUS_CFG[zone.status] ?? STATUS_CFG.IDLE;
  const isActive    = zone.status === 'ACTIVE';
  const isFault     = zone.status === 'FAULT';
  const inCountdown = typeof zone.countdown === 'number' && zone.countdown > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="bg-bg border border-border overflow-hidden"
      style={{ borderLeftColor: cfg.bar, borderLeftWidth: '3px' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between px-3 pt-3 pb-2">
        <div className="flex-1 min-w-0 pr-2">
          <span
            className="block text-ink text-sm leading-snug truncate"
            style={{ fontFamily: "'Zilla Slab', Georgia, serif" }}
          >
            {zone.label}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[9px] tracking-widest uppercase px-1.5 py-0.5 border rounded-sm ${cfg.pill}`}
              style={{ fontFamily: "'Source Code Pro', monospace" }}
            >
              {zone.status}
            </span>
            {inCountdown && (
              <span className="flex items-center gap-1">
                <span className="text-[9px] text-warn uppercase tracking-widest" style={{ fontFamily: "'Source Code Pro', monospace" }}>
                  override
                </span>
                <CountdownTimer seconds={zone.countdown} />
              </span>
            )}
          </div>
        </div>

        {/* Toggle button */}
        <button
          disabled={isFault}
          onClick={() => onToggle(zone.id, !isActive)}
          className={`shrink-0 min-w-[52px] text-center text-[9px] uppercase tracking-widest px-2 py-1.5 border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
            isActive
              ? 'bg-crit/10 text-crit border-crit/40 hover:bg-crit/20'
              : 'bg-accent/10 text-accent border-accent/40 hover:bg-accent/20'
          }`}
          style={{ fontFamily: "'Source Code Pro', monospace" }}
        >
          {isActive ? 'Stop' : 'Run'}
        </button>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 px-3 pb-2.5 border-t border-border/40 pt-2">
        {isActive && (
          <span className="text-[9px] text-accent" style={{ fontFamily: "'Source Code Pro', monospace" }}>
            {zone.flow_rate_lph} L/h
          </span>
        )}
        <span className="text-[9px] text-muted" style={{ fontFamily: "'Source Code Pro', monospace" }}>
          last {formatTime(zone.last_run)}
        </span>
        <span className="text-[9px] text-muted ml-auto" style={{ fontFamily: "'Source Code Pro', monospace" }}>
          next {formatTime(zone.scheduled_next)}
        </span>

        {!isActive && !isFault && !inCountdown && (
          <button
            onClick={() => onManualOverride(zone.id)}
            className="text-[9px] uppercase tracking-widest text-warn border border-warn/30 bg-warn/5 hover:bg-warn/15 px-1.5 py-0.5 transition-colors ml-1"
            style={{ fontFamily: "'Source Code Pro', monospace" }}
          >
            30s
          </button>
        )}
      </div>
    </motion.div>
  );
}

ZoneCard.propTypes = {
  zone: PropTypes.shape({
    id:             PropTypes.string.isRequired,
    label:          PropTypes.string.isRequired,
    status:         PropTypes.oneOf(['ACTIVE', 'IDLE', 'SCHEDULED', 'FAULT']).isRequired,
    flow_rate_lph:  PropTypes.number.isRequired,
    last_run:       PropTypes.string,
    duration_min:   PropTypes.number,
    scheduled_next: PropTypes.string,
    countdown:      PropTypes.number,
  }).isRequired,
  index:            PropTypes.number.isRequired,
  onToggle:         PropTypes.func.isRequired,
  onManualOverride: PropTypes.func.isRequired,
};
