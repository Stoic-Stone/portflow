import express from 'express';
import supabase from '../supabaseClient.js';
const router = express.Router();

// GET container stats (total and waiting)
router.get('/stats', async (req, res) => {
  const { data, error } = await supabase.rpc('count_waiting_containers');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data && data[0] ? data[0] : {});
});

// GET container by id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('containers')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET all containers
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('containers').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create container
router.post('/', async (req, res) => {
  const { data, error } = await supabase.from('containers').insert([req.body]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update container
router.put('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('containers')
    .update(req.body)
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE container
router.delete('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('containers')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router; 