import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/metrics';

const metrics = [
  { metric_type: 'temperature', value: 24, unit: '°C' },
  { metric_type: 'efficiency', value: 87, unit: '%' },
  { metric_type: 'occupancy', value: 65, unit: '%' }
];

(async () => {
  for (const metric of metrics) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric)
    });
    const data = await res.json();
    console.log('Inserted:', data);
  }
})(); 