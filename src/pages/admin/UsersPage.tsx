import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import ModalOverlay from '../../components/ui/ModalOverlay';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

// Update DBUser interface
type DBUser = {
  id: string; // UUID from Supabase Auth and public.users
  email: string;
  full_name: string;
  role: string;
};

// Utilitaire pour traduire et styliser les rôles
const getRoleLabelAndStyle = (role: string) => {
  switch (role) {
    case 'admin':
      return { label: 'Administrateur', style: 'bg-blue-900 text-white' };
    case 'supervisor':
      return { label: 'Superviseur', style: 'bg-yellow-400 text-white' };
    case 'logistics_agent':
      return { label: 'Agent logistique', style: 'bg-green-500 text-white' };
    default:
      return { label: role, style: 'bg-gray-300 text-gray-700' };
  }
};

const UsersPage = () => {
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
  const [editUser, setEditUser] = useState<DBUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [zones, setZones] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'logistics_agent',
    team_id: '',
  });
  const [formError, setFormError] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'edit', user: DBUser | null, form?: typeof form } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openUpwardsMap, setOpenUpwardsMap] = useState<{ [userId: string]: boolean }>({});

  useEffect(() => {
    fetchUsers();
    fetchZones();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchUsers = async () => {
    setLoading(true);
    const response = await fetch('/api/users/all');
    const data = await response.json();
    // Normalize user_id for all users
    setUsers((data.users || []).map((u: any) => ({
      ...u,
      id: u.id // always use the real UUID
    })));
    setLoading(false);
  };

  const fetchZones = async () => {
    const { data, error } = await supabase.from('zones').select('id, name');
    if (!error && data) setZones(data);
  };

  const handleDelete = (id: string) => {
    const user = users.find(u => u.id === id) ?? null;
    setConfirmAction({ type: 'delete', user });
  };

  const handleEdit = (user: DBUser) => {
    setEditUser(user);
    setForm({
      email: user.email,
      full_name: user.full_name || '',
      password: '',
      role: user.role,
      team_id: '',
    });
    setShowForm(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    // Validation
    if (!form.full_name || !form.email || (!editUser && !form.password) || !form.team_id) {
      setFormError('Tous les champs sont obligatoires, y compris l’équipe.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setFormError('Email invalide.');
      return;
    }
    if (editUser) {
      setConfirmAction({ type: 'edit', user: editUser, form: { ...form } });
      return;
    }
    // Call backend POST /api/users route
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        role: form.role,
        team_id: form.team_id,
      }),
    });
    let result: any = {};
    try {
      result = await response.json();
    } catch (e) {
      // Not JSON, leave result as empty object
    }
    if (!response.ok) {
      setFormError(result.error || 'Erreur lors de la création de l\'utilisateur.');
      return;
    }
    setShowForm(false);
    fetchUsers();
    setSuccessMessage('Utilisateur ajouté avec succès !');
  };

  const handleMenuOpen = useCallback((userId: string) => (event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpenUpwardsMap(prev => ({ ...prev, [userId]: spaceBelow < 200 }));
  }, []);

  const handleMenuClose = useCallback((userId: string) => {
    setOpenUpwardsMap(prev => ({ ...prev, [userId]: false }));
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6 bg-sableClair min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow p-8">
        <h2 className="text-3xl font-bold mb-6 text-blueMarine">Gestion des Utilisateurs</h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <button className="px-6 py-2 bg-blueMarine text-white rounded-lg font-semibold shadow hover:bg-blue-800 transition" onClick={() => { setShowForm(true); setEditUser(null); setForm({ email: '', full_name: '', password: '', role: 'logistics_agent', team_id: '' }); }}>Ajouter un utilisateur</button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-blueMarine uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blueMarine uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blueMarine uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blueMarine uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-blueMarine/5 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{user.full_name || user.email || user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {(() => {
                      const { label, style } = getRoleLabelAndStyle(user.role);
                      return (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}>{label}</span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button
                        onClick={handleMenuOpen(user.id)}
                        className="inline-flex justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                      >
                        <EllipsisVerticalIcon className="w-5 h-5" aria-hidden="true" />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                        afterLeave={() => handleMenuClose(user.id)}
                      >
                        <Menu.Items
                          className={`absolute right-0 z-10 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto
                            ${openUpwardsMap[user.id] ? 'bottom-full mb-2 origin-bottom-right' : 'mt-2 origin-top-right'}`}
                        >
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }: { active: boolean }) => (
                                <button
                                  onClick={() => setSelectedUser(user)}
                                  className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                  Détails
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }: { active: boolean }) => (
                                <button
                                  onClick={() => handleEdit(user)}
                                  className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                  Modifier
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }: { active: boolean }) => (
                                <button
                                  onClick={() => handleDelete(user.id)}
                                  className={`${active ? 'bg-red-50 text-red-700' : 'text-red-600'} group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                  Supprimer
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedUser && (
          <ModalOverlay onClose={() => setSelectedUser(null)}>
            <h3 className="font-bold mb-4 text-lg text-blueMarine">Détails de l'utilisateur</h3>
            <p className="mb-1"><b>Nom:</b> {selectedUser.full_name}</p>
            <p className="mb-1"><b>Email:</b> {selectedUser.email}</p>
            <p className="mb-1"><b>Rôle:</b> {selectedUser.role}</p>
            <button className="mt-4 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500" onClick={() => setSelectedUser(null)}>Fermer</button>
          </ModalOverlay>
        )}
        {showForm && (
          <ModalOverlay onClose={() => setShowForm(false)}>
            <form onSubmit={handleFormSubmit}>
              <h3 className="font-bold mb-4 text-lg text-blueMarine">{editUser ? 'Modifier' : 'Ajouter'} un utilisateur</h3>
              {formError && <div className="mb-2 text-red-600">{formError}</div>}
              <div className="mb-3">
                <input className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-blueMarine focus:border-blueMarine" name="full_name" placeholder="Nom complet" value={form.full_name} onChange={handleFormChange} required />
              </div>
              <div className="mb-3">
                <input className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-blueMarine focus:border-blueMarine" name="email" placeholder="Email" value={form.email} onChange={handleFormChange} required />
              </div>
              {!editUser && (
                <div className="mb-3">
                  <input className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-blueMarine focus:border-blueMarine" name="password" type="password" placeholder="Mot de passe" value={form.password} onChange={handleFormChange} required />
                </div>
              )}
              <div className="mb-3">
                <select className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-blueMarine focus:border-blueMarine" name="role" value={form.role} onChange={handleFormChange} required>
                  <option value="logistics_agent">Agent logistique</option>
                  <option value="supervisor">Superviseur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="mb-3">
                <select className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-blueMarine focus:border-blueMarine" name="team_id" value={form.team_id} onChange={handleFormChange} required>
                  <option value="">Sélectionner une équipe (zone)</option>
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="px-6 py-2 bg-blueMarine text-white rounded-lg font-semibold shadow hover:bg-blue-800 transition" type="submit">{editUser ? 'Enregistrer' : 'Ajouter'}</button>
                <button className="px-6 py-2 bg-gray-400 text-white rounded-lg font-semibold shadow hover:bg-gray-500 transition" type="button" onClick={() => setShowForm(false)}>Annuler</button>
              </div>
            </form>
          </ModalOverlay>
        )}
        {confirmAction && (
          <ModalOverlay onClose={() => setConfirmAction(null)}>
            <div>
              <h3 className="font-bold mb-4 text-lg text-blueMarine">
                {confirmAction.type === 'delete' ? 'Confirmer la suppression' : 'Confirmer la modification'}
              </h3>
              <p>
                Êtes-vous sûr de vouloir {confirmAction.type === 'delete' ? 'supprimer' : 'modifier'} l'utilisateur <b>{confirmAction.user?.full_name}</b> ?
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold shadow hover:bg-red-600 transition"
                  onClick={async () => {
                    if (confirmAction.type === 'delete') {
                      if (!confirmAction.user?.id) return;
                      const res = await fetch(`/api/users/${confirmAction.user.id}`, { method: 'DELETE' });
                      if (!res.ok) {
                        const err = await res.json();
                        setSuccessMessage(null);
                        setConfirmAction(null);
                        alert('Erreur lors de la suppression: ' + (err.error || ''));
                        return;
                      }
                      setUsers(users.filter(u => u.id !== confirmAction.user?.id));
                      setSelectedUser(null);
                      setConfirmAction(null);
                      setSuccessMessage('Utilisateur supprimé avec succès !');
                    } else if (confirmAction.type === 'edit') {
                      if (!confirmAction.user?.id) return;
                      const res = await fetch(`/api/users/${confirmAction.user.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          email: confirmAction.form?.email,
                          full_name: confirmAction.form?.full_name,
                          role: confirmAction.form?.role,
                          team_id: confirmAction.form?.team_id,
                        }),
                      });
                      if (!res.ok) {
                        const err = await res.json();
                        setSuccessMessage(null);
                        setConfirmAction(null);
                        alert('Erreur lors de la modification: ' + (err.error || ''));
                        return;
                      }
                      setEditUser(null);
                      setShowForm(false);
                      fetchUsers();
                      setConfirmAction(null);
                      setSuccessMessage('Utilisateur modifié avec succès !');
                    }
                  }}
                >
                  Confirmer
                </button>
                <button
                  className="px-6 py-2 bg-gray-400 text-white rounded-lg font-semibold shadow hover:bg-gray-500 transition"
                  onClick={() => setConfirmAction(null)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </ModalOverlay>
        )}
        {successMessage && (
          <div className="fixed top-8 right-8 z-50 bg-blueMarine text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border-2 border-blue-200 animate-fade-in">
            <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2l4-4" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="font-semibold">{successMessage}</span>
            <button className="ml-4 text-white text-2xl leading-none hover:text-blue-200" onClick={() => setSuccessMessage(null)}>×</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage; 