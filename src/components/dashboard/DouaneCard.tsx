import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { insertSimulationLog } from '../../lib/api';
import DashboardCard from '../ui/DashboardCard';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const LOCAL_STORAGE_KEY = 'simulation_douane';

const DouaneCard = () => {
  const [open, setOpen] = useState(0);
  const [total, setTotal] = useState(1);
  const [simulation, setSimulation] = useState(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY) === 'true';
  });
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      if (simulation) {
        // Mode simulation : données fictives
        setOpen(1);
        setTotal(1);
      } else {
        try {
          // Mode réel : données Supabase
          const { data: customs, error } = await supabase
            .from('customs')
            .select('*');

          if (error) throw error;

          if (customs) {
            const total = customs.length;
            const open = customs.filter(custom => 
              custom.status === 'ouvert' || custom.status === 'open'
            ).length;
            
            setOpen(open);
            setTotal(total);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données douane:', error);
        }
      }
    }
    fetchData();
  }, [simulation]);

  const percent = total ? Math.round((open / total) * 100) : 0;
  const badge = { 
    label: open === total ? 'Ouvert' : 'Fermé', 
    color: open === total ? '#22C55E' : '#F43F5E' 
  };

  const handleToggleSimulation = async () => {
    setSimulation(s => {
      const newValue = !s;
      localStorage.setItem(LOCAL_STORAGE_KEY, String(newValue));
      insertSimulationLog({
        user_id: user?.id,
        user_name: user?.first_name || user?.full_name || user?.email,
        user_role: user?.role,
        action: newValue ? 'Activation du mode simulation' : 'Désactivation du mode simulation',
        category: 'douane',
        timestamp: new Date().toISOString(),
        details: `${user?.role ? 'Le ' + user.role : 'Un utilisateur'} ${user?.first_name || user?.full_name || user?.email} a ${newValue ? 'activé' : 'désactivé'} le mode simulation pour la douane.`
      });
      return newValue;
    });
  };

  return (
    <DashboardCard
      icon={<Building2 />}
      title="Douane"
      value={`${open}/${total} Douane`}
      percent={percent}
      badge={badge}
      barColor={open === total ? '#22C55E' : '#F43F5E'}
      simulation={simulation}
      onToggleSimulation={handleToggleSimulation}
    />
  );
};

export default DouaneCard; 