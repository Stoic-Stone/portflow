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
import { fetchContainerStats, fetchVesselStats, fetchEquipment, fetchUsers, fetchContainers, fetchLiveWeather, fetchPortStatus, updateContainer } from '../lib/api';
import { CloudSun, Clock, Ship, Settings, Package, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ContainersTable from '../components/ContainersTable.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface Vessel {
  id: string;
  name: string;
  eta: string;
  status: string;
}

interface Equipment {
  id: string;
  name: string;
  status: string;
  battery_level?: number;
}

interface ContainerStatus {
  [key: string]: number;
}

const STATUS_FR: Record<string, string> = {
  import_waiting: 'En attente import',
  export_waiting: 'En attente export',
  in_storage: 'En stockage',
  in_transit: 'En transit',
  delivered: 'Livré',
};

const STATUS_COLORS: Record<string, string> = {
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
  const [containerStatusCounts, setContainerStatusCounts] = useState<ContainerStatus>({});
  const [weatherData, setWeatherData] = useState({
    temperature: null as number | null,
    trafficLevel: '',
    nextHighTide: '',
    marineConditions: ''
  });
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [showPending, setShowPending] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [pendingContainers, setPendingContainers] = useState<any[]>([]);
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]);
  const [planSuccess, setPlanSuccess] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const [c, v, equipmentList, users, containers, weather, portStatus] = await Promise.all([
          fetchContainerStats(),
          fetchVesselStats(),
          fetchEquipment(),
          fetchUsers(),
          fetchContainers(),
          fetchLiveWeather(),
          fetchPortStatus()
        ]);

        setContainerStats({ total: c.total ?? 0, waiting: c.waiting ?? 0 });
        setVesselStats({ total: v.total ?? 0, occupied: v.occupied ?? 0 });
        
        const totalEquip = Array.isArray(equipmentList) ? equipmentList.length : 0;
        const activeEquip = Array.isArray(equipmentList) ? equipmentList.filter(eq => eq.status === 'active').length : 0;
        setEquipmentStats({ total: totalEquip, active: activeEquip });
        setEquipment(equipmentList || []);
        
        const activeUsers = Array.isArray(users) ? users.filter(user => user.role).length : 0;
        setUserStats({ 
          total: Array.isArray(users) ? users.length : 0,
          active: activeUsers
        });

        if (Array.isArray(containers)) {
          const counts: ContainerStatus = {};
          containers.forEach(c => {
            if (c.status) {
            counts[c.status] = (counts[c.status] || 0) + 1;
            }
          });
          setContainerStatusCounts(counts);
        }

        // Set weather and port conditions
        if (weather) {
          setWeatherData(prev => ({
            ...prev,
            temperature: weather.temperature,
            marineConditions: weather.weather
          }));
        }

        if (portStatus && portStatus[0]) {
          const tide = portStatus[0].next_high_tide;
          setWeatherData(prev => ({
            ...prev,
            trafficLevel: portStatus[0].traffic_level || '',
            nextHighTide: tide ? new Date(tide).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''
          }));
        }

        // Fetch vessels with details
        const { data: vesselsData } = await supabase
          .from('vessels')
          .select('*')
          .order('eta', { ascending: true });
        setVessels(vesselsData || []);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    if (showPlanModal) {
      // Fetch pending containers when modal opens
      fetchContainers()
        .then(data => {
          const pending = data.filter((c: any) => c.status === 'import_waiting' || c.status === 'export_waiting');
          setPendingContainers(pending);
        });
    }
  }, [showPlanModal]);

  const handleSelectContainer = (id: string) => {
    setSelectedContainers(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handlePlanExit = async () => {
    // Update status of selected containers to 'in_transit'
    await Promise.all(selectedContainers.map(id => updateContainer(id, { status: 'in_transit' })));
    setPlanSuccess(true);
    // Refresh the pending containers list (only 'import_waiting' or 'export_waiting')
    const data = await fetchContainers();
    const pending = data.filter((c: any) => c.status === 'import_waiting' || c.status === 'export_waiting');
    setPendingContainers(pending);
    setSelectedContainers([]);
    setTimeout(() => {
      setPlanSuccess(false);
      setShowPlanModal(false);
    }, 1500);
  };

  // Weather & Port Conditions Header
  const WeatherHeader = () => (
    <div className="bg-gradient-to-r from-[#0A2259] to-[#1E40AF] text-white rounded-2xl p-6 mb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-center gap-3">
          <CloudSun className="w-6 h-6" />
          <div>
            <p className="text-sm opacity-80">Température</p>
            <p className="text-2xl font-bold">{weatherData.temperature}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Ship className="w-6 h-6" />
          <div>
            <p className="text-sm opacity-80">Trafic</p>
            <p className="text-2xl font-bold">{weatherData.trafficLevel}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6" />
          <div>
            <p className="text-sm opacity-80">Prochaine marée haute</p>
            <p className="text-2xl font-bold">{weatherData.nextHighTide}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CloudSun className="w-6 h-6" />
          <div>
            <p className="text-sm opacity-80">Conditions marines</p>
            <p className="text-2xl font-bold">{weatherData.marineConditions}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Key Operational Stats Cards
  const OperationalStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Ship className="w-6 h-6 text-[#0A2259]" />
            <h3 className="text-lg font-semibold text-[#0A2259]">Navires à quai</h3>
          </div>
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800">
            {vesselStats.occupied}/{vesselStats.total}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full mb-4">
          <div 
            className="h-2 bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${(vesselStats.occupied / vesselStats.total) * 100}%` }}
          />
        </div>
        <div className="space-y-2">
          {vessels.slice(0, 3).map((vessel, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{vessel.name}</span>
              <span className="text-[#0A2259] font-medium">
                {new Date(vessel.eta).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {vessels.length > 3 && (
            <div className="text-sm text-gray-500 text-center">
              +{vessels.length - 3} autres navires
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-[#0A2259]" />
            <h3 className="text-lg font-semibold text-[#0A2259]">Équipements actifs</h3>
          </div>
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-green-100 text-green-800">
            {equipmentStats.active}/{equipmentStats.total}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full mb-4">
          <div 
            className="h-2 bg-green-600 rounded-full transition-all duration-500"
            style={{ width: `${(equipmentStats.active / equipmentStats.total) * 100}%` }}
          />
        </div>
        <div className="space-y-3">
          {equipment.slice(0, 3).map((eq, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${eq.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">{eq.name}</span>
              </div>
              {eq.battery_level !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        eq.battery_level > 50 ? 'bg-green-500' : eq.battery_level > 20 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${eq.battery_level}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{eq.battery_level}%</span>
                </div>
              )}
            </div>
          ))}
          {equipment.length > 3 && (
            <div className="text-sm text-gray-500 text-center">
              +{equipment.length - 3} autres équipements
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-[#0A2259]" />
            <h3 className="text-lg font-semibold text-[#0A2259]">Conteneurs</h3>
          </div>
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-orange-100 text-orange-800">
            {containerStats.waiting}/{containerStats.total}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full mb-4">
          <div 
            className="h-2 bg-orange-600 rounded-full transition-all duration-500"
            style={{ width: `${(containerStats.waiting / containerStats.total) * 100}%` }}
          />
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 px-4 py-2 bg-[#0A2259] text-white rounded-lg hover:bg-[#1E40AF] transition"
            onClick={() => setShowPlanModal(true)}
          >
            Planifier sortie
          </button>
          <button
            className="flex-1 px-4 py-2 border border-[#0A2259] text-[#0A2259] rounded-lg hover:bg-[#0A2259] hover:text-white transition"
            onClick={() => setShowPending((v) => !v)}
          >
            Voir en attente
          </button>
        </div>
      </div>
    </div>
  );

  // Smart Recommendations Panel
  const RecommendationsPanel = () => {
    const recommendations = [];
    
    if ((containerStats.waiting / containerStats.total) < 0.3) {
      recommendations.push({
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        message: "Optimiser les opérations de livraison"
      });
    }
    
    if (equipmentStats.active < equipmentStats.total) {
      recommendations.push({
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        message: "Vérifier les équipements inactifs"
      });
    }

    if (recommendations.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-bold text-[#0A2259] mb-3">Recommandations</h3>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl shadow-sm"
            >
              {rec.icon}
              <span className="text-yellow-900 font-medium">{rec.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A2259]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <WeatherHeader />
      <OperationalStats />
      <RecommendationsPanel />
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 min-w-[350px] max-w-[90vw]">
            <h2 className="text-xl font-bold mb-4">Planifier la sortie des conteneurs</h2>
            {planSuccess ? (
              <div className="text-green-600 font-semibold mb-4">Sortie planifiée avec succès !</div>
            ) : (
              <>
                {pendingContainers.length === 0 ? (
                  <div className="mb-4 text-gray-500">Aucun conteneur en attente de sortie.</div>
                ) : (
                  <form onSubmit={e => { e.preventDefault(); handlePlanExit(); }}>
                    <div className="mb-4 max-h-60 overflow-y-auto">
                      {pendingContainers.map(container => (
                        <label key={container.id} className="flex items-center gap-2 py-1">
                          <input
                            type="checkbox"
                            checked={selectedContainers.includes(container.id)}
                            onChange={() => handleSelectContainer(container.id)}
                          />
                          <span className="font-mono text-sm">{container.container_number}</span>
                          <span className="text-xs text-gray-500">({container.status})</span>
                        </label>
                      ))}
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-900 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-800 transition"
                      disabled={selectedContainers.length === 0}
                    >
                      Planifier la sortie
                    </button>
                  </form>
                )}
              </>
            )}
            <div className="flex justify-end mt-6">
              <button onClick={() => setShowPlanModal(false)} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition btn-hover">Fermer</button>
            </div>
          </div>
        </div>
      )}
      {showPending && (
        <div className="my-8">
          <h3 className="text-lg font-bold text-[#0A2259] mb-3">Conteneurs en attente</h3>
          <ContainersTable tableClassName="min-w-[900px]" statusFilter="import_waiting" />
        </div>
      )}
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-[#0A2259] mb-4">Distribution des conteneurs</h3>
          <div className="h-[300px]">
            <Pie
              data={{
                labels: Object.keys(STATUS_FR).map(k => STATUS_FR[k]),
                datasets: [{
                  data: Object.keys(STATUS_FR).map(k => containerStatusCounts[k] || 0),
                  backgroundColor: Object.keys(STATUS_FR).map(k => STATUS_COLORS[k]),
                  borderWidth: 2,
                  borderColor: '#fff'
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      font: {
                        family: 'Inter',
                        size: 12
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-[#0A2259] mb-4">Vue d'ensemble des ressources</h3>
          <div className="h-[300px]">
            <Bar
              data={{
                labels: ['Conteneurs', 'Navires', 'Équipements'],
    datasets: [
      {
        label: 'Total',
                    data: [containerStats.total, vesselStats.total, equipmentStats.total],
                    backgroundColor: '#3B82F6',
                    borderRadius: 8
                  },
                  {
                    label: 'Actifs/En attente',
                    data: [containerStats.waiting, vesselStats.occupied, equipmentStats.active],
                    backgroundColor: '#22C55E',
                    borderRadius: 8
                  }
                ]
              }}
              options={{
    responsive: true,
                maintainAspectRatio: false,
    plugins: {
      legend: {
                    position: 'top',
                    labels: {
                      font: {
                        family: 'Inter',
                        size: 12
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
                    grid: {
                      color: 'rgba(0,0,0,0.06)'
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatistiquesPage; 