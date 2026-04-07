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

const STATUS_BORDER_COLOR = {
  OK:   'var(--color-accent)',
  WARN: 'var(--color-warn)',
  ERR:  'var(--color-crit)',
};
const STATUS_TEXT = {
  OK:   'text-accent',
  WARN: 'text-warn',
  ERR:  'text-crit',
};

function formatValue(val) {
  if (val >= 100) return val.toFixed(0);
  if (val >= 10)  return val.toFixed(1);
  return val.toFixed(2);
}

export default function SensorCard({ reading, index }) {
  const { isStale } = useDataFreshness(reading.lastUpdatedAt);
  const label = SENSOR_LABELS[reading.sensor_key] ?? reading.sensor_key;
  const borderColor = STATUS_BORDER_COLOR[reading.status] ?? STATUS_BORDER_COLOR.OK;
  const statusText  = STATUS_TEXT[reading.status]  ?? STATUS_TEXT.OK;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: isStale ? 0.45 : 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="relative flex flex-col bg-surface border border-border overflow-hidden"
      style={{ borderLeftColor: borderColor, borderLeftWidth: '3px' }}
    >
      {/* Main body */}
      <div className="flex-1 px-4 pt-4 pb-3">
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-mono font-bold text-ink leading-none"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
          >
            {formatValue(reading.value)}
          </span>
          <span className="font-mono text-[11px] text-muted leading-none mb-0.5">
            {reading.unit}
          </span>
        </div>
        <span className="block font-mono text-[9px] tracking-[0.2em] uppercase text-muted mt-2">
          {label}
        </span>
      </div>

      {/* Footer strip */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border/60 bg-surface2">
        <FreshnessIndicator timestamp={reading.lastUpdatedAt} />
        <span className={`font-mono text-[9px] tracking-widest uppercase ${statusText}`}>
          {reading.status}
        </span>
      </div>

      {isStale && (
        <div className="absolute inset-0 pointer-events-none border border-warn/25" />
      )}
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
  index: PropTypes.number.isRequired,
};
