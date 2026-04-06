import PropTypes from 'prop-types';

export default function AlertBadge({ count }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-crit text-[#fff] text-[9px] font-mono font-bold tracking-tight leading-none rounded-none">
      {count > 9 ? '9+' : count}
    </span>
  );
}

AlertBadge.propTypes = {
  count: PropTypes.number.isRequired,
};
