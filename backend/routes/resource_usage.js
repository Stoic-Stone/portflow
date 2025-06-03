import express from 'express';
import supabase from '../supabaseClient.js';
const router = express.Router();

// GET all resource_usage
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('resource_usage').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

function formatDateHourMinute(dateStr) {
  const d = new Date(dateStr);
  // Format: YYYY-MM-DD HH:mm
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
}

// Nouvelle route pour la courbe (doit être avant /:id)
router.get('/curve', async (req, res) => {
  const { data, error } = await supabase.from('resource_usage').select('*');
  if (error) return res.status(500).json({ error: error.message });

  // Grouper par date arrondie
  const grouped = {};
  data.forEach(item => {
    const key = formatDateHourMinute(item.recorded_at);
    if (!grouped[key]) grouped[key] = { datetime: key };
    grouped[key][item.resource_type] = item.usage_percentage;
  });

  // Retourner un tableau trié par date
  const result = Object.values(grouped).sort((a, b) => a.datetime.localeCompare(b.datetime));
  res.json(result);
});

// GET resource_usage by id (doit être APRES /curve)
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('resource_usage')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create resource_usage
router.post('/', async (req, res) => {
  const { data, error } = await supabase.from('resource_usage').insert([req.body]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update resource_usage
router.put('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('resource_usage')
    .update(req.body)
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE resource_usage
router.delete('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('resource_usage')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router; 