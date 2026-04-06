import PropTypes from 'prop-types';
import { motion } from 'motion/react';

const SEVERITY_STYLES = {
  CRITICAL: {
    wrapper: 'bg-crit/10 border-l-2 border-crit',
    label:   'text-crit',
    badge:   'bg-crit/20 text-crit border border-crit/40',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  WARNING: {
    wrapper: 'bg-warn/8 border-l-2 border-warn',
    label:   'text-warn',
    badge:   'bg-warn/20 text-warn border border-warn/40',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  INFO: {
    wrapper: 'bg-surface2 border-l-2 border-border',
    label:   'text-ink',
    badge:   'bg-border text-muted border border-border',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
};

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function AlertItem({ alert, onAcknowledge, onDismiss }) {
  const cfg = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.INFO;
  const isCritical = alert.severity === 'CRITICAL';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: alert.acknowledged ? 0.5 : 1, x: 0 }}
      exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      className={`relative p-3 mb-2 ${cfg.wrapper} ${alert.acknowledged ? 'opacity-50' : ''}`}
    >
      {/* Pulsing critical left border overlay */}
      {isCritical && !alert.acknowledged && (
        <motion.span
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-crit"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="flex items-start gap-2">
        <span className={`mt-0.5 ${cfg.label}`}>{cfg.icon}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] font-mono tracking-widest uppercase px-1.5 py-0.5 ${cfg.badge}`}>
              {alert.severity}
            </span>
            <span className="text-[9px] text-muted font-mono tracking-wide">
              {alert.sensor_key.replace(/_/g, ' ')}
            </span>
          </div>

          <p className={`text-[11px] font-mono leading-snug ${cfg.label}`}>
            {alert.message}
          </p>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[9px] text-muted font-mono">
              {formatTime(alert.triggered_at)}
            </span>
            <div className="flex gap-1">
              {!alert.acknowledged && (
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="text-[9px] font-mono tracking-widest uppercase px-1.5 py-0.5 border border-border text-muted hover:border-accent hover:text-accent transition-colors min-w-[44px] min-h-[22px]"
                >
                  Ack
                </button>
              )}
              {(alert.severity === 'INFO' || alert.acknowledged) && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="text-[9px] font-mono tracking-widest uppercase px-1.5 py-0.5 border border-border text-muted hover:border-crit hover:text-crit transition-colors min-w-[44px] min-h-[22px]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
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
