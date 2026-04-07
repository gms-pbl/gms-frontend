import PropTypes from 'prop-types';
import { motion } from 'motion/react';

const SEV = {
  CRITICAL: {
    border: '#c4503a',
    badge:  'bg-crit/15 text-crit border-crit/30',
    msg:    'text-crit',
  },
  WARNING: {
    border: '#c48a2e',
    badge:  'bg-soil/15 text-soil border-soil/30',
    msg:    'text-soil',
  },
  INFO: {
    border: '#304524',
    badge:  'bg-surface2 text-muted border-border',
    msg:    'text-ink/80',
  },
};

function formatTime(iso) {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); }
  catch { return ''; }
}

export default function AlertItem({ alert, onAcknowledge, onDismiss }) {
  const cfg = SEV[alert.severity] ?? SEV.INFO;
  const isCritical = alert.severity === 'CRITICAL';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: alert.acknowledged ? 0.4 : 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.22 }}
      className="relative flex flex-col mb-2 bg-surface border border-border overflow-hidden rounded-sm"
      style={{ borderLeftColor: cfg.border, borderLeftWidth: '3px' }}
    >
      {/* Pulsing critical border */}
      {isCritical && !alert.acknowledged && (
        <motion.span
          className="absolute left-0 top-0 bottom-0 w-[3px] bg-crit"
          animate={{ opacity: [1, 0.15, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="px-4 pt-3 pb-2.5">
        {/* Top row */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-[8px] tracking-widest uppercase px-1.5 py-0.5 border rounded-sm ${cfg.badge}`}
            style={{ fontFamily: "'Source Code Pro', monospace" }}
          >
            {alert.severity}
          </span>
          <span
            className="text-[9px] text-muted truncate"
            style={{ fontFamily: "'Source Code Pro', monospace" }}
          >
            {alert.sensor_key.replace(/_/g, '.')}
          </span>
          <span
            className="text-[9px] text-border ml-auto shrink-0"
            style={{ fontFamily: "'Source Code Pro', monospace" }}
          >
            {formatTime(alert.triggered_at)}
          </span>
        </div>

        {/* Message — slab serif */}
        <p
          className={`text-[12px] leading-snug ${cfg.msg}`}
          style={{ fontFamily: "'Zilla Slab', Georgia, serif" }}
        >
          {alert.message}
        </p>

        {/* Actions */}
        {(!alert.acknowledged || alert.severity === 'INFO') && (
          <div className="flex gap-1.5 mt-2.5">
            {!alert.acknowledged && (
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="text-[9px] tracking-widest uppercase px-2.5 py-1 border border-border text-muted hover:border-accent hover:text-accent transition-colors rounded-sm min-h-[28px]"
                style={{ fontFamily: "'Source Code Pro', monospace" }}
              >
                acknowledge
              </button>
            )}
            {(alert.severity === 'INFO' || alert.acknowledged) && (
              <button
                onClick={() => onDismiss(alert.id)}
                className="text-[9px] tracking-widest uppercase px-2.5 py-1 border border-border text-muted hover:border-crit hover:text-crit transition-colors rounded-sm min-h-[28px]"
                style={{ fontFamily: "'Source Code Pro', monospace" }}
              >
                dismiss
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

AlertItem.propTypes = {
  alert: PropTypes.shape({
    id:           PropTypes.string.isRequired,
    severity:     PropTypes.oneOf(['CRITICAL', 'WARNING', 'INFO']).isRequired,
    sensor_key:   PropTypes.string.isRequired,
    message:      PropTypes.string.isRequired,
    triggered_at: PropTypes.string.isRequired,
    acknowledged: PropTypes.bool.isRequired,
  }).isRequired,
  onAcknowledge: PropTypes.func.isRequired,
  onDismiss:     PropTypes.func.isRequired,
};
