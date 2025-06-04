import React, { useEffect, useState, useCallback } from 'react';
import { Package } from 'lucide-react';
import { insertSimulationLog } from '../../lib/api';
import DashboardCard from '../ui/DashboardCard';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const LOCAL_STORAGE_KEY = 'simulation_conteneurs';
const DEBOUNCE_DELAY = 300; // 300ms debounce delay

const ConteneursCard = () => {
  const [present, setPresent] = useState(0);
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
        setPresent(142);
        setTotal(200);
      } else {
        try {
          // Mode réel : données Supabase
          const { data: containers, error } = await supabase
            .from('containers')
            .select('*');

          if (error) throw error;

          if (containers) {
            const total = containers.length;
            const present = containers.filter(container => 
              container.status === 'livré' || container.status === 'delivered'
            ).length;
            
            setPresent(present);
            setTotal(total);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des conteneurs:', error);
        }
      }
    }
    fetchData();
  }, [simulation]);

  const percent = total ? Math.round((present / total) * 100) : 0;
  const badge = { 
    label: `${percent}% livré`, 
    color: percent > 80 ? '#22C55E' : '#F97316' 
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
        category: 'conteneurs',
        timestamp: new Date().toISOString(),
        details: `${user.role} ${user.first_name || user.full_name || user.email} a ${newValue ? 'activé' : 'désactivé'} le mode simulation pour les conteneurs.`
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
      icon={<Package />}
      title="Conteneurs"
      value={`${present}/${total} Conteneurs`}
      percent={percent}
      badge={badge}
      barColor="#F97316"
      simulation={simulation}
      onToggleSimulation={handleToggleSimulation}
    />
  );
};

export default ConteneursCard; 