import React, { useEffect, useState } from 'react';
import { fetchEquipment, createEquipment, updateEquipment, deleteEquipment } from '../lib/api';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

interface Equipment {
  id: number;
  name: string;
  type: string;
  equipment_code: string;
  zone_id?: number;
  status: string;
  load_percentage?: number;
  metric_value?: string;
  metric_name?: string;
  metric_unit?: string;
  battery_level?: number;
  created_at?: string;
  updated_at?: string;
}

const TYPE_FR: Record<string, string> = {
  crane: 'Grue',
  tractor: 'Tracteur',
  sensor: 'Capteur',
};

const STATUS_FR: Record<string, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  maintenance: 'Maintenance',
};

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-300',
  inactive: 'bg-gray-100 text-gray-800 border-gray-300',
  maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

function StatusBadge({ status }: { status: string }) {
  const label = STATUS_FR[status] || status;
  const style = STATUS_STYLE[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  return (
    <span className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${style}`}>{label}</span>
  );
}

const EquipementsPage = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsModal, setDetailsModal] = useState<{ open: boolean, equipment: Equipment | null }>({ open: false, equipment: null });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [formModal, setFormModal] = useState<{ open: boolean, mode: 'create' | 'edit', equipment: Equipment | null }>({ open: false, mode: 'create', equipment: null });
  const [form, setForm] = useState<Partial<Equipment>>({});
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, equipment: Equipment | null }>({ open: false, equipment: null });
  const { user } = useAuth();

  useEffect(() => {
    fetchEquipment()
      .then((data) => setEquipment(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent) => setSearch(e.detail);
    window.addEventListener('global-search', handler as EventListener);
    return () => window.removeEventListener('global-search', handler as EventListener);
  }, []);

  const filteredEquipment = equipment.filter(eq =>
    (!search ||
      eq.name?.toLowerCase().includes(search.toLowerCase()) ||
      eq.equipment_code?.toLowerCase().includes(search.toLowerCase()) ||
      (eq.type && TYPE_FR[eq.type]?.toLowerCase().includes(search.toLowerCase()))
    ) &&
    (!statusFilter || eq.status === statusFilter) &&
    (!typeFilter || eq.type === typeFilter)
  );

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
  };

  const handleExportCSV = () => {
    const headers = ['Nom', 'Type', 'Code', 'Statut', 'Zone'];
    const rows = filteredEquipment.map(eq => [
      eq.name,
      TYPE_FR[eq.type] || eq.type,
      eq.equipment_code,
      STATUS_FR[eq.status] || eq.status,
      eq.zone_id ?? '-'
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'equipements.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const refreshEquipment = async () => {
    setLoading(true);
    try {
      const data = await fetchEquipment();
      setEquipment(data);
    } finally {
      setLoading(false);
    }
  };

  // Form handlers
  const openCreateModal = () => {
    setForm({});
    setFormError('');
    setFormModal({ open: true, mode: 'create', equipment: null });
  };
  const openEditModal = (eq: Equipment) => {
    setForm({ ...eq });
    setFormError('');
    setFormModal({ open: true, mode: 'edit', equipment: eq });
  };
  const closeFormModal = () => {
    setFormModal({ open: false, mode: 'create', equipment: null });
    setForm({});
    setFormError('');
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    // Validation simple
    if (!form.name || !form.type || !form.equipment_code || !form.status) {
      setFormError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    try {
      if (formModal.mode === 'create') {
        await createEquipment(form);
        setSuccessMsg('Équipement ajouté avec succès !');
      } else if (formModal.mode === 'edit' && formModal.equipment) {
        await updateEquipment(formModal.equipment.id, form);
        setSuccessMsg('Équipement modifié avec succès !');
      }
      closeFormModal();
      refreshEquipment();
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de l\'enregistrement.');
    }
  };

  // Delete handlers
  const openDeleteConfirm = (eq: Equipment) => setDeleteConfirm({ open: true, equipment: eq });
  const closeDeleteConfirm = () => setDeleteConfirm({ open: false, equipment: null });
  const handleDelete = async () => {
    if (!deleteConfirm.equipment) return;
    try {
      await deleteEquipment(deleteConfirm.equipment.id);
      setSuccessMsg('Équipement supprimé avec succès !');
      closeDeleteConfirm();
      refreshEquipment();
    } catch (err: any) {
      setSuccessMsg('Erreur lors de la suppression.');
      closeDeleteConfirm();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blueMarine">Gestion des Équipements</h1>
        {user && user.role === 'admin' && (
          <button className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition" onClick={openCreateModal}>
            Ajouter un équipement
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Statut</label>
          <select
            className="border rounded px-3 py-2 min-w-[150px]"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Tous</option>
            {Object.keys(STATUS_FR).map(k => (
              <option key={k} value={k}>{STATUS_FR[k]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            className="border rounded px-3 py-2 min-w-[150px]"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">Tous</option>
            {Object.keys(TYPE_FR).map(k => (
              <option key={k} value={k}>{TYPE_FR[k]}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Recherche</label>
          <input
            className="border rounded px-3 py-2 w-full"
            type="text"
            placeholder="Rechercher…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          className="ml-auto bg-blueMarine text-white px-4 py-2 rounded shadow hover:bg-blue-900 transition"
          onClick={handleExportCSV}
          disabled={filteredEquipment.length === 0}
        >
          Exporter CSV
        </button>
        <button onClick={resetFilters} className="ml-auto bg-gray-200 px-4 py-2 rounded">Réinitialiser</button>
      </div>
      <div className="bg-white rounded-2xl shadow p-6 w-full overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left">
          <thead>
            <tr className="text-blueMarine text-base font-semibold">
              <th className="py-2 px-4">Nom</th>
              <th className="py-2 px-4">Type</th>
              <th className="py-2 px-4">Code</th>
              <th className="py-2 px-4">Statut</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="row-hover"><td colSpan={5} className="text-center py-8">Chargement...</td></tr>
            ) : filteredEquipment.length === 0 ? (
              <tr className="row-hover"><td colSpan={5} className="text-center py-8">Aucun équipement trouvé.</td></tr>
            ) : (
              filteredEquipment.map((eq) => (
                <tr key={eq.id} className="border-t last:border-b row-hover">
                  <td className="py-2 px-4 font-medium">{eq.name}</td>
                  <td className="py-2 px-4">{TYPE_FR[eq.type] || eq.type}</td>
                  <td className="py-2 px-4">{eq.equipment_code}</td>
                  <td className="py-2 px-4"><StatusBadge status={eq.status} /></td>
                  <td className="py-2 px-4">
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="inline-flex justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
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
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }: { active: boolean }) => (
                                <button
                                  onClick={() => setDetailsModal({ open: true, equipment: eq })}
                                  className={`${
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                  } group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                  Détails
                                </button>
                              )}
                            </Menu.Item>
                            {(user?.role === 'admin' || user?.role === 'supervisor') && (
                              <Menu.Item>
                                {({ active }: { active: boolean }) => (
                                  <button
                                    onClick={() => openEditModal(eq)}
                                    className={`${
                                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                    } group flex w-full items-center px-4 py-2 text-sm`}
                                  >
                                    Modifier
                                  </button>
                                )}
                              </Menu.Item>
                            )}
                            {user && user.role === 'admin' && (
                              <Menu.Item>
                                {({ active }: { active: boolean }) => (
                                  <button
                                    onClick={() => openDeleteConfirm(eq)}
                                    className={`${
                                      active ? 'bg-red-50 text-red-700' : 'text-red-600'
                                    } group flex w-full items-center px-4 py-2 text-sm`}
                                  >
                                    Supprimer
                                  </button>
                                )}
                              </Menu.Item>
                            )}
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Details Modal */}
        {detailsModal.open && detailsModal.equipment && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 min-w-[350px] max-w-[90vw]">
              <h2 className="text-xl font-bold mb-4">Détails de l'Équipement</h2>
              <div className="flex flex-col gap-2">
                <div><b>Nom:</b> {detailsModal.equipment.name}</div>
                <div><b>Type:</b> {TYPE_FR[detailsModal.equipment.type] || detailsModal.equipment.type}</div>
                <div><b>Code:</b> {detailsModal.equipment.equipment_code}</div>
                <div><b>Statut:</b> <StatusBadge status={detailsModal.equipment.status} /></div>
                <div><b>Zone ID:</b> {detailsModal.equipment.zone_id ?? '-'}</div>
                <div><b>Charge (%):</b> {detailsModal.equipment.load_percentage ?? '-'}</div>
                <div><b>Métrique:</b> {detailsModal.equipment.metric_name ?? '-'} {detailsModal.equipment.metric_value ?? ''} {detailsModal.equipment.metric_unit ?? ''}</div>
                <div><b>Batterie (%):</b> {detailsModal.equipment.battery_level ?? '-'}</div>
                <div><b>Créé le:</b> {detailsModal.equipment.created_at ? new Date(detailsModal.equipment.created_at).toLocaleString() : '-'}</div>
                <div><b>Modifié le:</b> {detailsModal.equipment.updated_at ? new Date(detailsModal.equipment.updated_at).toLocaleString() : '-'}</div>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setDetailsModal({ open: false, equipment: null })} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition btn-hover">Fermer</button>
              </div>
            </div>
          </div>
        )}
        {/* Form Modal (Create/Edit) */}
        {formModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 min-w-[350px] max-w-[95vw]">
              <h2 className="text-xl font-bold mb-4">{formModal.mode === 'create' ? 'Ajouter' : 'Modifier'} un équipement</h2>
              {formError && <div className="mb-2 text-red-600">{formError}</div>}
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
                <input className="border rounded px-3 py-2" name="name" placeholder="Nom" value={form.name || ''} onChange={handleFormChange} required />
                <select className="border rounded px-3 py-2" name="type" value={form.type || ''} onChange={handleFormChange} required>
                  <option value="">Type</option>
                  <option value="crane">Grue</option>
                  <option value="tractor">Tracteur</option>
                  <option value="sensor">Capteur</option>
                </select>
                <input className="border rounded px-3 py-2" name="equipment_code" placeholder="Code" value={form.equipment_code || ''} onChange={handleFormChange} required />
                <select className="border rounded px-3 py-2" name="status" value={form.status || ''} onChange={handleFormChange} required>
                  <option value="">Statut</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                <input className="border rounded px-3 py-2" name="zone_id" placeholder="Zone ID" value={form.zone_id || ''} onChange={handleFormChange} type="number" />
                <input className="border rounded px-3 py-2" name="load_percentage" placeholder="Charge (%)" value={form.load_percentage || ''} onChange={handleFormChange} type="number" />
                <input className="border rounded px-3 py-2" name="metric_name" placeholder="Métrique (nom)" value={form.metric_name || ''} onChange={handleFormChange} />
                <input className="border rounded px-3 py-2" name="metric_value" placeholder="Métrique (valeur)" value={form.metric_value || ''} onChange={handleFormChange} />
                <input className="border rounded px-3 py-2" name="metric_unit" placeholder="Métrique (unité)" value={form.metric_unit || ''} onChange={handleFormChange} />
                <input className="border rounded px-3 py-2" name="battery_level" placeholder="Batterie (%)" value={form.battery_level || ''} onChange={handleFormChange} type="number" />
                <div className="flex gap-2 mt-2">
                  <button className="px-6 py-2 bg-blueMarine text-white rounded-lg font-semibold shadow hover:bg-blue-800 transition" type="submit">{formModal.mode === 'create' ? 'Ajouter' : 'Enregistrer'}</button>
                  <button className="px-6 py-2 bg-gray-400 text-white rounded-lg font-semibold shadow hover:bg-gray-500 transition" type="button" onClick={closeFormModal}>Annuler</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {deleteConfirm.open && deleteConfirm.equipment && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 min-w-[350px] max-w-[95vw]">
              <h2 className="text-xl font-bold mb-4 text-red-600">Confirmer la suppression</h2>
              <p>Êtes-vous sûr de vouloir supprimer l'équipement <b>{deleteConfirm.equipment.name}</b> ?</p>
              <div className="flex gap-2 mt-6 justify-end">
                <button className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold shadow hover:bg-red-600 transition" onClick={handleDelete}>Supprimer</button>
                <button className="px-6 py-2 bg-gray-400 text-white rounded-lg font-semibold shadow hover:bg-gray-500 transition" onClick={closeDeleteConfirm}>Annuler</button>
              </div>
            </div>
          </div>
        )}
        {/* Message de succès */}
        {successMsg && (
          <div className="fixed top-8 right-8 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border-2 border-green-200 animate-fade-in">
            <span className="font-semibold">{successMsg}</span>
            <button className="ml-4 text-white text-2xl leading-none hover:text-green-200" onClick={() => setSuccessMsg('')}>×</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipementsPage; 