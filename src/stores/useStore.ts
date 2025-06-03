import { create } from 'zustand';
import {
  fetchEquipment,
  fetchVessels,
  fetchContainers,
  fetchResourceUsage,
  fetchUsers
} from '../lib/api';

interface DashboardStore {
  equipment: any[];
  vessels: any[];
  containers: any[];
  weatherConditions: any;
  metrics: any[];
  resourceUsage: any[];
  teamMembers: any[];
  loading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  equipment: [],
  vessels: [],
  containers: [],
  weatherConditions: null,
  metrics: [],
  resourceUsage: [],
  teamMembers: [],
  loading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      const [equipment, vessels, containers, resourceUsage, teamMembers] = await Promise.all([
        fetchEquipment(),
        fetchVessels(),
        fetchContainers(),
        fetchResourceUsage(),
        fetchUsers()
      ]);
      set({
        equipment: equipment || [],
        vessels: vessels || [],
        containers: containers || [],
        weatherConditions: null,
        resourceUsage: resourceUsage || [],
        teamMembers: teamMembers || [],
        loading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch dashboard data', loading: false });
    }
  },
}));