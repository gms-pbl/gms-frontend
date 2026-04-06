import PropTypes from 'prop-types';
import { AnimatePresence } from 'motion/react';
import AlertItem from './AlertItem';

export default function AlertPanel({ alerts, onAcknowledge, onDismiss, onClose }) {
  const unackedCritical = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted">Alerts</span>
          {unackedCritical > 0 && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-crit/20 text-crit border border-crit/40 tracking-wider">
              {unackedCritical} critical
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-muted font-mono">{alerts.length} total</span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted hover:text-ink transition-colors p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close alert panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto p-3">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-mono tracking-widest uppercase opacity-40">No active alerts</span>
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
