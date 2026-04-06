import PropTypes from 'prop-types';
import SensorCard from './SensorCard';

export default function SensorDashboard({ readings }) {
  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
