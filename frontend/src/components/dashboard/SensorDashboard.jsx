import PropTypes from 'prop-types';
import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import SensorCard from './SensorCard';
import HistoricalTrendPanel from './HistoricalTrendPanel';

const SENSOR_DISPLAY_KEYS = new Set([
  'air_temp', 'air_hum',
  'soil_moist', 'soil_temp', 'soil_cond', 'soil_ph',
  'soil_n', 'soil_p', 'soil_k', 'soil_salinity', 'soil_tds',
]);

export default function SensorDashboard({ readings, greenhouseId, zoneId }) {
  const [selectedKey, setSelectedKey] = useState(null);

  const sensorReadings = readings.filter(r => SENSOR_DISPLAY_KEYS.has(r.sensor_key));
  const warnCount = sensorReadings.filter(r => r.status === 'WARN').length;
  const errCount  = sensorReadings.filter(r => r.status === 'ERR').length;

  return (
    <div className="p-5 sm:p-7">
      <div className="flex items-end justify-between mb-5 pb-4 border-b border-border">
        <h2
          className="text-ink text-xl sm:text-2xl leading-none"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Sensor Readings
        </h2>
        <div className="flex items-center gap-2 mb-0.5">
          {errCount > 0 && (
            <span className="text-[9px] tracking-widest uppercase px-2 py-0.5 bg-crit/10 text-crit border border-crit/30 rounded-sm"
              style={{ fontFamily: "'Source Code Pro', monospace" }}>
              {errCount} error
            </span>
          )}
          {warnCount > 0 && (
            <span className="text-[9px] tracking-widest uppercase px-2 py-0.5 bg-warn/10 text-warn border border-warn/30 rounded-sm"
              style={{ fontFamily: "'Source Code Pro', monospace" }}>
              {warnCount} warning
            </span>
          )}
          {sensorReadings.length > 0 && errCount === 0 && warnCount === 0 && (
            <span className="text-[9px] tracking-widest uppercase px-2 py-0.5 bg-accent/10 text-accent border border-accent/30 rounded-sm"
              style={{ fontFamily: "'Source Code Pro', monospace" }}>
              all nominal
            </span>
          )}
          {greenhouseId && (
            <span
              className="text-[9px] tracking-widest uppercase text-muted ml-1 hidden sm:inline"
              style={{ fontFamily: "'Source Code Pro', monospace" }}
            >
              tap card for history
            </span>
          )}
        </div>
      </div>

      {sensorReadings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <span
            className="text-muted text-[10px] tracking-widest uppercase"
            style={{ fontFamily: "'Source Code Pro', monospace" }}
          >
            No sensor data
          </span>
          <span
            className="text-muted text-[9px] mt-2"
            style={{ fontFamily: "'Source Code Pro', monospace" }}
          >
            Waiting for device telemetry…
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {sensorReadings.map((reading, i) => (
          <SensorCard
            key={reading.sensor_key}
            reading={reading}
            index={i}
            onClick={greenhouseId ? () => setSelectedKey(reading.sensor_key) : undefined}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedKey && (
          <HistoricalTrendPanel
            key={selectedKey}
            sensorKey={selectedKey}
            greenhouseId={greenhouseId}
            zoneId={zoneId}
            onClose={() => setSelectedKey(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

SensorDashboard.propTypes = {
  readings: PropTypes.arrayOf(
    PropTypes.shape({
      sensor_key:    PropTypes.string.isRequired,
      value:         PropTypes.number.isRequired,
      unit:          PropTypes.string.isRequired,
      status:        PropTypes.string.isRequired,
      lastUpdatedAt: PropTypes.string.isRequired,
    })
  ).isRequired,
  greenhouseId: PropTypes.string,
  zoneId:       PropTypes.string,
};

SensorDashboard.defaultProps = {
  greenhouseId: '',
  zoneId:       '',
};
