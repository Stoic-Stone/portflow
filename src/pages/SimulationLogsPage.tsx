import React, { useEffect, useState } from 'react';
import { fetchSimulationLogs } from '../lib/api';
import type { SimulationLog } from '../lib/api';

const CATEGORY_FR: Record<string, string> = {
  navires: 'Navires',
  grues: 'Grues',
  conteneurs: 'Conteneurs',
  douane: 'Douane',
};

const ACTION_FR: Record<string, string> = {
  'SIMULATION_ENABLED': 'Activation du mode simulation',
  'SIMULATION_DISABLED': 'Désactivation du mode simulation',
};

const unique = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

const SimulationLogsPage = () => {
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSimulationLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter and search
  const filteredLogs = logs.filter(log => {
    const matchesUser = !userFilter || log.user_name === userFilter;
    const matchesAction = !actionFilter || log.action === actionFilter;
    const matchesCategory = !categoryFilter || log.category === categoryFilter;
    const searchText = `${log.user_name} ${log.action} ${log.category} ${log.timestamp} ${log.details}`.toLowerCase();
    const matchesSearch = !search || searchText.includes(search.toLowerCase());
    return matchesUser && matchesAction && matchesCategory && matchesSearch;
  });

  // CSV export
  const handleExportCSV = () => {
    const headers = ['ID Utilisateur', 'Utilisateur', 'Rôle', 'Action', 'Catégorie', 'Date/Heure', 'Détails'];
    const rows = filteredLogs.map(log => [
      log.user_id || '-',
      log.user_name || '-',
      log.user_role || '-',
      ACTION_FR[log.action] || log.action,
      CATEGORY_FR[log.category] || log.category,
      log.timestamp ? new Date(log.timestamp).toLocaleString() : '-',
      log.details
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'logs_simulation.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blueMarine mb-8">Historique des Logs de Simulation</h1>
      
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Utilisateur</label>
          <select 
            className="border rounded px-2 py-1" 
            value={userFilter} 
            onChange={e => setUserFilter(e.target.value)}
          >
            <option value="">Tous</option>
            {unique(logs.map(l => l.user_name)).map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Action</label>
          <select 
            className="border rounded px-2 py-1" 
            value={actionFilter} 
            onChange={e => setActionFilter(e.target.value)}
          >
            <option value="">Toutes</option>
            {unique(logs.map(l => l.action)).map(a => (
              <option key={a} value={a}>{ACTION_FR[a] || a}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Catégorie</label>
          <select 
            className="border rounded px-2 py-1" 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="">Toutes</option>
            {unique(logs.map(l => l.category)).map(c => (
              <option key={c} value={c}>{CATEGORY_FR[c] || c}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm font-medium mb-1">Recherche</label>
          <input
            className="border rounded px-2 py-1 w-full"
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <button
          className="ml-auto bg-blueMarine text-white px-4 py-2 rounded shadow hover:bg-blue-900 transition"
          onClick={handleExportCSV}
          disabled={filteredLogs.length === 0}
        >
          Exporter CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 w-full overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="text-blueMarine text-base font-semibold">
              <th className="py-2 px-4">ID Utilisateur</th>
              <th className="py-2 px-4">Utilisateur</th>
              <th className="py-2 px-4">Rôle</th>
              <th className="py-2 px-4">Action</th>
              <th className="py-2 px-4">Catégorie</th>
              <th className="py-2 px-4">Date/Heure</th>
              <th className="py-2 px-4">Détails</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8">Chargement...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8">Aucun log trouvé.</td></tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={`${log.user_id}-${log.timestamp}-${log.category}`} className="border-t last:border-b hover:bg-gray-50">
                  <td className="py-2 px-4 font-mono text-sm">{log.user_id || '-'}</td>
                  <td className="py-2 px-4 font-medium">{log.user_name || '-'}</td>
                  <td className="py-2 px-4">{log.user_role || '-'}</td>
                  <td className="py-2 px-4">{ACTION_FR[log.action] || log.action}</td>
                  <td className="py-2 px-4">{CATEGORY_FR[log.category] || log.category}</td>
                  <td className="py-2 px-4">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
                  <td className="py-2 px-4 max-w-md truncate" title={log.details}>{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimulationLogsPage; 