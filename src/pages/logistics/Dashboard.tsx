import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Container {
  id: string;
  container_number: string;
  status: 'in_transit' | 'at_port' | 'loading' | 'unloading' | 'departed';
  location: string;
  ship_id: string | null;
  cargo_type: string;
  weight: number;
  destination: string;
  estimated_arrival: string;
}

interface Ship {
  id: string;
  name: string;
  status: string;
}

export default function LogisticsDashboard() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Container['status'] | 'all'>('all');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchContainersAndShips();
  }, []);

  const fetchContainersAndShips = async () => {
    try {
      // Fetch containers
      const { data: containersData, error: containersError } = await supabase
        .from('containers')
        .select('*')
        .order('estimated_arrival', { ascending: true });

      if (containersError) throw containersError;

      // Fetch ships
      const { data: shipsData, error: shipsError } = await supabase
        .from('ships')
        .select('id, name, status');

      if (shipsError) throw shipsError;

      setContainers(containersData || []);
      setShips(shipsData || []);
    } catch (error: any) {
      toast.error('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContainerStatusUpdate = async (containerId: string, newStatus: Container['status']) => {
    try {
      const { error } = await supabase
        .from('containers')
        .update({ status: newStatus })
        .eq('id', containerId);

      if (error) throw error;

      setContainers(containers.map(container =>
        container.id === containerId ? { ...container, status: newStatus } : container
      ));
      toast.success('Container status updated successfully');
    } catch (error: any) {
      toast.error('Error updating container status: ' + error.message);
    }
  };

  const handleShipAssignment = async (containerId: string, shipId: string | null) => {
    try {
      const { error } = await supabase
        .from('containers')
        .update({ ship_id: shipId })
        .eq('id', containerId);

      if (error) throw error;

      setContainers(containers.map(container =>
        container.id === containerId ? { ...container, ship_id: shipId } : container
      ));
      toast.success('Ship assignment updated successfully');
    } catch (error: any) {
      toast.error('Error updating ship assignment: ' + error.message);
    }
  };

  const filteredContainers = filter === 'all'
    ? containers
    : containers.filter(container => container.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Logistics Dashboard</h1>

          {/* Display user info at the top of the dashboard */}
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-blue-900 text-white w-12 h-12 flex items-center justify-center text-xl font-bold">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div>
              <div className="font-semibold text-lg text-blue-900">{user?.first_name} {user?.last_name}</div>
              <div className="text-gray-500 text-sm">{user?.role === 'logistics' ? 'Logistics' : user?.role}</div>
            </div>
            <button
              className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              onClick={() => { logout(); navigate('/login'); }}
            >
              Déconnexion
            </button>
          </div>

          {/* Container Management Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Container Management</h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as Container['status'] | 'all')}
                className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Containers</option>
                <option value="in_transit">In Transit</option>
                <option value="at_port">At Port</option>
                <option value="loading">Loading</option>
                <option value="unloading">Unloading</option>
                <option value="departed">Departed</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Container Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ship Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cargo Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContainers.map((container) => (
                    <tr key={container.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {container.container_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={container.status}
                          onChange={(e) => handleContainerStatusUpdate(container.id, e.target.value as Container['status'])}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="in_transit">In Transit</option>
                          <option value="at_port">At Port</option>
                          <option value="loading">Loading</option>
                          <option value="unloading">Unloading</option>
                          <option value="departed">Departed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{container.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={container.ship_id || ''}
                          onChange={(e) => handleShipAssignment(container.id, e.target.value || null)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="">No Ship Assigned</option>
                          {ships.map((ship) => (
                            <option key={ship.id} value={ship.id}>
                              {ship.name} ({ship.status})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          <div>Type: {container.cargo_type}</div>
                          <div>Weight: {container.weight} tons</div>
                          <div>Destination: {container.destination}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {/* Implement container details view */}}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => {/* Implement container tracking */}}
                          className="text-green-600 hover:text-green-900"
                        >
                          Track
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button
                onClick={() => {/* Implement new container registration */}}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Register New Container
              </button>
              <button
                onClick={() => {/* Implement cargo manifest generation */}}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Generate Cargo Manifest
              </button>
              <button
                onClick={() => {/* Implement dispatch communication */}}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Contact Dispatch
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 