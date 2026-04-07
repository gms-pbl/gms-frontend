import PropTypes from 'prop-types';
import { AnimatePresence } from 'motion/react';
import AlertItem from './AlertItem';

export default function AlertPanel({ alerts, onAcknowledge, onDismiss, onClose }) {
  const critCount = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;
  const warnCount = alerts.filter(a => a.severity === 'WARNING'  && !a.acknowledged).length;
  const infoCount = alerts.filter(a => a.severity === 'INFO'     && !a.acknowledged).length;

  return (
    <div className="flex flex-col h-full">

      {/* ── Panel header ─────────────────────────── */}
      <div className="shrink-0 border-b border-border">
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted">
            Event Log
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted hover:text-ink transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Severity summary bar */}
        <div className="flex items-center gap-0 border-t border-border/50">
          <span className={`flex-1 text-center font-mono text-[9px] tracking-widest uppercase py-1.5 border-r border-border/50 ${critCount > 0 ? 'text-crit bg-crit/10' : 'text-muted'}`}>
            {critCount} crit
          </span>
          <span className={`flex-1 text-center font-mono text-[9px] tracking-widest uppercase py-1.5 border-r border-border/50 ${warnCount > 0 ? 'text-warn bg-warn/10' : 'text-muted'}`}>
            {warnCount} warn
          </span>
          <span className={`flex-1 text-center font-mono text-[9px] tracking-widest uppercase py-1.5 ${infoCount > 0 ? 'text-ink' : 'text-muted'}`}>
            {infoCount} info
          </span>
        </div>
      </div>

      {/* ── Alert list ───────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <span className="font-mono text-[9px] tracking-widest uppercase text-muted opacity-40">
              — no events —
            </span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {alerts.map(alert => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onAcknowledge={onAcknowledge}
                onDismiss={onDismiss}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

AlertPanel.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      id:           PropTypes.string.isRequired,
      severity:     PropTypes.oneOf(['CRITICAL', 'WARNING', 'INFO']).isRequired,
      sensor_key:   PropTypes.string.isRequired,
      message:      PropTypes.string.isRequired,
      triggered_at: PropTypes.string.isRequired,
      acknowledged: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onAcknowledge: PropTypes.func.isRequired,
  onDismiss:     PropTypes.func.isRequired,
  onClose:       PropTypes.func,
};

AlertPanel.defaultProps = {
  onClose: null,
};
