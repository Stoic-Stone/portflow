import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { fetchResourceUsage } from '../../lib/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RESOURCE_COLORS: Record<string, string> = {
  crane: '#001F54',
  tractor: '#FF9900',
  electricity: '#4CAF50',
  fuel: '#E53935',
  water: '#2196F3',
};

const RESOURCE_LABELS: Record<string, string> = {
  crane: 'Grues',
  tractor: 'Tracteurs',
  electricity: 'Électricité',
  fuel: 'Carburant',
  water: 'Eau',
};

interface ResourceUsage {
  resource_type: string;
  usage_percentage: number;
  recorded_at: string;
}

const ResourcesEnergyBlock = () => {
  const [resourceUsage, setResourceUsage] = useState<ResourceUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchResourceUsage()
      .then((usage) => {
        setResourceUsage(usage);
      })
      .finally(() => setLoading(false));
  }, []);

  // Helper pour tronquer à l'heure et la minute près
  function formatDateHourMinute(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
  }

  // Grouper les données par date arrondie
  const grouped: Record<string, Record<string, number>> = {};
  resourceUsage.forEach(item => {
    const key = formatDateHourMinute(item.recorded_at);
    if (!grouped[key]) grouped[key] = {};
    grouped[key][item.resource_type] = item.usage_percentage;
  });

  const allDates = Object.keys(grouped).sort();
  const labels = allDates.map(date => date.split(' ')[1]); // juste l'heure:minute

  const resourceTypes = ['crane', 'tractor', 'electricity', 'fuel', 'water'];
  const datasets = resourceTypes.map(type => ({
    label: `Utilisation ${RESOURCE_LABELS[type]} (%)`,
    data: allDates.map(date => grouped[date][type] ?? null),
    borderColor: RESOURCE_COLORS[type],
    backgroundColor: RESOURCE_COLORS[type] + '22',
    fill: true,
    tension: 0.4,
    spanGaps: true,
  }));

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context: any) {
            // Afficher la valeur exacte sur le tooltip
            return `${context.dataset.label}: ${context.parsed.y ?? '-'}%`;
          }
        }
      },
      datalabels: {
        display: true,
        color: '#222',
        align: 'top',
        formatter: function(value: any) {
          return value !== null && value !== undefined ? value.toFixed(1) + '%' : '';
        }
      }
    },
    scales: {
      y: { beginAtZero: true, min: 0, max: 100, grid: { color: 'rgba(0, 0, 0, 0.06)' } },
      x: { grid: { display: false } }
    },
    elements: { point: { radius: 4, hoverRadius: 7 } }
  };

  const handleExport = () => {
    // Prepare CSV header
    const headers = ['Date/Heure', ...resourceTypes.map(type => RESOURCE_LABELS[type])];
    // Prepare rows
    const rows = allDates.map(date => {
      const row = [date];
      resourceTypes.forEach(type => {
        const value = grouped[date][type];
        row.push(value !== undefined && value !== null ? String(value) : '');
      });
      return row;
    });
    // Combine header and rows
    const csvContent = [headers, ...rows]
      .map(e => e.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ressources_energie.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Ressources & Énergie</h2>
          <p className="text-sm text-gray-500">Suivi de la consommation et utilisation</p>
        </div>
      </div>
      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
        <span>Dernière mise à jour: il y a 5 minutes</span>
        <button className="text-blueMarine hover:underline" onClick={handleExport}>Exporter les données</button>
      </div>
    </div>
  );
};

export default ResourcesEnergyBlock;