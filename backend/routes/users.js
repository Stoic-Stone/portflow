import express from 'express';
import supabase from '../supabaseClient.js';
import fetch from 'node-fetch';

const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

// GET all users
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET all users
router.get('/all', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json({ users: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user by id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
  res.json(data);
});

// CREATE user: auth.users -> public.users -> team_assignments
router.post('/', async (req, res) => {
  const { email, password, full_name, role, team_id } = req.body;
  try {
    if (!email || !password || !full_name || !role || !team_id) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires, y compris team_id.' });
    }
    if (password.length < 8 || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères, un chiffre et un symbole.' });
    }
    // 1. Create user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role }
    });
    if (authError) return res.status(400).json({ error: authError.message });
    const userId = authData.user.id;
    if (!userId) return res.status(500).json({ error: "Erreur lors de la création de l'utilisateur (id manquant)." });
    // 2. Insert into public.users
    const { error: userError } = await supabase.from('users').insert([
      { id: userId, email, full_name, role }
    ]);
    if (userError) return res.status(500).json({ error: userError.message });
    // 3. Insert into team_assignments
    const { error: teamError } = await supabase.from('team_assignments').insert([
      { user_id: userId, zone_id: team_id, status: 'online' }
    ]);
    if (teamError) return res.status(500).json({ error: teamError.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE user: public.users -> team_assignments -> auth.users
router.put('/:id', async (req, res) => {
  const userId = req.params.id;
  const { email, full_name, role, team_id } = req.body;
  try {
    if (!email || !full_name || !role || !team_id) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires, y compris team_id.' });
    }
    // 1. Update in public.users
    const { error: userError } = await supabase.from('users').update({ email, full_name, role }).eq('id', userId);
    if (userError) return res.status(500).json({ error: userError.message });
    // 2. Update in team_assignments (use zone_id)
    const { error: teamError } = await supabase.from('team_assignments').update({ zone_id: team_id }).eq('user_id', userId);
    if (teamError) return res.status(500).json({ error: teamError.message });
    // 3. Update in Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      email,
      user_metadata: { full_name, role }
    });
    if (authError) return res.status(500).json({ error: authError.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user: team_assignments -> public.users -> auth.users
router.delete('/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    // 1. Delete from team_assignments
    const { error: teamError } = await supabase.from('team_assignments').delete().eq('user_id', userId);
    if (teamError) return res.status(500).json({ error: teamError.message });
    // 2. Delete from public.users
    const { error: userError } = await supabase.from('users').delete().eq('id', userId);
    if (userError) return res.status(500).json({ error: userError.message });
    // 3. Delete from Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) return res.status(500).json({ error: authError.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 