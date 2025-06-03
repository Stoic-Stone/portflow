import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { fetchContainerStats, fetchVesselStats, fetchEquipment, fetchUsers, fetchContainers } from '../lib/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const STATUS_FR = {
  import_waiting: 'En attente import',
  export_waiting: 'En attente export',
  in_storage: 'En stockage',
  in_transit: 'En transit',
  delivered: 'Livré',
};

const STATUS_COLORS = {
  import_waiting: '#FACC15',
  export_waiting: '#FB923C',
  in_storage: '#3B82F6',
  in_transit: '#A21CAF',
  delivered: '#22C55E',
};

const StatistiquesPage = () => {
  const [loading, setLoading] = useState(true);
  const [containerStats, setContainerStats] = useState({ total: 0, waiting: 0 });
  const [vesselStats, setVesselStats] = useState({ total: 0, occupied: 0 });
  const [equipmentStats, setEquipmentStats] = useState({ total: 0, active: 0 });
  const [userStats, setUserStats] = useState({ total: 0, active: 0 });
  const [containerStatusCounts, setContainerStatusCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const [c, v, equipmentList, users, containers] = await Promise.all([
          fetchContainerStats(),
          fetchVesselStats(),
          fetchEquipment(),
          fetchUsers(),
          fetchContainers(),
        ]);
        setContainerStats({ total: c.total ?? 0, waiting: c.waiting ?? 0 });
        setVesselStats({ total: v.total ?? 0, occupied: v.occupied ?? 0 });
        const totalEquip = Array.isArray(equipmentList) ? equipmentList.length : 0;
        const activeEquip = Array.isArray(equipmentList) ? equipmentList.filter(eq => eq.status === 'active').length : 0;
        setEquipmentStats({ total: totalEquip, active: activeEquip });
        const activeUsers = Array.isArray(users) ? users.filter(user => user.role).length : 0;
        setUserStats({ 
          total: Array.isArray(users) ? users.length : 0,
          active: activeUsers
        });
        // Count containers by status
        if (Array.isArray(containers)) {
          const counts = {};
          containers.forEach(c => {
            counts[c.status] = (counts[c.status] || 0) + 1;
          });
          setContainerStatusCounts(counts);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // CSV export function
  function handleExportCSV() {
    const rows = [
      ['Ressource', 'Total', 'Actifs/En attente/À quai'],
      ['Conteneurs', containerStats.total, containerStats.waiting],
      ['Navires', vesselStats.total, vesselStats.occupied],
      ['Équipements', equipmentStats.total, equipmentStats.active],
      ['Utilisateurs', userStats.total, userStats.active],
      [],
      ['Statut Conteneur', 'Nombre'],
      ...Object.keys(STATUS_FR).map(k => [STATUS_FR[k], containerStatusCounts[k] || 0]),
    ];
    const csvContent = rows.map(e => e.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'statistiques_port.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Chart data
  const chartData = {
    labels: ['Conteneurs', 'Navires', 'Équipements', 'Utilisateurs'],
    datasets: [
      {
        label: 'Total',
        data: [containerStats.total, vesselStats.total, equipmentStats.total, userStats.total],
        backgroundColor: ['#F97316', '#3B82F6', '#22C55E', '#A21CAF'],
        borderRadius: 8,
        barPercentage: 0.6,
      },
      {
        label: 'Actifs / En attente / À quai',
        data: [containerStats.waiting, vesselStats.occupied, equipmentStats.active, userStats.active],
        backgroundColor: ['#2563EB', '#F59E42', '#16A34A', '#9333EA'],
        borderRadius: 8,
        barPercentage: 0.6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { font: { size: 14 } },
      },
      title: {
        display: true,
        text: "Vue d'ensemble des ressources du port",
        font: { size: 18, weight: 'bold' as const },
        color: '#0A2259',
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 14 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { font: { size: 14 } },
      },
    },
    borderRadius: 8,
    barPercentage: 0.6,
  };

  // Pie chart for container status
  const statusKeys = Object.keys(STATUS_FR) as Array<keyof typeof STATUS_FR>;
  const statusLabels = statusKeys.map(k => STATUS_FR[k]);
  const statusData = statusKeys.map(k => containerStatusCounts[k] || 0);
  const statusColors = statusKeys.map(k => STATUS_COLORS[k]);

  const pieData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusData,
        backgroundColor: statusColors,
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { font: { size: 14 } },
      },
      title: {
        display: true,
        text: 'Répartition des statuts des conteneurs',
        font: { size: 16, weight: 'bold' as const },
        color: '#0A2259',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}`;
          }
        }
      }
    },
  };

  return (
    <div className="p-8 w-full min-h-screen bg-sableClair">
      <h1 className="text-4xl font-bold text-blueMarine mb-10">Statistiques du Port</h1>
      <div className="flex justify-end max-w-7xl mx-auto mb-4">
        <button
          className="bg-blueMarine text-white px-5 py-2 rounded shadow hover:bg-blue-900 transition font-semibold"
          onClick={handleExportCSV}
        >
          Exporter les données
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-semibold text-blueMarine mb-2">Conteneurs</span>
          <span className="text-5xl font-bold text-orangeMorocain">{loading ? '...' : containerStats.total}</span>
          <span className="text-gray-500 mt-2">Total</span>
          <span className="text-lg text-blue-700 mt-1">{loading ? '' : `En attente: ${containerStats.waiting}`}</span>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-semibold text-blueMarine mb-2">Navires</span>
          <span className="text-5xl font-bold text-blue-500">{loading ? '...' : vesselStats.total}</span>
          <span className="text-gray-500 mt-2">Total</span>
          <span className="text-lg text-orange-700 mt-1">{loading ? '' : `À quai: ${vesselStats.occupied}`}</span>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-semibold text-blueMarine mb-2">Équipements</span>
          <span className="text-5xl font-bold text-green-600">{loading ? '...' : equipmentStats.total}</span>
          <span className="text-gray-500 mt-2">Total</span>
          <span className="text-lg text-green-700 mt-1">{loading ? '' : `Actifs: ${equipmentStats.active}`}</span>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-semibold text-blueMarine mb-2">Utilisateurs</span>
          <span className="text-5xl font-bold text-purple-600">{loading ? '...' : userStats.total}</span>
          <span className="text-gray-500 mt-2">Total</span>
          <span className="text-lg text-purple-700 mt-1">{loading ? '' : `Actifs: ${userStats.active}`}</span>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-blueMarine mb-6">Visualisations &amp; Graphiques</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 bg-sableClair rounded-xl h-96 flex items-center justify-center">
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div className="flex-1 bg-sableClair rounded-xl h-96 flex items-center justify-center">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatistiquesPage; 