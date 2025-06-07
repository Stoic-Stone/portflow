import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Ship, Package, Settings } from 'lucide-react';
import DashboardCard from '../../components/ui/DashboardCard';
import WelcomeBlock from '../../components/dashboard/WelcomeBlock';
import NaviresCard from '../../components/dashboard/NaviresCard';
import GruesCard from '../../components/dashboard/GruesCard';
import ConteneursCard from '../../components/dashboard/ConteneursCard';
import ContainersTable from '../../components/ContainersTable.jsx';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';

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
  const [simulationActive, setSimulationActive] = useState(false);

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
    <div className="flex flex-col gap-6 p-6">
      {/* Welcome and summary */}
      <WelcomeBlock />

      {/* Simulation Alert Banner (show only if simulation is active) */}
      {simulationActive && (
        <Alert variant="default" className="mb-4">
          <AlertTitle>Mode Simulation Actif</AlertTitle>
          <AlertDescription>
            Certaines données affichées sont simulées pour des tests/logistique. Désactivez le mode simulation pour revenir aux données réelles.
          </AlertDescription>
        </Alert>
      )}

      {/* Main status cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <NaviresCard />
        <GruesCard />
        <ConteneursCard />
      </div>

      {/* Occupation rate graph (DonutChart) - Uncomment if component exists */}
      {/*
      <div className="my-6">
        <DonutChart data={...} />
      </div>
      */}

      {/* Filterable containers list */}
      <div className="my-6">
        <h2 className="text-xl font-semibold mb-2">Liste des conteneurs</h2>
        <ContainersTable />
      </div>

      {/* Movement history/timeline - Uncomment if component exists */}
      {/*
      <div className="my-6">
        <h2 className="text-xl font-semibold mb-2">Historique des mouvements</h2>
        <Timeline data={...} />
      </div>
      */}
    </div>
  );
};

export default LogisticsDashboard; 