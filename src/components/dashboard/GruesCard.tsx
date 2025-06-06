import React, { useEffect, useState, useCallback } from 'react';
import { Plane } from 'lucide-react';
import { insertSimulationLog } from '../../lib/api';
import DashboardCard from '../ui/DashboardCard';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const LOCAL_STORAGE_KEY = 'simulation_grues';
const DEBOUNCE_DELAY = 300; // 300ms debounce delay

const GruesCard = () => {
  const [active, setActive] = useState(0);
  const [total, setTotal] = useState(0);
  const [isToggling, setIsToggling] = useState(false);
  const [simulation, setSimulation] = useState(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY) === 'true';
  });
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      if (simulation) {
        // Mode simulation : données fictives
        setActive(6);
        setTotal(8);
      } else {
        try {
          // Mode réel : données Supabase
          const { data: equipment, error } = await supabase
            .from('equipment')
            .select('*');

          if (error) throw error;

          if (equipment) {
            const total = equipment.length;
            const active = equipment.filter(eq => 
              eq.status === 'actif' || eq.status === 'active'
            ).length;
            
            setActive(active);
            setTotal(total);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des équipements:', error);
        }
      }
    }
    fetchData();
  }, [simulation]);

  const percent = total ? Math.round((active / total) * 100) : 0;
  const badge = { 
    label: 'Actif', 
    color: percent > 50 ? '#22C55E' : '#F97316' 
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
        category: 'grues',
        timestamp: new Date().toISOString(),
        details: `${user.role} ${user.first_name || user.full_name || user.email} a ${newValue ? 'activé' : 'désactivé'} le mode simulation pour les grues.`
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

  return (
    <DashboardCard
      icon={<Plane />}
      title="Équipement actif"
      value={`${active}/${total} Équipements`}
      percent={percent}
      badge={badge}
      barColor="#F97316"
      simulation={simulation}
      onToggleSimulation={handleToggleSimulation}
    />
  );
};

export default GruesCard; 