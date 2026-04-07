import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

const STALE_THRESHOLD_MS = 15000;

function computeStatus(readings) {
  const total = readings.length;
  if (total === 0) return 'OFFLINE';
  const stale = readings.filter(
    r => Date.now() - new Date(r.lastUpdatedAt).getTime() > STALE_THRESHOLD_MS
  ).length;
  if (stale === 0)    return 'LIVE';
  if (stale >= total) return 'OFFLINE';
  return 'DEGRADED';
}

const CFG = {
  LIVE:     { label: 'Live',     dot: '#7ab040', text: 'text-accent', border: 'border-accent/30', bg: 'bg-accent/10' },
  DEGRADED: { label: 'Degraded', dot: '#c48a2e', text: 'text-soil',   border: 'border-soil/30',   bg: 'bg-soil/10'   },
  OFFLINE:  { label: 'Offline',  dot: '#c4503a', text: 'text-crit',   border: 'border-crit/30',   bg: 'bg-crit/10'   },
};

export default function GlobalFeedStatus({ readings }) {
  const [status, setStatus] = useState(() => computeStatus(readings));

  useEffect(() => {
    const id = setInterval(() => setStatus(computeStatus(readings)), 1000);
    return () => clearInterval(id);
  }, [readings]);

  const cfg = CFG[status];

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 border rounded-sm text-[9px] tracking-widest uppercase ${cfg.bg} ${cfg.border} ${cfg.text}`}
      style={{ fontFamily: "'Source Code Pro', monospace" }}
    >
      <motion.span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: cfg.dot }}
        animate={status === 'LIVE' ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {cfg.label}
    </div>
  );
}

GlobalFeedStatus.propTypes = {
  readings: PropTypes.arrayOf(
    PropTypes.shape({ lastUpdatedAt: PropTypes.string.isRequired })
  ).isRequired,
};
