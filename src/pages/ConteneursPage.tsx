import React from 'react';
import ContainersTable from '../components/ContainersTable';

const ConteneursPage = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blueMarine">Gestion des Conteneurs</h1>
      </div>
      <div className="bg-white rounded-2xl shadow p-6 w-full max-w-7xl mx-auto overflow-x-auto">
        <ContainersTable tableClassName="min-w-[1200px]" />
      </div>
    </div>
  );
};

export default ConteneursPage; 