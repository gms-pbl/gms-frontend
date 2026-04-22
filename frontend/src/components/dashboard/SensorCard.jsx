import PropTypes from 'prop-types';
import { motion } from 'motion/react';
import FreshnessIndicator from './FreshnessIndicator';
import { useDataFreshness } from '../../hooks/useDataFreshness';

const SENSOR_LABELS = {
  soil_moisture:   'Soil Moisture',
  soil_ec:         'Soil Conductivity',
  soil_salinity:   'Soil Salinity',
  soil_temp:       'Soil Temperature',
  soil_ph:         'Soil pH',
  soil_nitrogen:   'Nitrogen',
  soil_phosphorus: 'Phosphorus',
  soil_potassium:  'Potassium',
  air_temperature: 'Air Temperature',
  air_humidity:    'Relative Humidity',
};

const STATUS_CFG = {
  OK:   { border: 'var(--color-accent)', pill: 'bg-accent/10 text-accent border-accent/30',  dot: 'bg-accent' },
  WARN: { border: 'var(--color-warn)',   pill: 'bg-warn/10 text-warn border-warn/30',         dot: 'bg-warn'   },
  ERR:  { border: 'var(--color-crit)',   pill: 'bg-crit/10 text-crit border-crit/30',         dot: 'bg-crit'   },
};

function formatValue(val) {
  if (val >= 100) return val.toFixed(0);
  if (val >= 10)  return val.toFixed(1);
  return val.toFixed(2);
}

export default function SensorCard({ reading, index, onClick }) {
  const { isStale } = useDataFreshness(reading.lastUpdatedAt);
  const label = SENSOR_LABELS[reading.sensor_key] ?? reading.sensor_key;
  const cfg = STATUS_CFG[reading.status] ?? STATUS_CFG.OK;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: isStale ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      onClick={onClick}
      className={`relative flex flex-col bg-surface border border-border overflow-hidden ${onClick ? 'cursor-pointer hover:border-accent/50 transition-colors' : ''}`}
      style={{ borderLeftColor: cfg.border, borderLeftWidth: '3px' }}
    >
      {/* Value + label */}
      <div className="flex-1 px-5 pt-5 pb-4">
        <div className="flex items-baseline gap-2">
          <span
            className="text-ink font-semibold leading-none"
            style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 'clamp(1.9rem, 3vw, 2.75rem)' }}
          >
            {formatValue(reading.value)}
          </span>
          <span className="text-muted text-xs leading-none mb-0.5" style={{ fontFamily: "'Source Code Pro', monospace" }}>
            {reading.unit}
          </span>
        </div>

        <span
          className="block text-ink/75 text-sm mt-2.5 leading-snug"
          style={{ fontFamily: "'Zilla Slab', Georgia, serif" }}
        >
          {label}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-2.5 border-t border-border/60 bg-surface2">
        <FreshnessIndicator timestamp={reading.lastUpdatedAt} />
        <span
          className={`text-[9px] tracking-widest uppercase px-2 py-0.5 border rounded-sm ${cfg.pill}`}
          style={{ fontFamily: "'Source Code Pro', monospace" }}
        >
          {reading.status}
        </span>
      </div>

      {isStale && <div className="absolute inset-0 pointer-events-none border border-warn/30" />}
    </motion.div>
  );
}

SensorCard.propTypes = {
  reading: PropTypes.shape({
    sensor_key:    PropTypes.string.isRequired,
    value:         PropTypes.number.isRequired,
    unit:          PropTypes.string.isRequired,
    status:        PropTypes.string.isRequired,
    lastUpdatedAt: PropTypes.string.isRequired,
  }).isRequired,
  index:   PropTypes.number.isRequired,
  onClick: PropTypes.func,
};

SensorCard.defaultProps = {
  onClick: null,
};
