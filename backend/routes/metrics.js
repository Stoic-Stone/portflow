import express from 'express';
import supabase from '../supabaseClient.js';
const router = express.Router();

// GET all metrics
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('metrics').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET metric by id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create metric
router.post('/', async (req, res) => {
  const { data, error } = await supabase.from('metrics').insert([req.body]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update metric
router.put('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('metrics')
    .update(req.body)
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE metric
router.delete('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('metrics')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router; 