import express from 'express';
import supabase from '../supabaseClient.js';
const router = express.Router();

// GET vessel stats (total and occupied berths)
router.get('/stats', async (req, res) => {
  const { data, error } = await supabase.rpc('count_vessels_at_berth');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data && data[0] ? data[0] : {});
});

// GET vessel by id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('vessels')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET all vessels
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('vessels').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create vessel
router.post('/', async (req, res) => {
  const { data, error } = await supabase.from('vessels').insert([req.body]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update vessel
router.put('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('vessels')
    .update(req.body)
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE vessel
router.delete('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('vessels')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router; 