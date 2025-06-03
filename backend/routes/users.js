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
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create user
router.post('/', async (req, res) => {
  const { data, error } = await supabase.from('users').insert([req.body]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// POST create user as admin (creates in Auth and public.users)
router.post('/admin-create', async (req, res) => {
  const { email, password, full_name, role } = req.body;
  try {
    // Try with email_confirm first
    let response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role }
      })
    });
    let data = await response.json();
    // If not ok or no id, try with email_confirmed
    if (!response.ok || !data.id) {
      response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          email_confirmed: true,
          user_metadata: { full_name, role }
        })
      });
      data = await response.json();
      if (!response.ok || !data.id) {
        return res.status(400).json({ error: data.error_description || 'Erreur lors de la création de l’utilisateur.' });
      }
    }
    // 2. Insert into public.users with the same id
    const { id } = data;
    const { error: userError } = await supabase.from('users').insert([
      { id, email, full_name, role }
    ]);
    if (userError && userError.code !== '23505') { // 23505 = duplicate key
      return res.status(500).json({ error: userError.message });
    }
    // Succès même si déjà existant
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update user in both auth.users and public.users
router.put('/:id', async (req, res) => {
  const userId = req.params.id;
  const { email, full_name, role } = req.body;
  // 1. Update in Supabase Auth
  const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
    email,
    user_metadata: { full_name, role }
  });
  if (authError) return res.status(500).json({ error: authError.message });
  // 2. Update in public.users
  const { error: userError } = await supabase.from('users').update({ email, full_name, role }).eq('id', userId);
  if (userError) return res.status(500).json({ error: userError.message });
  res.json({ success: true });
});

// DELETE user from both auth.users and public.users
router.delete('/:id', async (req, res) => {
  const userId = req.params.id;
  // 1. Delete from Supabase Auth
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) return res.status(500).json({ error: authError.message });
  // 2. Delete from public.users
  const { error: userError } = await supabase.from('users').delete().eq('id', userId);
  if (userError) return res.status(500).json({ error: userError.message });
  res.json({ success: true });
});

export default router; 