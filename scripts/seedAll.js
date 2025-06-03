import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000';

const metrics = [
  { metric_type: 'temperature', value: 24, unit: '°C' },
  { metric_type: 'efficiency', value: 87, unit: '%' },
  { metric_type: 'occupancy', value: 65, unit: '%' }
];

const equipment = [
  { name: 'RTG-001', type: 'crane', status: 'active', load: 40, fuel_level: 85, battery_level: 92, sensor_value: 'normal', zone: 'Terminal A' },
  { name: 'STS-002', type: 'crane', status: 'active', load: 65, fuel_level: 78, battery_level: 88, sensor_value: 'normal', zone: 'Terminal B' },
  { name: 'TRACT-01', type: 'tractor', status: 'inactive', load: 0, fuel_level: 50, battery_level: 60, sensor_value: 'normal', zone: 'Terminal C' },
  { name: 'SENS-01', type: 'sensor', status: 'active', zone: 'Terminal D', sensor_value: 'OK' }
];

const vessels = [
  { name: 'MSC Fantasia', status: 'docked', berth_number: 'A12', arrival_time: new Date('2024-03-20T08:00:00'), departure_time: new Date('2024-03-21T16:00:00'), cargo_type: 'Containers' },
  { name: 'Maersk Sealand', status: 'approaching', berth_number: 'B08', arrival_time: new Date('2024-03-20T14:30:00'), departure_time: new Date('2024-03-22T10:00:00'), cargo_type: 'Containers' },
  { name: 'CMA CGM Marco Polo', status: 'departing', berth_number: 'C03', arrival_time: new Date('2024-03-19T06:00:00'), departure_time: new Date('2024-03-20T18:00:00'), cargo_type: 'Containers' }
];

const containers = [
  { container_number: 'MSCU1234567', status: 'loaded', location: 'Terminal A-12', type: '40ft Standard', weight: 25.5 },
  { container_number: 'MAEU7654321', status: 'in_transit', location: 'Terminal B-08', type: '20ft Standard', weight: 15.2 },
  { container_number: 'CMAU9876543', status: 'unloaded', location: 'Terminal C-03', type: '40ft High Cube', weight: 28.7 }
];

const users = [
  { full_name: 'Alice Dupont', role: 'Operator', area: 'Terminal A', status: 'online', access_level: 'admin' },
  { full_name: 'Bob Martin', role: 'Supervisor', area: 'Terminal B', status: 'offline', access_level: 'standard' }
];

const resource_usage = [
  { resource_type: 'electricity', consumption: 1200, unit: 'kWh' },
  { resource_type: 'fuel', consumption: 300, unit: 'L' }
];

const weather_conditions = [
  { temperature: 22, conditions: 'Sunny', wind_speed: 12, wave_height: 1.2, next_high_tide: new Date(), next_low_tide: new Date() }
];

const team_members = [
  { user_id: null, role: 'Operator', zone: 'Terminal A', status: 'active' },
  { user_id: null, role: 'Supervisor', zone: 'Terminal B', status: 'inactive' }
];

async function seedAll() {
  const post = async (endpoint, data) => {
    const res = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  };

  for (const m of metrics) await post('metrics', m);
  for (const e of equipment) await post('equipment', e);
  for (const v of vessels) await post('vessels', v);
  for (const c of containers) await post('containers', c);
  for (const u of users) await post('users', u);
  for (const r of resource_usage) await post('resource_usage', r);
  for (const w of weather_conditions) await post('weather_conditions', w);
  for (const t of team_members) await post('team_members', t);

  console.log('All tables seeded!');
}

seedAll(); 