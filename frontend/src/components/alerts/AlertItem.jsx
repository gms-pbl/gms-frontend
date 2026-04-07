import PropTypes from 'prop-types';
import { motion } from 'motion/react';

const SEV = {
  CRITICAL: {
    bar:    'var(--color-crit)',
    label:  'text-crit',
    badge:  'bg-crit/15 text-crit border-crit/35',
  },
  WARNING: {
    bar:    'var(--color-warn)',
    label:  'text-warn',
    badge:  'bg-warn/15 text-warn border-warn/35',
  },
  INFO: {
    bar:    'var(--color-border)',
    label:  'text-ink',
    badge:  'bg-surface2 text-muted border-border',
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
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: alert.acknowledged ? 0.4 : 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="relative flex gap-0 mb-1.5 bg-surface border border-border overflow-hidden"
      style={{ borderLeftColor: cfg.bar, borderLeftWidth: '2px' }}
    >
      {/* Pulsing crit bar */}
      {isCritical && !alert.acknowledged && (
        <motion.span
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-crit"
          animate={{ opacity: [1, 0.15, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="flex-1 px-3 py-2.5 min-w-0">
        {/* Top row: severity + sensor path + time */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={`font-mono text-[8px] tracking-widest uppercase px-1.5 py-0.5 border ${cfg.badge}`}>
            {alert.severity}
          </span>
          <span className="font-mono text-[8px] text-muted tracking-wide truncate">
            {alert.sensor_key.replace(/_/g, '.')}
          </span>
          <span className="font-mono text-[8px] text-border ml-auto shrink-0">
            {formatTime(alert.triggered_at)}
          </span>
        </div>

        {/* Message */}
        <p className={`font-mono text-[10px] leading-snug ${cfg.label}`}>
          {alert.message}
        </p>

        {/* Actions */}
        {(!alert.acknowledged || alert.severity === 'INFO') && (
          <div className="flex gap-1 mt-2">
            {!alert.acknowledged && (
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="font-mono text-[8px] tracking-widest uppercase px-2 py-1 border border-border text-muted hover:border-accent hover:text-accent transition-colors min-h-[28px]"
              >
                ack
              </button>
            )}
            {(alert.severity === 'INFO' || alert.acknowledged) && (
              <button
                onClick={() => onDismiss(alert.id)}
                className="font-mono text-[8px] tracking-widest uppercase px-2 py-1 border border-border text-muted hover:border-crit hover:text-crit transition-colors min-h-[28px]"
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
