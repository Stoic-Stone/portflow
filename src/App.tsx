import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import NaviresPage from './pages/NaviresPage';
import SimulationLogsPage from './pages/SimulationLogsPage';
import ConteneursPage from './pages/ConteneursPage';
import EquipementsPage from './pages/EquipementsPage';
import StatistiquesPage from './pages/StatistiquesPage';
import { AppProvider } from './context/AppContext';
import { useDashboardStore } from './stores/useStore';
import { supabase } from './lib/supabase';
import { AuthProvider } from './context/AuthContext';
import Login from './components/auth/Login';
import UsersPage from './pages/admin/UsersPage';
import { useAuth } from './context/AuthContext';
import LogisticsDashboard from './pages/logistics/Dashboard';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const fetchDashboardData = useDashboardStore(state => state.fetchDashboardData);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time subscriptions
    const equipmentSubscription = supabase
      .channel('equipment_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment' }, 
        () => fetchDashboardData())
      .subscribe();

    const weatherSubscription = supabase
      .channel('weather_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weather_conditions' },
        () => fetchDashboardData())
      .subscribe();

    const metricsSubscription = supabase
      .channel('metrics_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'metrics' },
        () => fetchDashboardData())
      .subscribe();

    return () => {
      equipmentSubscription.unsubscribe();
      weatherSubscription.unsubscribe();
      metricsSubscription.unsubscribe();
    };
  }, [fetchDashboardData]);

  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="http://localhost:3000" />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/supervisor/dashboard" element={<DashboardPage />} />
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/logistics/dashboard" element={<DashboardPage />} />
              <Route path="/logistics_agent/dashboard" element={<Navigate to="/logistics/dashboard" replace />} />
              <Route path="/navires" element={<NaviresPage />} />
              <Route path="/conteneurs" element={<ConteneursPage />} />
              <Route path="/equipements" element={<EquipementsPage />} />
              <Route path="/statistiques" element={<StatistiquesPage />} />
              <Route path="/logs-simulation" element={<SimulationLogsPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;