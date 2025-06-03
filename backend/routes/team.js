import express from 'express';
import supabase from '../supabaseClient.js';
const router = express.Router();

// Utiliser la fonction SQL get_active_team pour retourner les membres actifs enrichis
router.get('/active', async (req, res) => {
  const { data, error } = await supabase.rpc('get_active_team');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router; 