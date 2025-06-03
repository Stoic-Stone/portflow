import React, { useState, useEffect } from 'react';
import { Plane as Crane, Truck, Wifi, Filter } from 'lucide-react';
import { fetchEquipment } from '../../lib/api';

// Map real equipment types to frontend categories
const mapType = (type: string) => {
  if (type === 'Rubber Tyred Gantry' || type === 'Ship-to-Shore Crane') return 'crane';
  if (type === 'Tractor') return 'tractor';
  if (type === 'Sensor') return 'sensor';
  return type;
};

const PortEquipmentBlock = () => {
  const [equipment, setEquipment] = useState([]);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipment()
      .then(setEquipment)
      .finally(() => setLoading(false));
  }, []);
  
  const filteredEquipment = filterType 
    ? equipment.filter((item: any) => mapType(item.type) === filterType) 
    : equipment;

  if (loading) return <div>Chargement...</div>;
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Équipements Portuaires</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilterType(null)} 
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              filterType === null ? 'bg-blueMarine text-white' : 'bg-grisClair text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tous
          </button>
          <button 
            onClick={() => setFilterType('crane')} 
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              filterType === 'crane' ? 'bg-blueMarine text-white' : 'bg-grisClair text-gray-700 hover:bg-gray-300'
            }`}
          >
            Grues
          </button>
          <button 
            onClick={() => setFilterType('tractor')} 
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              filterType === 'tractor' ? 'bg-blueMarine text-white' : 'bg-grisClair text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tracteurs
          </button>
          <button 
            onClick={() => setFilterType('sensor')} 
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              filterType === 'sensor' ? 'bg-blueMarine text-white' : 'bg-grisClair text-gray-700 hover:bg-gray-300'
            }`}
          >
            Capteurs
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredEquipment.map((equipment: any) => (
          <EquipmentCard key={equipment.id} equipment={equipment} />
        ))}
      </div>
    </div>
  );
};

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: string;
  load?: number;
  fuel_level?: number;
  battery_level?: number;
  sensor_value?: string;
  zone: string;
}

const EquipmentCard = ({ equipment }: { equipment: Equipment }) => {
  const getIcon = () => {
    switch(mapType(equipment.type)) {
      case 'crane': return <Crane size={24} />;
      case 'tractor': return <Truck size={24} />;
      case 'sensor': return <Wifi size={24} />;
      default: return <Crane size={24} />;
    }
  };
  const getStatusColor = () => {
    switch(equipment.status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-400';
      case 'maintenance': return 'bg-blue-500';
      case 'warning': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };
  return (
    <div className="bg-white rounded-xl p-4 border border-grisClair transition-shadow hover:shadow-md cursor-pointer">
      <div className="flex justify-between mb-3">
        <div className={`w-8 h-8 ${getStatusColor()} rounded-full flex items-center justify-center text-white`}>
          {getIcon()}
        </div>
        <span className={`h-2 w-2 rounded-full ${getStatusColor()}`}></span>
      </div>
      <h3 className="font-medium text-sm mb-1 truncate">{equipment.name}</h3>
      <p className="text-xs text-gray-500 mb-3">Zone {equipment.zone}</p>
      {equipment.load !== undefined && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Charge</span>
            <span className="font-numeric">{equipment.load}%</span>
          </div>
          <div className="h-1.5 bg-grisClair rounded-full overflow-hidden">
            <div 
              className="h-full bg-blueMarine rounded-full" 
              style={{ width: `${equipment.load}%` }}
            ></div>
          </div>
        </div>
      )}
      {equipment.fuel_level !== undefined && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Carburant</span>
            <span className="font-numeric">{equipment.fuel_level}%</span>
          </div>
          <div className="h-1.5 bg-grisClair rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                equipment.fuel_level > 50 ? 'bg-green-500' : equipment.fuel_level > 20 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${equipment.fuel_level}%` }}
            ></div>
          </div>
        </div>
      )}
      {equipment.battery_level !== undefined && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Batterie</span>
            <span className="font-numeric">{equipment.battery_level}%</span>
          </div>
          <div className="h-1.5 bg-grisClair rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                equipment.battery_level > 50 ? 'bg-green-500' : equipment.battery_level > 20 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${equipment.battery_level}%` }}
            ></div>
          </div>
        </div>
      )}
      {equipment.sensor_value && (
        <div className="mt-2 text-center">
          <span className="font-numeric text-lg font-medium">{equipment.sensor_value}</span>
        </div>
      )}
    </div>
  );
};

export default PortEquipmentBlock;