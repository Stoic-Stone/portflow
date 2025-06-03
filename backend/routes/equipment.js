import express from 'express';
import supabase from '../supabaseClient.js';
const router = express.Router();

// GET equipment stats (total and active cranes)
router.get('/stats', async (req, res) => {
  const { data, error } = await supabase.rpc('count_active_cranes');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data && data[0] ? data[0] : {});
});

// GET customs status (open/closed)
router.get('/customs-status', async (req, res) => {
  const { data, error } = await supabase.rpc('get_customs_status');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data && data[0] ? data[0] : {});
});

// GET equipment by id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET all equipment
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('equipment').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create equipment
router.post('/', async (req, res) => {
  const { data, error } = await supabase.from('equipment').insert([req.body]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update equipment
router.put('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('equipment')
    .update(req.body)
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE equipment
router.delete('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('equipment')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router; 