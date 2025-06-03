import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import WelcomeBlock from '../../components/dashboard/WelcomeBlock';
import TerminalStatusBlock from '../../components/dashboard/TerminalStatusBlock';
import MetricVisualization from '../../components/dashboard/MetricVisualization';
import PortEquipmentBlock from '../../components/dashboard/PortEquipmentBlock';
import TeamMembersBlock from '../../components/dashboard/TeamMembersBlock';
import ResourcesEnergyBlock from '../../components/dashboard/ResourcesEnergyBlock';
import NaviresCard from '../../components/dashboard/NaviresCard';
import GruesCard from '../../components/dashboard/GruesCard';
import ConteneursCard from '../../components/dashboard/ConteneursCard';
import { Ship, Users, AlertCircle } from 'lucide-react';

interface Vessel {
  id: string;
  name: string;
  status: string;
  berth_id: number;
  eta: string;
  etd: string;
}

interface TeamMember {
  id: string;
  full_name: string;
  role: string;
  status: string;
  zone_id: number;
}

const SupervisorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch vessels
      const { data: vesselsData, error: vesselsError } = await supabase
        .from('vessels')
        .select('*')
        .order('eta', { ascending: true });

      if (vesselsError) throw vesselsError;

      // Fetch team members
      const { data: teamData, error: teamError } = await supabase
        .from('users')
        .select('*')
        .in('role', ['logistics_agent', 'crane_operator', 'customs_agent', 'security']);

      if (teamError) throw teamError;

      setVessels(vesselsData || []);
      setTeamMembers(teamData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVesselStatusUpdate = async (vesselId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('vessels')
        .update({ status: newStatus })
        .eq('id', vesselId);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blueMarine"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 md:gap-3 lg:gap-4 px-1 md:px-2 lg:px-4">
      {/* Display user info at the top of the dashboard */}
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-full bg-blue-900 text-white w-12 h-12 flex items-center justify-center text-xl font-bold">
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
        <div>
          <div className="font-semibold text-lg text-blue-900">{user?.first_name} {user?.last_name}</div>
          <div className="text-gray-500 text-sm">{user?.role === 'supervisor' ? 'Superviseur' : user?.role}</div>
        </div>
        <button
          className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          onClick={() => { logout(); navigate('/login'); }}
        >
          Déconnexion
        </button>
      </div>

      {/* Welcome and Metrics */}
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

      {/* Status Cards */}
      <div className="flex flex-row flex-wrap items-start justify-start gap-2 mb-4">
        <NaviresCard />
        <GruesCard />
        <ConteneursCard />
      </div>

      {/* Terminal Status */}
      <div className="w-full mb-4">
        <TerminalStatusBlock />
      </div>

      {/* Team Management Section */}
      <div className="w-full mb-4">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-blueMarine mr-2" />
            <h2 className="text-2xl font-bold text-blueMarine">Gestion de l'équipe</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{member.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.status === 'online' ? 'bg-green-100 text-green-800' : 
                        member.status === 'busy' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">Zone {member.zone_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blueMarine hover:text-blueMarine/80 mr-4">
                        Réassigner
                      </button>
                      <button className="text-red-500 hover:text-red-600">
                        Déconnecter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Vessel Management Section */}
      <div className="w-full mb-4">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center mb-4">
            <Ship className="h-6 w-6 text-blueMarine mr-2" />
            <h2 className="text-2xl font-bold text-blueMarine">Gestion des navires</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Navire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ETA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ETD</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vessels.map((vessel) => (
                  <tr key={vessel.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{vessel.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={vessel.status}
                        onChange={(e) => handleVesselStatusUpdate(vessel.id, e.target.value)}
                        className="text-sm text-gray-900 border-gray-300 rounded-md focus:ring-blueMarine focus:border-blueMarine"
                      >
                        <option value="approaching">En approche</option>
                        <option value="at_berth">À quai</option>
                        <option value="departing">En départ</option>
                        <option value="departed">Parti</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(vessel.eta).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {vessel.etd ? new Date(vessel.etd).toLocaleString() : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {vessel.berth_id ? `Poste ${vessel.berth_id}` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blueMarine hover:text-blueMarine/80 mr-4">
                        Détails
                      </button>
                      <button className="text-blueMarine hover:text-blueMarine/80">
                        Opérations
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Resources & Energy Block */}
      <div className="w-full mb-4">
        <ResourcesEnergyBlock />
      </div>

      {/* Port Equipment Block */}
      <div className="w-full">
        <PortEquipmentBlock />
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 text-red-500 p-4 rounded-lg shadow-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard; 