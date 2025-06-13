import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';
import { generateResponse, SYSTEM_PROMPT, ChatMessage } from './ollama';

const API_URL = 'http://localhost:3001';

// --- Containers ---
export const fetchContainers = async () => {
  const res = await fetch(`${API_URL}/containers`);
  if (!res.ok) throw new Error('Failed to fetch containers');
  return res.json();
};
export const fetchContainerById = async (id: string | number) => {
  const res = await fetch(`${API_URL}/containers/${id}`);
  if (!res.ok) throw new Error('Failed to fetch container');
  return res.json();
};
export const createContainer = async (data: any) => {
  const res = await fetch(`${API_URL}/containers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create container');
  return res.json();
};
export const updateContainer = async (id: string | number, data: any) => {
  const res = await fetch(`${API_URL}/containers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update container');
  return res.json();
};
export const deleteContainer = async (id: string | number) => {
  const res = await fetch(`${API_URL}/containers/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete container');
  return res.json();
};

// --- Equipment ---
export const fetchEquipment = async () => {
  const res = await fetch(`${API_URL}/equipment`);
  if (!res.ok) throw new Error('Failed to fetch equipment');
  return res.json();
};
export const fetchEquipmentById = async (id: string | number) => {
  const res = await fetch(`${API_URL}/equipment/${id}`);
  if (!res.ok) throw new Error('Failed to fetch equipment');
  return res.json();
};
export const createEquipment = async (data: any) => {
  const res = await fetch(`${API_URL}/equipment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create equipment');
  return res.json();
};
export const updateEquipment = async (id: string | number, data: any) => {
  const res = await fetch(`${API_URL}/equipment/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update equipment');
  return res.json();
};
export const deleteEquipment = async (id: string | number) => {
  const res = await fetch(`${API_URL}/equipment/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete equipment');
  return res.json();
};

// --- Port Status ---
export const fetchPortStatus = async () => {
  const res = await fetch(`${API_URL}/port_status`);
  if (!res.ok) throw new Error('Failed to fetch port status');
  return res.json();
};

// --- Resource Usage ---
export const fetchResourceUsage = async () => {
  const res = await fetch(`${API_URL}/resource_usage`);
  if (!res.ok) throw new Error('Failed to fetch resource usage');
  return res.json();
};

// --- Team Assignments ---
export const fetchTeamAssignments = async () => {
  const res = await fetch(`${API_URL}/team_assignments`);
  if (!res.ok) throw new Error('Failed to fetch team assignments');
  return res.json();
};

// --- Users ---
export const fetchUsers = async () => {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};
export const fetchUserById = async (id: string | number) => {
  const res = await fetch(`${API_URL}/users/${id}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
};
export const createUser = async (data: any) => {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
};
export const updateUser = async (id: string | number, data: any) => {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
};
export const deleteUser = async (id: string | number) => {
  const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
};

// --- Vessels ---
export const fetchVessels = async () => {
  const res = await fetch(`${API_URL}/vessels`);
  if (!res.ok) throw new Error('Failed to fetch vessels');
  return res.json();
};
export const fetchVesselById = async (id: string | number) => {
  const res = await fetch(`${API_URL}/vessels/${id}`);
  if (!res.ok) throw new Error('Failed to fetch vessel');
  return res.json();
};
export const createVessel = async (data: any) => {
  const res = await fetch(`${API_URL}/vessels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create vessel');
  return res.json();
};
export const updateVessel = async (id: string | number, data: any) => {
  const res = await fetch(`${API_URL}/vessels/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update vessel');
  return res.json();
};
export const deleteVessel = async (id: string | number) => {
  const res = await fetch(`${API_URL}/vessels/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete vessel');
  return res.json();
};

// Fetch vessel stats (total and occupied berths)
export async function fetchVesselStats() {
  const res = await fetch(`${API_URL}/vessels/stats`);
  if (!res.ok) throw new Error('Failed to fetch vessel stats');
  return await res.json();
}

// Fetch equipment stats (total and active cranes)
export async function fetchEquipmentStats() {
  const res = await fetch(`${API_URL}/equipment/stats`);
  if (!res.ok) throw new Error('Failed to fetch equipment stats');
  return await res.json();
}

// Fetch container stats (total and waiting)
export async function fetchContainerStats() {
  const res = await fetch(`${API_URL}/containers/stats`);
  if (!res.ok) throw new Error('Failed to fetch container stats');
  return await res.json();
}

// Fetch customs status (open/closed)
export async function fetchCustomsStatus() {
  const res = await fetch(`${API_URL}/equipment/customs-status`);
  if (!res.ok) throw new Error('Failed to fetch customs status');
  return await res.json();
}

// Fetch live weather
export const fetchLiveWeather = async () => {
  const res = await fetch(`${API_URL}/weather/current`);
  if (!res.ok) throw new Error('Failed to fetch live weather');
  return res.json();
}

// --- Active Team ---
export const fetchActiveTeam = async () => {
  const res = await fetch(`${API_URL}/team/active`);
  if (!res.ok) throw new Error('Failed to fetch active team');
  return res.json();
};

// --- Simulation Logs ---
export const insertSimulationLog = async (log: SimulationLog) => {
  const { data, error } = await supabase
    .from('simulation_logs')
    .insert([log])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchSimulationLogs = async () => {
  const { data, error } = await supabase
    .from('simulation_logs')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data;
};

export interface SimulationLog {
  user_id: string;
  user_name: string;
  user_role: string;
  action: 'SIMULATION_ENABLED' | 'SIMULATION_DISABLED';
  category: 'navires' | 'grues' | 'conteneurs' | 'douane';
  timestamp: string;
  details: string;
} 

const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const handleChatRequest = async (
  message: string,
  context: any = {}
): Promise<string> => {
  try {
    // Prepare messages with system prompt
    const messages: ChatMessage[] = [
      { role: 'assistant', content: SYSTEM_PROMPT },
      { role: 'user', content: message }
    ];

    // Add context from Supabase if available
    if (context.containerId) {
      const { data: container } = await supabaseClient
        .from('containers')
        .select('*')
        .eq('id', context.containerId)
        .single();

      if (container) {
        messages.push({
          role: 'assistant',
          content: `Current container status: ${JSON.stringify(container)}`
        });
      }
    }

    // Generate response using Ollama
    const response = await generateResponse(messages);

    // Handle any UI updates or data modifications based on the response
    if (response.includes('update_status')) {
      // Extract status update from response
      const statusMatch = response.match(/update_status:(\w+)/);
      if (statusMatch && context.containerId) {
        await supabaseClient
          .from('containers')
          .update({ status: statusMatch[1] })
          .eq('id', context.containerId);
      }
    }

    return response;
  } catch (error) {
    console.error('Error handling chat request:', error);
    throw new Error('Failed to process chat request');
  }
}; 