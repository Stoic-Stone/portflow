import express from 'express';
import supabase from '../supabaseClient.js';
const router = express.Router();

// GET all weather_conditions
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('weather_conditions').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET weather_condition by id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('weather_conditions')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create weather_condition
router.post('/', async (req, res) => {
  const { data, error } = await supabase.from('weather_conditions').insert([req.body]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update weather_condition
router.put('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('weather_conditions')
    .update(req.body)
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE weather_condition
router.delete('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('weather_conditions')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router; 