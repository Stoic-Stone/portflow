import React from 'react';
import { 
  Home, Ship, Package, Settings, BarChart2, 
  Shield, LogOut, Menu, ChevronsLeft, Users, Globe
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { sidebarExpanded, toggleSidebar } = useAppContext();
  const location = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: 'Accueil', icon: <Home size={22} />, to: '/supervisor/dashboard' },
    { id: 'vessels', label: 'Navires', icon: <Ship size={22} />, to: '/navires' },
    { id: 'containers', label: 'Conteneurs', icon: <Package size={22} />, to: '/conteneurs' },
    { id: 'equipment', label: 'Equipements', icon: <Settings size={22} />, to: '/equipements' },
    { id: 'statistics', label: 'Statistiques', icon: <BarChart2 size={22} />, to: '/statistiques' },
    ...(user?.role !== 'logistics_agent' ? [{ id: 'logs', label: 'Logs Simulation', icon: <BarChart2 size={22} />, to: '/logs-simulation' }] : []),
    ...(user?.role === 'admin' ? [{ id: 'users', label: 'Utilisateurs', icon: <Users size={22} />, to: '/admin/users' }] : []),
  ];

  const getActiveId = () => {
    if (location.pathname === '/landing') return 'landing';
    if (location.pathname.startsWith('/navires')) return 'vessels';
    if (location.pathname === '/') return 'home';
    if (location.pathname.startsWith('/conteneurs')) return 'containers';
    if (location.pathname.startsWith('/equipements')) return 'equipment';
    if (location.pathname.startsWith('/statistiques')) return 'statistics';
    if (location.pathname.startsWith('/logs-simulation')) return 'logs';
    return '';
  };
  const activeItem = getActiveId();

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-blueMarine transition-all duration-300 z-10 
      ${sidebarExpanded ? 'w-60' : 'w-20'}`}
    >
      <div className="flex h-[72px] items-center justify-between px-4 border-b border-white/10">
        {sidebarExpanded ? (
          <>
            <a href="http://localhost:3000" className="text-blancCasse font-bold text-xl no-underline">PortFlow</a>
            <button 
              onClick={toggleSidebar} 
              className="text-blancCasse/70 hover:text-blancCasse transition-colors"
            >
              <ChevronsLeft size={22} />
            </button>
          </>
        ) : (
          <a href="http://localhost:3000" className="text-blancCasse font-bold text-xl no-underline mx-auto block">
            <Menu size={22} />
          </a>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="py-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              {item.to ? (
                <Link to={item.to} className="w-full block">
                  <button
                    className={`sidebar-item w-full ${activeItem === item.id ? 'active text-orangeMorocain bg-white/10' : ''}`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {sidebarExpanded && <span>{item.label}</span>}
                  </button>
                </Link>
              ) : (
                <button
                  className={`sidebar-item w-full`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarExpanded && <span>{item.label}</span>}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout at bottom */}
      <div className="absolute bottom-8 w-full px-4">
        <button className="sidebar-item w-full" onClick={() => { logout(); navigate('/login'); }}>
          <span className="flex-shrink-0"><LogOut size={22} /></span>
          {sidebarExpanded && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;