import React, { useEffect, useState } from 'react';
import WelcomeBlock from '../components/dashboard/WelcomeBlock';
import TerminalStatusBlock from '../components/dashboard/TerminalStatusBlock';
import MetricVisualization from '../components/dashboard/MetricVisualization';
import PortEquipmentBlock from '../components/dashboard/PortEquipmentBlock';
import TeamMembersBlock from '../components/dashboard/TeamMembersBlock';
import ResourcesEnergyBlock from '../components/dashboard/ResourcesEnergyBlock';
import NaviresCard from '../components/dashboard/NaviresCard';
import GruesCard from '../components/dashboard/GruesCard';
import ConteneursCard from '../components/dashboard/ConteneursCard';
// import DouaneCard from '../components/dashboard/DouaneCard';
// import SecurityCard from '../components/dashboard/SecurityCard';

const DashboardPage = () => {
  // TODO: Replace with real data from API
  // const activeSecurityCount = 2;
  // const lastIncident = 'Incident signalé: colis suspect';

  const [search, setSearch] = useState('');

  useEffect(() => {
    const handler = (e: any) => {
      if (e && e.detail !== undefined) setSearch(e.detail);
    };
    window.addEventListener('global-search', handler);
    return () => window.removeEventListener('global-search', handler);
  }, []);

  // Cards à afficher selon la recherche
  const cards = [
    { key: 'navires', label: 'Navires', component: <NaviresCard /> },
    { key: 'equipement', label: 'Équipement actif', component: <GruesCard /> },
    { key: 'conteneurs', label: 'Conteneurs', component: <ConteneursCard /> },
  ];
  const filteredCards = search
    ? cards.filter(card => card.label.toLowerCase().includes(search.toLowerCase()))
    : cards;

  return (
    <div className="flex flex-col gap-2 md:gap-3 lg:gap-4 px-1 md:px-2 lg:px-4">
      {/* Ligne 1 : WelcomeBlock + MetricVisualization côte à côte */}
      <div className="flex flex-col lg:flex-row gap-2 w-full mb-2 items-stretch">
        <div className="flex-1 min-w-0">
          <WelcomeBlock />
        </div>
        <div className="w-full lg:w-[260px] flex-shrink-0 flex items-center justify-center">
          <div className="w-full">
            <MetricVisualization />
          </div>
        </div>
      </div>
      {/* Terminal Status Block */}
      <div className="w-full mb-2">
        <div className="flex flex-row flex-wrap items-start justify-start gap-2">
          {filteredCards.length > 0 ? (
            filteredCards.map(card => <React.Fragment key={card.key}>{card.component}</React.Fragment>)
          ) : (
            <div className="text-gray-500 p-8 w-full text-center">Aucune card ne correspond à la recherche.</div>
          )}
        </div>
      </div>
      {/* Port Equipment Block */}
      <div className="w-full mb-2">
        <PortEquipmentBlock />
      </div>
      {/* Team Members Block */}
      <div className="w-full mb-2">
        <TeamMembersBlock />
      </div>
      {/* Resources & Energy Block */}
      <div className="w-full">
        <ResourcesEnergyBlock />
      </div>
    </div>
  );
};

export default DashboardPage;