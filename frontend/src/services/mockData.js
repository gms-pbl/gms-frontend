export const MOCK_SITE = {
  id: 'site-001',
  name: 'Greenhouse UTM',
};

export const MOCK_SENSOR_READINGS = [
  { sensor_key: 'soil_moisture',   value: 62.4,  unit: '%',     status: 'OK',   lastUpdatedAt: new Date().toISOString() },
  { sensor_key: 'air_temperature', value: 24.1,  unit: '°C',    status: 'OK',   lastUpdatedAt: new Date().toISOString() },
  { sensor_key: 'air_humidity',    value: 71.0,  unit: '%RH',   status: 'WARN', lastUpdatedAt: new Date().toISOString() },
  { sensor_key: 'soil_temp',       value: 21.3,  unit: '°C',    status: 'OK',   lastUpdatedAt: new Date().toISOString() },
  { sensor_key: 'soil_ec',         value: 1.8,   unit: 'dS/m',  status: 'OK',   lastUpdatedAt: new Date().toISOString() },
  { sensor_key: 'soil_ph',         value: 6.7,   unit: 'pH',    status: 'OK',   lastUpdatedAt: new Date().toISOString() },
  { sensor_key: 'soil_nitrogen',   value: 34,    unit: 'mg/kg', status: 'WARN', lastUpdatedAt: new Date().toISOString() },
  { sensor_key: 'soil_phosphorus', value: 18,    unit: 'mg/kg', status: 'OK',   lastUpdatedAt: new Date().toISOString() },
  { sensor_key: 'soil_potassium',  value: 210,   unit: 'mg/kg', status: 'OK',   lastUpdatedAt: new Date().toISOString() },
  { sensor_key: 'soil_salinity',   value: 1.2,   unit: 'ppt',   status: 'OK',   lastUpdatedAt: new Date().toISOString() },
];

export const MOCK_IRRIGATION_ZONES = [
  {
    id: 'zone-001',
    label: 'Bed A — Tomatoes',
    status: 'ACTIVE',
    flow_rate_lph: 48,
    last_run: '2026-04-21T06:00:00Z',
    duration_min: 20,
    scheduled_next: '2026-04-22T06:00:00Z',
    countdown: null,
  },
  {
    id: 'zone-002',
    label: 'Bed B — Peppers',
    status: 'IDLE',
    flow_rate_lph: 32,
    last_run: '2026-04-21T06:20:00Z',
    duration_min: 15,
    scheduled_next: '2026-04-22T06:20:00Z',
    countdown: null,
  },
  {
    id: 'zone-003',
    label: 'Bed C — Lettuce',
    status: 'SCHEDULED',
    flow_rate_lph: 24,
    last_run: '2026-04-20T18:00:00Z',
    duration_min: 10,
    scheduled_next: '2026-04-21T18:00:00Z',
    countdown: null,
  },
  {
    id: 'zone-004',
    label: 'Bed D — Herbs',
    status: 'FAULT',
    flow_rate_lph: 0,
    last_run: '2026-04-20T12:00:00Z',
    duration_min: 8,
    scheduled_next: null,
    countdown: null,
  },
  {
    id: 'zone-005',
    label: 'Row E — Cucumbers',
    status: 'IDLE',
    flow_rate_lph: 56,
    last_run: '2026-04-21T07:00:00Z',
    duration_min: 25,
    scheduled_next: '2026-04-22T07:00:00Z',
    countdown: null,
  },
  {
    id: 'zone-006',
    label: 'Row F — Basil',
    status: 'IDLE',
    flow_rate_lph: 18,
    last_run: '2026-04-21T05:30:00Z',
    duration_min: 12,
    scheduled_next: '2026-04-22T05:30:00Z',
    countdown: null,
  },
];

export const MOCK_SENSOR_HISTORY = {
  data_points: [],
  thresholds: null,
};

export const MOCK_ALERTS = [
  {
    id: 'a1',
    severity: 'CRITICAL',
    sensor_key: 'soil_moisture',
    message: 'Soil moisture critically low: 12% (min 30%)',
    triggered_at: '2026-04-06T08:14:00Z',
    acknowledged: false,
  },
  {
    id: 'a2',
    severity: 'WARNING',
    sensor_key: 'air_humidity',
    message: 'Air humidity above threshold: 71%RH (max 65%)',
    triggered_at: '2026-04-06T09:02:00Z',
    acknowledged: false,
  },
  {
    id: 'a3',
    severity: 'WARNING',
    sensor_key: 'soil_nitrogen',
    message: 'Nitrogen low: 34 mg/kg (min 40 mg/kg)',
    triggered_at: '2026-04-06T07:45:00Z',
    acknowledged: false,
  },
  {
    id: 'a4',
    severity: 'INFO',
    sensor_key: 'air_temperature',
    message: 'Temperature nominal after morning fluctuation',
    triggered_at: '2026-04-06T06:30:00Z',
    acknowledged: true,
  },
];
