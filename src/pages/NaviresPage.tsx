import React, { useEffect, useState } from 'react';
import { fetchVessels, createVessel, updateVessel, deleteVessel } from '../lib/api';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

interface Vessel {
  id: string;
  name: string;
  status?: string;
  vessel_type?: string;
  eta?: string;
  etd?: string;
  quay?: string;
  berth?: string;
  dock?: string;
  location?: string;
  imo_number: string;
  created_at?: string;
  updated_at?: string;
  capacity_teu?: number;
  length_overall?: number;
}

const STATUS_FR: Record<string, string> = {
  approaching: 'En approche',
  at_berth: 'À quai',
  departing: 'En départ',
  departed: 'Parti',
  waiting: 'En attente',
};
const TYPE_FR: Record<string, string> = {
  container_ship: 'Porte-conteneurs',
  bulk_carrier: 'Vraquier',
  tanker: 'Pétrolier',
  ro_ro: 'Rouliers',
  general_cargo: 'Cargo général',
};
const STATUS_STYLE: Record<string, string> = {
  approaching: 'bg-blue-100 text-blue-800 border-blue-300',
  at_berth: 'bg-green-100 text-green-800 border-green-300',
  departing: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  departed: 'bg-gray-100 text-gray-800 border-gray-300',
  waiting: 'bg-orange-100 text-orange-800 border-orange-300',
};

function StatusBadge({ status }: { status?: string }) {
  const label = status ? (STATUS_FR[status] || status) : '-';
  const style = status ? (STATUS_STYLE[status] || 'bg-gray-100 text-gray-800 border-gray-300') : 'bg-gray-100 text-gray-800 border-gray-300';
  return (
    <span className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${style}`}>{label}</span>
  );
}

const NaviresPage = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formModal, setFormModal] = useState<{ open: boolean, mode: 'create' | 'edit', vessel: Vessel | null }>({ open: false, mode: 'create', vessel: null });
  const [form, setForm] = useState<any>({});
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [detailsModal, setDetailsModal] = useState<{ open: boolean, vessel: Vessel | null }>({ open: false, vessel: null });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, vessel: Vessel | null }>({ open: false, vessel: null });
  const { user } = useAuth();

  useEffect(() => {
    fetchVessels()
      .then((data) => setVessels(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent) => setSearch(e.detail);
    window.addEventListener('global-search', handler as EventListener);
    return () => window.removeEventListener('global-search', handler as EventListener);
  }, []);

  const refreshVessels = () => {
    setLoading(true);
    fetchVessels()
      .then((data) => setVessels(data))
      .finally(() => setLoading(false));
  };

  // Form handlers
  const openCreateModal = () => {
    setForm({});
    setFormError('');
    setFormModal({ open: true, mode: 'create', vessel: null });
  };
  const openEditModal = (vessel: Vessel) => {
    setForm({ ...vessel });
    setFormError('');
    setFormModal({ open: true, mode: 'edit', vessel });
  };
  const closeFormModal = () => {
    setFormModal({ open: false, mode: 'create', vessel: null });
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
    if (!form.name || !form.imo_number || !form.vessel_type || !form.status) {
      setFormError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    try {
      if (formModal.mode === 'create') {
        await createVessel({
          ...form,
          capacity_teu: form.capacity_teu ? parseInt(form.capacity_teu, 10) : undefined,
          length_overall: form.length_overall ? parseFloat(form.length_overall) : undefined,
        });
        setSuccessMsg('Navire ajouté avec succès !');
      } else if (formModal.mode === 'edit' && formModal.vessel) {
        await updateVessel(formModal.vessel.id, {
          ...form,
          capacity_teu: form.capacity_teu ? parseInt(form.capacity_teu, 10) : undefined,
          length_overall: form.length_overall ? parseFloat(form.length_overall) : undefined,
        });
        setSuccessMsg('Navire modifié avec succès !');
      }
      closeFormModal();
      refreshVessels();
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de l\'enregistrement.');
    }
  };

  // Delete handlers
  const openDeleteConfirm = (vessel: Vessel) => setDeleteConfirm({ open: true, vessel });
  const closeDeleteConfirm = () => setDeleteConfirm({ open: false, vessel: null });
  const handleDelete = async () => {
    if (!deleteConfirm.vessel) return;
    try {
      await deleteVessel(deleteConfirm.vessel.id);
      setSuccessMsg('Navire supprimé avec succès !');
      closeDeleteConfirm();
      refreshVessels();
    } catch (err: any) {
      setSuccessMsg('Erreur lors de la suppression.');
      closeDeleteConfirm();
    }
  };

  // Helper to get the best available value for 'Quai'
  const getQuai = (vessel: Vessel) => {
    // If you add a 'quay', 'berth', 'dock', or 'location' field in the future, update this logic
    return vessel.quay || vessel.berth || vessel.dock || vessel.location || '-';
  };

  const filteredVessels = vessels.filter(v =>
    (!search ||
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.imo_number?.toLowerCase().includes(search.toLowerCase()) ||
      (v.vessel_type && TYPE_FR[v.vessel_type as keyof typeof TYPE_FR]?.toLowerCase().includes(search.toLowerCase()))
    ) &&
    (!statusFilter || v.status === statusFilter)
  );

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
  };

  const handleExportCSV = () => {
    const headers = ['Nom', 'Statut', 'Arrivée', 'Départ', 'Type de Cargo', 'IMO'];
    const rows = filteredVessels.map(v => [
      v.name,
      STATUS_FR[v.status] || v.status,
      v.eta ? new Date(v.eta).toLocaleString() : '',
      v.etd ? new Date(v.etd).toLocaleString() : '',
      v.vessel_type ? TYPE_FR[v.vessel_type as keyof typeof TYPE_FR] || v.vessel_type : '-',
      v.imo_number
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'navires.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blueMarine">Gestion des Navires</h1>
        {user && user.role === 'admin' && (
          <button className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition" onClick={openCreateModal}>
            Ajouter un navire
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
          disabled={filteredVessels.length === 0}
        >
          Exporter CSV
        </button>
        <button onClick={resetFilters} className="ml-auto bg-gray-200 px-4 py-2 rounded">Réinitialiser</button>
      </div>
      <div className="bg-white rounded-2xl shadow p-6 w-full overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-blueMarine text-base font-semibold">
              <th className="py-2 px-4">Nom du Navire</th>
              <th className="py-2 px-4">Statut</th>
              <th className="py-2 px-4">Arrivée</th>
              <th className="py-2 px-4">Départ</th>
              <th className="py-2 px-4">Type de Cargo</th>
              <th className="py-2 px-4">IMO</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="row-hover"><td colSpan={7} className="text-center py-8">Chargement...</td></tr>
            ) : filteredVessels.length === 0 ? (
              <tr className="row-hover"><td colSpan={7} className="text-center py-8">Aucun navire trouvé.</td></tr>
            ) : (
              filteredVessels.map((vessel) => (
                <tr key={vessel.id} className="border-t last:border-b row-hover">
                  <td className="py-2 px-4 font-medium">{vessel.name}</td>
                  <td className="py-2 px-4"><StatusBadge status={vessel.status} /></td>
                  <td className="py-2 px-4">{vessel.eta ? new Date(vessel.eta).toLocaleString() : '-'}</td>
                  <td className="py-2 px-4">{vessel.etd ? new Date(vessel.etd).toLocaleString() : '-'}</td>
                  <td className="py-2 px-4">{vessel.vessel_type && (Object.keys(TYPE_FR).includes(vessel.vessel_type)) ? TYPE_FR[vessel.vessel_type as keyof typeof TYPE_FR] : vessel.vessel_type || '-'}</td>
                  <td className="py-2 px-4">{vessel.imo_number}</td>
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
                              {({ active }) => (
                                <button
                                  onClick={() => setDetailsModal({ open: true, vessel })}
                                  className={`${
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                  } group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                  Détails
                                </button>
                              )}
                            </Menu.Item>
                            {(user?.role === 'admin' || user?.role === 'supervisor') && (
                              <>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => openEditModal(vessel)}
                                      className={`${
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                      } group flex w-full items-center px-4 py-2 text-sm`}
                                    >
                                      Modifier
                                    </button>
                                  )}
                                </Menu.Item>
                                {user?.role === 'admin' && (
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => openDeleteConfirm(vessel)}
                                        className={`${
                                          active ? 'bg-red-50 text-red-700' : 'text-red-600'
                                        } group flex w-full items-center px-4 py-2 text-sm`}
                                      >
                                        Supprimer
                                      </button>
                                    )}
                                  </Menu.Item>
                                )}
                              </>
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
      </div>
      {/* Details Modal */}
      {detailsModal.open && detailsModal.vessel && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 min-w-[350px] max-w-[90vw]">
            <h2 className="text-xl font-bold mb-4">Détails du Navire</h2>
            <div className="flex flex-col gap-2">
              <div><b>Nom:</b> {detailsModal.vessel.name}</div>
              <div><b>IMO:</b> {detailsModal.vessel.imo_number}</div>
              <div><b>Statut:</b> <StatusBadge status={detailsModal.vessel.status} /></div>
              <div><b>Type:</b> {detailsModal.vessel.vessel_type && (Object.keys(TYPE_FR).includes(detailsModal.vessel.vessel_type)) ? TYPE_FR[detailsModal.vessel.vessel_type as keyof typeof TYPE_FR] : detailsModal.vessel.vessel_type || '-'}</div>
              <div><b>Arrivée:</b> {detailsModal.vessel.eta ? new Date(detailsModal.vessel.eta).toLocaleString() : '-'}</div>
              <div><b>Départ:</b> {detailsModal.vessel.etd ? new Date(detailsModal.vessel.etd).toLocaleString() : '-'}</div>
              <div><b>Capacité (TEU):</b> {detailsModal.vessel.capacity_teu ?? '-'}</div>
              <div><b>Longueur (m):</b> {detailsModal.vessel.length_overall ?? '-'}</div>
              {/* Add more details as needed */}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setDetailsModal({ open: false, vessel: null })} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition btn-hover">Fermer</button>
            </div>
          </div>
        </div>
      )}
      {/* Form Modal (Create/Edit) */}
      {formModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 min-w-[350px] max-w-[95vw]">
            <h2 className="text-xl font-bold mb-4">{formModal.mode === 'create' ? 'Ajouter' : 'Modifier'} un navire</h2>
            {formError && <div className="mb-2 text-red-600">{formError}</div>}
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
              <input className="border rounded px-3 py-2" name="name" placeholder="Nom du Navire" value={form.name || ''} onChange={handleFormChange} required />
              <input className="border rounded px-3 py-2" name="imo_number" placeholder="Numéro IMO" value={form.imo_number || ''} onChange={handleFormChange} required />
              <select className="border rounded px-3 py-2" name="vessel_type" value={form.vessel_type || ''} onChange={handleFormChange} required>
                <option value="">Type de Navire</option>
                {Object.keys(TYPE_FR).map(k => (
                  <option key={k} value={k}>{TYPE_FR[k]}</option>
                ))}
              </select>
              <select className="border rounded px-3 py-2" name="status" value={form.status || ''} onChange={handleFormChange} required>
                <option value="">Statut</option>
                {Object.keys(STATUS_FR).map(k => (
                  <option key={k} value={k}>{STATUS_FR[k]}</option>
                ))}
              </select>
              <input className="border rounded px-3 py-2" name="eta" placeholder="Date/Heure Arrivée (ex: 2023-10-26T10:00:00Z)" value={form.eta || ''} onChange={handleFormChange} type="datetime-local" />
              <input className="border rounded px-3 py-2" name="etd" placeholder="Date/Heure Départ (ex: 2023-10-26T18:00:00Z)" value={form.etd || ''} onChange={handleFormChange} type="datetime-local" />
              <input className="border rounded px-3 py-2" name="berth_id" placeholder="Poste à quai" value={form.berth_id || ''} onChange={handleFormChange} type="number" />
              <input className="border rounded px-3 py-2" name="capacity_teu" placeholder="Capacité (TEU)" value={form.capacity_teu || ''} onChange={handleFormChange} type="number" />
              <input className="border rounded px-3 py-2" name="length_overall" placeholder="Longueur (m)" value={form.length_overall || ''} onChange={handleFormChange} type="number" step="0.1"/>
              <div className="flex gap-2 mt-2">
                <button className="px-6 py-2 bg-blueMarine text-white rounded-lg font-semibold shadow hover:bg-blue-800 transition" type="submit">{formModal.mode === 'create' ? 'Ajouter' : 'Enregistrer'}</button>
                <button className="px-6 py-2 bg-gray-400 text-white rounded-lg font-semibold shadow hover:bg-gray-500 transition" type="button" onClick={closeFormModal}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && deleteConfirm.vessel && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 min-w-[350px] max-w-[95vw]">
            <h2 className="text-xl font-bold mb-4 text-red-600">Confirmer la suppression</h2>
            <p>Êtes-vous sûr de vouloir supprimer le navire <b>{deleteConfirm.vessel.name}</b> ?</p>
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
  );
};

export default NaviresPage; 