import React, { useEffect, useState } from "react";
import { fetchContainers, fetchVessels, createContainer, updateContainer, deleteContainer } from "../lib/api";
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const STATUS_FR = {
  import_waiting: 'En attente import',
  export_waiting: 'En attente export',
  in_storage: 'En stockage',
  in_transit: 'En transit',
  delivered: 'Livré',
};

const TYPE_FR = {
  dry: 'Sec',
  reefer: 'Frigorifique',
  tank: 'Citerne',
  open_top: 'Toit ouvert',
  flat_rack: 'Flat rack',
};

const STATUS_STYLE = {
  import_waiting: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  export_waiting: 'bg-orange-100 text-orange-800 border-orange-300',
  in_storage: 'bg-blue-100 text-blue-800 border-blue-300',
  in_transit: 'bg-purple-100 text-purple-800 border-purple-300',
  delivered: 'bg-green-100 text-green-800 border-green-300',
};

function StatusBadge({ status }) {
  const label = STATUS_FR[status] || status;
  const style = STATUS_STYLE[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  return (
    <span className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${style}`}>{label}</span>
  );
}

export default function ContainersTable({ tableClassName = "" }) {
  const [containers, setContainers] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsModal, setDetailsModal] = useState({ open: false, container: null });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [formModal, setFormModal] = useState({ open: false, mode: 'create', container: null });
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, container: null });
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [containersData, vesselsData] = await Promise.all([
          fetchContainers(),
          fetchVessels(),
        ]);
        console.log("Fetched containers:", containersData);
        console.log("Fetched vessels:", vesselsData);
        setContainers(containersData);
        setVessels(vesselsData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const handler = (e) => setSearch(e.detail);
    window.addEventListener('global-search', handler);
    return () => window.removeEventListener('global-search', handler);
  }, []);

  const getVesselName = (id) => {
    const vessel = vessels.find((v) => v.id === id);
    return vessel ? vessel.name : id || '-';
  };

  const filteredContainers = containers.filter(container =>
    (!search ||
      container.container_number?.toLowerCase().includes(search.toLowerCase()) ||
      container.iso_code?.toLowerCase().includes(search.toLowerCase()) ||
      (container.type && TYPE_FR[container.type]?.toLowerCase().includes(search.toLowerCase()))
    ) &&
    (!statusFilter || container.status === statusFilter) &&
    (!typeFilter || container.type === typeFilter)
  );

  console.log("Rendering table. Loading:", loading, "Containers:", containers, "Vessels:", vessels);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
  };

  const handleExportCSV = () => {
    const headers = ['Numéro', 'ISO', 'Taille', 'Type', 'Statut', 'Zone', 'Vessel'];
    const rows = filteredContainers.map(c => [
      c.container_number,
      c.iso_code,
      c.size,
      TYPE_FR[c.type] || c.type,
      STATUS_FR[c.status] || c.status,
      c.zone_id ?? '-',
      getVesselName(c.vessel_id)
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'conteneurs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const refreshContainers = async () => {
    setLoading(true);
    try {
      const [containersData, vesselsData] = await Promise.all([
        fetchContainers(),
        fetchVessels(),
      ]);
      setContainers(containersData);
      setVessels(vesselsData);
    } finally {
      setLoading(false);
    }
  };

  // Form handlers
  const openCreateModal = () => {
    setForm({});
    setFormError('');
    setFormModal({ open: true, mode: 'create', container: null });
  };
  const openEditModal = (container) => {
    setForm({ ...container });
    setFormError('');
    setFormModal({ open: true, mode: 'edit', container });
  };
  const closeFormModal = () => {
    setFormModal({ open: false, mode: 'create', container: null });
    setForm({});
    setFormError('');
  };
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    // Validation simple
    if (!form.container_number || !form.iso_code || !form.size || !form.type || !form.status) {
      setFormError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    try {
      if (formModal.mode === 'create') {
        await createContainer(form);
        setSuccessMsg('Conteneur ajouté avec succès !');
      } else if (formModal.mode === 'edit' && formModal.container) {
        await updateContainer(formModal.container.id, form);
        setSuccessMsg('Conteneur modifié avec succès !');
      }
      closeFormModal();
      refreshContainers();
    } catch (err) {
      setFormError(err.message || 'Erreur lors de l\'enregistrement.');
    }
  };

  // Delete handlers
  const openDeleteConfirm = (container) => setDeleteConfirm({ open: true, container });
  const closeDeleteConfirm = () => setDeleteConfirm({ open: false, container: null });
  const handleDelete = async () => {
    if (!deleteConfirm.container) return;
    try {
      await deleteContainer(deleteConfirm.container.id);
      setSuccessMsg('Conteneur supprimé avec succès !');
      closeDeleteConfirm();
      refreshContainers();
    } catch (err) {
      setSuccessMsg('Erreur lors de la suppression.');
      closeDeleteConfirm();
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-wrap gap-4 items-end">
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
            disabled={filteredContainers.length === 0}
          >
            Exporter CSV
          </button>
          <button onClick={resetFilters} className="ml-auto bg-gray-200 px-4 py-2 rounded">Réinitialiser</button>
          {user && user.role === 'admin' && (
            <button className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition" onClick={openCreateModal}>
              Ajouter un conteneur
            </button>
          )}
        </div>
      </div>
      <table className={`w-full text-left ${tableClassName}`}>
        <thead>
          <tr className="text-blueMarine text-base font-semibold">
            <th className="py-2 px-4">Numéro</th>
            <th className="py-2 px-4">ISO</th>
            <th className="py-2 px-4">Taille</th>
            <th className="py-2 px-4">Type</th>
            <th className="py-2 px-4">Statut</th>
            <th className="py-2 px-4">Zone</th>
            <th className="py-2 px-4">Vessel</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr className="row-hover"><td colSpan={8} className="text-center py-8">Chargement...</td></tr>
          ) : filteredContainers.length === 0 ? (
            <tr className="row-hover"><td colSpan={8} className="text-center py-8">Aucun conteneur trouvé.</td></tr>
          ) : (
            filteredContainers.map((container) => (
              <tr key={container.id} className="border-t last:border-b row-hover">
                <td className="py-2 px-4 font-medium">{container.container_number}</td>
                <td className="py-2 px-4">{container.iso_code}</td>
                <td className="py-2 px-4">{container.size}</td>
                <td className="py-2 px-4">{TYPE_FR[container.type] || container.type}</td>
                <td className="py-2 px-4"><StatusBadge status={container.status} /></td>
                <td className="py-2 px-4">{container.zone_id ?? '-'}</td>
                <td className="py-2 px-4">{getVesselName(container.vessel_id)}</td>
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
                                onClick={() => setDetailsModal({ open: true, container })}
                                className={`${
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                } group flex w-full items-center px-4 py-2 text-sm`}
                              >
                                Détails
                              </button>
                            )}
                          </Menu.Item>
                          {user && user.role === 'admin' && (
                            <>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => openEditModal(container)}
                                    className={`${
                                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                    } group flex w-full items-center px-4 py-2 text-sm`}
                                  >
                                    Modifier
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => openDeleteConfirm(container)}
                                    className={`${
                                      active ? 'bg-red-50 text-red-700' : 'text-red-600'
                                    } group flex w-full items-center px-4 py-2 text-sm`}
                                  >
                                    Supprimer
                                  </button>
                                )}
                              </Menu.Item>
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
      {/* Details Modal */}
      {detailsModal.open && detailsModal.container && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 min-w-[350px] max-w-[90vw]">
            <h2 className="text-xl font-bold mb-4">Détails du Conteneur</h2>
            <div className="flex flex-col gap-2">
              <div><b>Numéro:</b> {detailsModal.container.container_number}</div>
              <div><b>ISO:</b> {detailsModal.container.iso_code}</div>
              <div><b>Taille:</b> {detailsModal.container.size}</div>
              <div><b>Type:</b> {TYPE_FR[detailsModal.container.type] || detailsModal.container.type}</div>
              <div><b>Statut:</b> <StatusBadge status={detailsModal.container.status} /></div>
              <div><b>Zone ID:</b> {detailsModal.container.zone_id ?? '-'}</div>
              <div><b>Vessel:</b> {getVesselName(detailsModal.container.vessel_id)}</div>
              <div><b>Douane:</b> {detailsModal.container.customs_cleared ? 'Oui' : 'Non'}</div>
              <div><b>Date d'arrivée:</b> {detailsModal.container.arrival_date ? new Date(detailsModal.container.arrival_date).toLocaleString() : '-'}</div>
              <div><b>Date de départ:</b> {detailsModal.container.departure_date ? new Date(detailsModal.container.departure_date).toLocaleString() : '-'}</div>
              <div><b>Créé le:</b> {detailsModal.container.created_at ? new Date(detailsModal.container.created_at).toLocaleString() : '-'}</div>
              <div><b>Modifié le:</b> {detailsModal.container.updated_at ? new Date(detailsModal.container.updated_at).toLocaleString() : '-'}</div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setDetailsModal({ open: false, container: null })} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition btn-hover">Fermer</button>
            </div>
          </div>
        </div>
      )}
      {/* Form Modal (Create/Edit) */}
      {formModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 min-w-[350px] max-w-[95vw]">
            <h2 className="text-xl font-bold mb-4">{formModal.mode === 'create' ? 'Ajouter' : 'Modifier'} un conteneur</h2>
            {formError && <div className="mb-2 text-red-600">{formError}</div>}
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
              <input className="border rounded px-3 py-2" name="container_number" placeholder="Numéro" value={form.container_number || ''} onChange={handleFormChange} required />
              <input className="border rounded px-3 py-2" name="iso_code" placeholder="ISO" value={form.iso_code || ''} onChange={handleFormChange} required />
              <input className="border rounded px-3 py-2" name="size" placeholder="Taille" value={form.size || ''} onChange={handleFormChange} required />
              <select className="border rounded px-3 py-2" name="type" value={form.type || ''} onChange={handleFormChange} required>
                <option value="">Type</option>
                <option value="dry">Sec</option>
                <option value="reefer">Frigorifique</option>
                <option value="tank">Citerne</option>
                <option value="open_top">Toit ouvert</option>
                <option value="flat_rack">Flat rack</option>
              </select>
              <select className="border rounded px-3 py-2" name="status" value={form.status || ''} onChange={handleFormChange} required>
                <option value="">Statut</option>
                <option value="import_waiting">En attente import</option>
                <option value="export_waiting">En attente export</option>
                <option value="in_storage">En stockage</option>
                <option value="in_transit">En transit</option>
                <option value="delivered">Livré</option>
              </select>
              <input className="border rounded px-3 py-2" name="zone_id" placeholder="Zone ID" value={form.zone_id || ''} onChange={handleFormChange} type="number" />
              <select className="border rounded px-3 py-2" name="vessel_id" value={form.vessel_id || ''} onChange={handleFormChange}>
                <option value="">Vessel</option>
                {vessels.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <div className="flex gap-2 mt-2">
                <button className="px-6 py-2 bg-blueMarine text-white rounded-lg font-semibold shadow hover:bg-blue-800 transition" type="submit">{formModal.mode === 'create' ? 'Ajouter' : 'Enregistrer'}</button>
                <button className="px-6 py-2 bg-gray-400 text-white rounded-lg font-semibold shadow hover:bg-gray-500 transition" type="button" onClick={closeFormModal}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && deleteConfirm.container && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 min-w-[350px] max-w-[95vw]">
            <h2 className="text-xl font-bold mb-4 text-red-600">Confirmer la suppression</h2>
            <p>Êtes-vous sûr de vouloir supprimer le conteneur <b>{deleteConfirm.container.container_number}</b> ?</p>
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
} 