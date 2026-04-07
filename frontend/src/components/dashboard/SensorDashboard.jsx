import PropTypes from 'prop-types';
import SensorCard from './SensorCard';

export default function SensorDashboard({ readings }) {
  const warnCount = readings.filter(r => r.status === 'WARN').length;
  const errCount  = readings.filter(r => r.status === 'ERR').length;

  return (
    <div className="p-4 sm:p-5">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted">
            Sensor Array
          </span>
          <span className="font-mono text-[9px] text-border">//</span>
          <span className="font-mono text-[9px] text-muted tracking-widest">
            {readings.length} nodes
          </span>
        </div>
        <div className="flex items-center gap-2">
          {errCount > 0 && (
            <span className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 bg-crit/10 text-crit border border-crit/30">
              {errCount} err
            </span>
          )}
          {warnCount > 0 && (
            <span className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 bg-warn/10 text-warn border border-warn/30">
              {warnCount} warn
            </span>
          )}
          {errCount === 0 && warnCount === 0 && (
            <span className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 bg-accent/10 text-accent border border-accent/30">
              all nominal
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {readings.map((reading, i) => (
          <SensorCard key={reading.sensor_key} reading={reading} index={i} />
        ))}
      </div>
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
};
