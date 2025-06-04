import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Ship, Package, Settings } from 'lucide-react';
import DashboardCard from '../../components/ui/DashboardCard';

interface DashboardData {
  vessels: { total: number; occupied: number };
  equipment: { total: number; active: number };
  containers: { total: number; present: number };
}

const LogisticsDashboard = () => {
  const [data, setData] = useState<DashboardData>({
    vessels: { total: 0, occupied: 0 },
    equipment: { total: 0, active: 0 },
    containers: { total: 0, present: 0 }
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch vessels data
      const { data: vessels } = await supabase
        .from('vessels')
        .select('*');

      // Fetch equipment data
      const { data: equipment } = await supabase
        .from('equipment')
        .select('*');

      // Fetch containers data
      const { data: containers } = await supabase
        .from('containers')
        .select('*');

      if (vessels) {
        const total = vessels.length;
        const occupied = vessels.filter(v => 
          ['at_berth', 'quai', 'docked'].includes((v.status || '').toLowerCase())
        ).length;
        setData(prev => ({ ...prev, vessels: { total, occupied } }));
      }

      if (equipment) {
        const total = equipment.length;
        const active = equipment.filter(eq => 
          eq.status === 'actif' || eq.status === 'active'
        ).length;
        setData(prev => ({ ...prev, equipment: { total, active } }));
      }

      if (containers) {
        const total = containers.length;
        const present = containers.filter(c => 
          c.status === 'livré' || c.status === 'delivered'
        ).length;
        setData(prev => ({ ...prev, containers: { total, present } }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const vesselsPercent = data.vessels.total ? Math.round((data.vessels.occupied / data.vessels.total) * 100) : 0;
  const equipmentPercent = data.equipment.total ? Math.round((data.equipment.active / data.equipment.total) * 100) : 0;
  const containersPercent = data.containers.total ? Math.round((data.containers.present / data.containers.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-full bg-blue-900 text-white w-12 h-12 flex items-center justify-center text-xl font-bold">
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
        <div>
          <div className="font-semibold text-lg text-blue-900">
            {user?.first_name} {user?.last_name}
          </div>
          <div className="text-gray-500 text-sm">Agent Logistique</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          icon={<Ship />}
          title="Navires"
          value={`${data.vessels.occupied}/${data.vessels.total} Navires`}
          percent={vesselsPercent}
          badge={{ 
            label: 'Navires à quai', 
            color: vesselsPercent > 70 ? '#F97316' : '#22C55E' 
          }}
          barColor="#F97316"
          simulation={undefined}
          onToggleSimulation={undefined}
        />

        <DashboardCard
          icon={<Settings />}
          title="Équipement actif"
          value={`${data.equipment.active}/${data.equipment.total} Équipements`}
          percent={equipmentPercent}
          badge={{ 
            label: 'Actif', 
            color: equipmentPercent > 50 ? '#22C55E' : '#F97316' 
          }}
          barColor="#F97316"
          simulation={undefined}
          onToggleSimulation={undefined}
        />

        <DashboardCard
          icon={<Package />}
          title="Conteneurs"
          value={`${data.containers.present}/${data.containers.total} Conteneurs`}
          percent={containersPercent}
          badge={{ 
            label: `${containersPercent}% livré`, 
            color: containersPercent > 80 ? '#22C55E' : '#F97316' 
          }}
          barColor="#F97316"
          simulation={undefined}
          onToggleSimulation={undefined}
        />
      </div>

      {/* Add other logistics-specific components here */}
    </div>
  );
};

export default LogisticsDashboard; 