import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const mono = { fontFamily: "'Source Code Pro', monospace" };

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;
    border-radius:50%;
    background:#47622A;
    border:3px solid #f5f3eb;
    box-shadow:0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}
ClickHandler.propTypes = { onPick: PropTypes.func.isRequired };

// Calls invalidateSize after mount so tiles render correctly inside animated containers
function MapResizer() {
  const map = useMapEvents({});
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 350);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function LocationPicker({ value, onChange }) {
  const hasPick = value != null && value.lat != null;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">
        Location{' '}
        <span className="normal-case tracking-normal font-normal text-muted/70">
          (optional — click map to pin)
        </span>
      </span>

      <div className="rounded-xl overflow-hidden border border-border" style={{ height: 180 }}>
        <MapContainer
          center={[47.0, 28.9]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <MapResizer />
          <ClickHandler onPick={(lat, lng) => onChange({ lat, lng })} />
          {hasPick && <Marker position={[value.lat, value.lng]} icon={pinIcon} />}
        </MapContainer>
      </div>

      {hasPick ? (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted" style={mono}>
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-muted hover:text-crit transition-colors"
          >
            Clear
          </button>
        </div>
      ) : (
        <p className="text-xs text-muted">Click on the map to pin this greenhouse's location.</p>
      )}
    </div>
  );
}

LocationPicker.propTypes = {
  value:    PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  onChange: PropTypes.func.isRequired,
};
LocationPicker.defaultProps = { value: null };
