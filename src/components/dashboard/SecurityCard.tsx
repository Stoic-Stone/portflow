import React from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SecurityCardProps {
  activeCount: number;
  lastIncident?: string;
}

const SecurityCard: React.FC<SecurityCardProps> = ({ activeCount, lastIncident }) => (
  <Link to="/securite" className="block bg-white rounded-2xl shadow p-6 hover:shadow-lg transition group">
    <div className="flex items-center gap-3 mb-2">
      <Shield className="text-blueMarine group-hover:text-orangeMorocain transition" size={28} />
      <span className="text-lg font-semibold text-blueMarine group-hover:text-orangeMorocain transition">Sécurité</span>
    </div>
    <div className="text-3xl font-bold text-blueMarine group-hover:text-orangeMorocain transition mb-1">{activeCount} agents actifs</div>
    <div className="text-sm text-gray-500">Dernier incident : {lastIncident || 'Aucun'}</div>
    <div className="mt-2 text-blueMarine underline text-sm group-hover:text-orangeMorocain transition">Voir les détails</div>
  </Link>
);

export default SecurityCard; 