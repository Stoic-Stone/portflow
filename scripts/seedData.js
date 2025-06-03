import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000';

// Equipment data
const equipment = [
  {
    name: 'RTG-001',
    type: 'Rubber Tyred Gantry',
    status: 'active',
    load: 40,
    fuel_level: 85,
    battery_level: 92,
    sensor_value: 'normal',
    zone: 'Terminal A',
    last_maintenance: new Date('2024-02-15'),
    next_maintenance: new Date('2024-05-15')
  },
  {
    name: 'STS-002',
    type: 'Ship-to-Shore Crane',
    status: 'active',
    load: 65,
    fuel_level: 78,
    battery_level: 88,
    sensor_value: 'normal',
    zone: 'Terminal B',
    last_maintenance: new Date('2024-01-20'),
    next_maintenance: new Date('2024-04-20')
  },
  {
    name: 'RTG-003',
    type: 'Rubber Tyred Gantry',
    status: 'maintenance',
    load: 0,
    fuel_level: 45,
    battery_level: 60,
    sensor_value: 'warning',
    zone: 'Terminal A',
    last_maintenance: new Date('2024-03-01'),
    next_maintenance: new Date('2024-06-01')
  }
];

// Vessels data
const vessels = [
  {
    name: 'MSC Fantasia',
    status: 'docked',
    berth_number: 'A12',
    arrival_time: new Date('2024-03-20T08:00:00'),
    departure_time: new Date('2024-03-21T16:00:00'),
    cargo_type: 'Containers'
  },
  {
    name: 'Maersk Sealand',
    status: 'approaching',
    berth_number: 'B08',
    arrival_time: new Date('2024-03-20T14:30:00'),
    departure_time: new Date('2024-03-22T10:00:00'),
    cargo_type: 'Containers'
  },
  {
    name: 'CMA CGM Marco Polo',
    status: 'departing',
    berth_number: 'C03',
    arrival_time: new Date('2024-03-19T06:00:00'),
    departure_time: new Date('2024-03-20T18:00:00'),
    cargo_type: 'Containers'
  }
];

// Containers data
const containers = [
  {
    container_number: 'MSCU1234567',
    status: 'loaded',
    location: 'Terminal A-12',
    type: '40ft Standard',
    weight: 25.5
  },
  {
    container_number: 'MAEU7654321',
    status: 'in_transit',
    location: 'Terminal B-08',
    type: '20ft Standard',
    weight: 15.2
  },
  {
    container_number: 'CMAU9876543',
    status: 'unloaded',
    location: 'Terminal C-03',
    type: '40ft High Cube',
    weight: 28.7
  }
];

async function seedData() {
  try {
    // Seed equipment
    console.log('Seeding equipment...');
    for (const item of equipment) {
      const res = await fetch(`${API_URL}/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      const data = await res.json();
      console.log('Inserted equipment:', data);
    }

    // Seed vessels
    console.log('\nSeeding vessels...');
    for (const vessel of vessels) {
      const res = await fetch(`${API_URL}/vessels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vessel)
      });
      const data = await res.json();
      console.log('Inserted vessel:', data);
    }

    // Seed containers
    console.log('\nSeeding containers...');
    for (const container of containers) {
      const res = await fetch(`${API_URL}/containers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(container)
      });
      const data = await res.json();
      console.log('Inserted container:', data);
    }

    console.log('\nSeeding completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedData(); 