import React, { useEffect, useState, useCallback } from 'react';
import { Ship } from 'lucide-react';
import { insertSimulationLog } from '../../lib/api';
import DashboardCard from '../ui/DashboardCard';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const LOCAL_STORAGE_KEY = 'simulation_navires';
const DEBOUNCE_DELAY = 300; // 300ms debounce delay

const NaviresCard = () => {
  const [occupied, setOccupied] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [simulation, setSimulation] = useState(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY) === 'true';
  });
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      if (simulation) {
        // Mode simulation : données fictives
        setOccupied(3);
        setTotal(5);
        setLoading(false);
      } else {
        try {
          // Mode réel : données Supabase (colonnes existantes)
          const { data: vessels, error } = await supabase
            .from('vessels')
            .select('id, name, status, vessel_type, eta, etd, berth_id, capacity_teu, length_overall, created_at, updated_at')
            .order('eta', { ascending: false });

          if (error) throw error;

          if (vessels) {
            const total = vessels.length;
            // Statuts considérés comme "à quai"
            const quaiStatuses = ['at_berth', 'quai', 'docked'];
            const occupied = vessels.filter(vessel => 
              quaiStatuses.includes((vessel.status || '').toLowerCase())
            ).length;
            setOccupied(occupied);
            setTotal(total);
            // Debug
            console.log('Navires récupérés:', vessels);
          }
        } catch (error: any) {
          console.error('Erreur lors de la récupération des navires:', error);
          setError(error?.message || 'Erreur lors de la récupération des données');
        } finally {
          setLoading(false);
        }
      }
    }

    fetchData();

    // Souscription aux changements en temps réel
    const subscription = supabase
      .channel('vessels_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'vessels' 
        }, 
        (payload) => {
          console.log('Changement détecté:', payload);
          fetchData(); // Rafraîchir les données
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [simulation]);

  const percent = total ? Math.round((occupied / total) * 100) : 0;
  const badge = { 
    label: 'Navires à quai', 
    color: percent > 70 ? '#F97316' : '#22C55E' 
  };

  const handleToggleSimulation = useCallback(async () => {
    if (!user?.id || isToggling) {
      console.error('User ID is required for simulation logs or toggle in progress');
      return;
    }

    setIsToggling(true);

    try {
      const newValue = !simulation;
      localStorage.setItem(LOCAL_STORAGE_KEY, String(newValue));
      
      await insertSimulationLog({
        user_id: user.id,
        user_name: user.first_name || user.full_name || user.email,
        user_role: user.role,
        action: newValue ? 'SIMULATION_ENABLED' : 'SIMULATION_DISABLED',
        category: 'navires',
        timestamp: new Date().toISOString(),
        details: `${user.role} ${user.first_name || user.full_name || user.email} a ${newValue ? 'activé' : 'désactivé'} le mode simulation pour les navires.`
      });

      setSimulation(newValue);
    } catch (error) {
      console.error('Error toggling simulation:', error);
    } finally {
      // Add a small delay before allowing next toggle
      setTimeout(() => {
        setIsToggling(false);
      }, DEBOUNCE_DELAY);
    }
  }, [user, simulation, isToggling]);

  if (loading) {
    return (
      <DashboardCard
        icon={<Ship />}
        title="Navires"
        value="Chargement..."
        percent={0}
        badge={{ label: 'Chargement', color: '#64748B' }}
        barColor="#64748B"
        simulation={simulation}
        onToggleSimulation={handleToggleSimulation}
      />
    );
  }

  if (error) {
    return (
      <DashboardCard
        icon={<Ship />}
        title="Navires"
        value={error}
        percent={0}
        badge={{ label: 'Erreur', color: '#EF4444' }}
        barColor="#EF4444"
        simulation={simulation}
        onToggleSimulation={handleToggleSimulation}
      />
    );
  }

  return (
    <DashboardCard
      icon={<Ship />}
      title="Navires"
      value={`${occupied}/${total} Navires`}
      percent={percent}
      badge={badge}
      barColor="#F97316"
      simulation={simulation}
      onToggleSimulation={handleToggleSimulation}
    />
  );
};

export default NaviresCard; 