import React from 'react';
import { Ship, Plane as Crane, Package } from 'lucide-react';

const TerminalStatusBlock = () => {
  // Status Card Component
  const StatusCard = ({ 
    icon, 
    title, 
    current, 
    total, 
    status, 
    color 
  }: { 
    icon: React.ReactNode, 
    title: string, 
    current: number, 
    total: number, 
    status: string,
    color: string
  }) => {
    const percentage = (current / total) * 100;
    
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
              {icon}
            </div>
            <h3 className="font-medium">{title}</h3>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === 'Actif' ? 'bg-green-100 text-green-700' : 
            status === 'Occupé' ? 'bg-orange-100 text-orange-700' : 
            'bg-red-100 text-red-700'
          }`}>
            {status}
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">{current}/{total} {title}</span>
            <span className="text-sm font-medium">{percentage.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-grisClair rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                percentage < 50 ? 'bg-green-500' : 
                percentage < 80 ? 'bg-orange-500' : 
                'bg-red-500'
              }`} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>Mode Simulation</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blueMarine"></div>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatusCard 
        icon={<Ship size={20} className="text-white" />} 
        title="Navires" 
        current={3} 
        total={5} 
        status="Occupé"
        color="bg-blueMarine"
      />
      <StatusCard 
        icon={<Crane size={20} className="text-white" />} 
        title="Grues" 
        current={6} 
        total={8} 
        status="Actif"
        color="bg-orangeMorocain"
      />
      <StatusCard 
        icon={<Package size={20} className="text-white" />} 
        title="Conteneurs" 
        current={142} 
        total={200} 
        status="Attention"
        color="bg-yellow-500"
      />
    </div>
  );
};

export default TerminalStatusBlock;