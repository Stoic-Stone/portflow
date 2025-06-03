import express from 'express';
import supabase from '../supabaseClient.js';
const router = express.Router();

// Get the latest port status
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('port_status')
    .select('*')
    .order('id', { ascending: false })
    .limit(1);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router; 