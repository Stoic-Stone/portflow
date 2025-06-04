import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  percent: number;
  badge: { label: string; color: string };
  barColor?: string;
  simulation?: boolean;
  onToggleSimulation?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  title,
  value,
  percent,
  badge,
  barColor = '#F97316',
  simulation = false,
  onToggleSimulation,
}) => {
  const { user } = useAuth();
  
  // Only show simulation toggle if:
  // 1. User is not a logistics agent
  // 2. onToggleSimulation handler is provided
  // 3. User has a valid role
  // 4. User role is either 'admin' or 'supervisor'
  const showSimulationToggle = 
    user?.role && 
    user.role !== 'logistics_agent' && 
    ['admin', 'supervisor'].includes(user.role) && 
    typeof onToggleSimulation === 'function';

  return (
    <div className="bg-white rounded-2xl shadow p-4 flex-1 min-w-[260px] flex flex-col gap-2 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <span className="text-lg font-semibold text-[#0A2259]">{title}</span>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold`}
          style={{ background: badge.color + '22', color: badge.color }}
        >
          {badge.label}
        </span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-base text-gray-600">{value}</span>
        <span className="text-base font-bold text-[#0A2259]">{percent}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full my-1">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${percent}%`, background: barColor }}
        />
      </div>
      {showSimulationToggle && (
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-600">Mode Simulation</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={simulation}
              onChange={onToggleSimulation}
              disabled={!showSimulationToggle}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blueMarine"></div>
          </label>
        </div>
      )}
    </div>
  );
};

export default DashboardCard; 