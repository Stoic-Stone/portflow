import React from 'react';
import { Search, /*Bell,*/ Settings, ChevronDown } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const TopHeader = () => {
  const { sidebarExpanded } = useAppContext();
  const [notificationCount, setNotificationCount] = React.useState(3);
  const { user } = useAuth();
  const [searchValue, setSearchValue] = React.useState("");
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="h-[72px] bg-blancCasse border-b border-grisClair shadow-sm flex items-center justify-between px-6">
      {/* Search */}
      <form className="relative" onSubmit={e => {
        e.preventDefault();
        const value = searchValue.trim().toLowerCase();
        if (value.includes('navire') || value.match(/imo|bateau|ship/)) {
          navigate('/navires');
        } else if (value.includes('conteneur') || value.match(/container|iso/)) {
          navigate('/conteneurs');
        } else if (value.includes('équipement') || value.match(/grue|tractor|capteur|equipment/)) {
          navigate('/equipements');
        }
        window.dispatchEvent(new CustomEvent('global-search', { detail: searchValue }));
      }}>
        <input
          type="text"
          placeholder="Rechercher navires, conteneurs, équipements..."
          className="w-80 h-10 pl-10 pr-4 rounded-lg border border-grisClair focus:outline-none focus:ring-2 focus:ring-blueMarine/20"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
        />
        <button type="submit">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </button>
      </form>

      {/* User Controls */}
      <div className="flex items-center gap-5">
        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blueMarine flex items-center justify-center text-white font-medium">
            {user?.first_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className={`${sidebarExpanded ? 'block' : 'hidden md:block'}`}>
            <p className="font-medium text-sm">{user?.first_name}</p>
            <p className="text-xs text-gray-500">{user?.role === 'supervisor' ? 'Superviseur' : user?.role}</p>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default TopHeader;