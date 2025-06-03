import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Generate 100 containers with proper data
const containers = Array.from({ length: 100 }, (_, i) => ({
  container_number: `CONT${String(i).padStart(5, '0')}`,
  iso_code: `ISO${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
  size: ['20ft', '40ft', '45ft'][Math.floor(Math.random() * 3)],
  type: ['dry', 'reefer', 'open_top', 'flat_rack', 'tank'][Math.floor(Math.random() * 5)],
  status: ['import_waiting', 'export_waiting', 'in_storage', 'in_transit', 'delivered'][Math.floor(Math.random() * 5)],
  zone_id: Math.floor(Math.random() * 6) + 1, // Assuming 6 zones exist
  vessel_id: Math.floor(Math.random() * 4) + 1, // Assuming 4 vessels exist
  customs_cleared: Math.random() > 0.5,
  arrival_date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
  departure_date: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
}));

async function seedContainers() {
  try {
    console.log('Seeding containers...');
    let successCount = 0;
    let errorCount = 0;

    // First, sign in as admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@portflow.com',
      password: 'admin123' // This should be changed in production
    });

    if (authError) {
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    console.log('Authenticated successfully');

    for (const container of containers) {
      try {
        const { data, error } = await supabase
          .from('containers')
          .insert([container])
          .select();

        if (error) {
          console.error(`Failed to insert container ${container.container_number}:`, error);
          errorCount++;
          continue;
        }

        console.log('Inserted container:', data[0].container_number);
        successCount++;
      } catch (err) {
        console.error(`Error inserting container ${container.container_number}:`, err.message);
        errorCount++;
      }
    }

    console.log('\nSeeding completed!');
    console.log(`Successfully inserted: ${successCount} containers`);
    console.log(`Failed to insert: ${errorCount} containers`);

    // Sign out
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error in seeding process:', error);
  }
}

// Run the seeding function
seedContainers().catch(console.error); 