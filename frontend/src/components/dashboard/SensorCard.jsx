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
  air_humidity:    'Air Humidity',
};

const STATUS_STYLES = {
  OK:   'text-accent border border-accent/30 bg-accent/10',
  WARN: 'text-warn border border-warn/30 bg-warn/10',
  ERR:  'text-crit border border-crit/30 bg-crit/10',
};

export default function SensorCard({ reading, index }) {
  const { isStale } = useDataFreshness(reading.lastUpdatedAt);
  const label = SENSOR_LABELS[reading.sensor_key] ?? reading.sensor_key;
  const statusStyle = STATUS_STYLES[reading.status] ?? STATUS_STYLES.OK;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isStale ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="relative flex flex-col justify-between bg-surface border border-border p-4 min-h-[140px] overflow-hidden group"
    >
      {/* Corner accent */}
      <span className="absolute top-0 left-0 w-2 h-2 bg-border" />
      <span className="absolute top-0 right-0 w-2 h-2 bg-border" />

      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted font-mono leading-tight">
          {label}
        </span>
        <span className={`text-[9px] tracking-widest uppercase px-1.5 py-0.5 font-mono shrink-0 ${statusStyle}`}>
          {reading.status}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5 mt-2">
        <span
          className="font-mono font-bold leading-none text-ink"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
        >
          {typeof reading.value === 'number' ? reading.value.toFixed(reading.value < 10 ? 2 : 1) : reading.value}
        </span>
        <span className="text-xs text-muted font-mono">{reading.unit}</span>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-border/50">
        <FreshnessIndicator timestamp={reading.lastUpdatedAt} />
      </div>

      {/* Stale overlay warning */}
      {isStale && (
        <div className="absolute inset-0 pointer-events-none border border-warn/20" />
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
