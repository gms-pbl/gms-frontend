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
