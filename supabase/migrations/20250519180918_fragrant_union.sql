/*
  # Initial PortFlow Database Schema

  1. New Tables
    - users
      - Custom user data and roles
    - equipment
      - Port equipment tracking
    - vessels
      - Vessel information and status
    - containers
      - Container tracking
    - weather_conditions
      - Current and forecasted conditions
    - metrics
      - Terminal KPIs and measurements
    - team_members
      - Active personnel information
    - resource_usage
      - Energy and resource consumption data

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table extension
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  role text NOT NULL,
  area text,
  status text DEFAULT 'offline',
  access_level text DEFAULT 'standard',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- Equipment table
CREATE TABLE IF NOT EXISTS public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'inactive',
  load integer,
  fuel_level integer,
  battery_level integer,
  sensor_value text,
  zone text NOT NULL,
  last_maintenance timestamptz,
  next_maintenance timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vessels table
CREATE TABLE IF NOT EXISTS public.vessels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text DEFAULT 'approaching',
  berth_number text,
  arrival_time timestamptz,
  departure_time timestamptz,
  cargo_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Containers table
CREATE TABLE IF NOT EXISTS public.containers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  container_number text UNIQUE NOT NULL,
  status text DEFAULT 'in_transit',
  location text,
  vessel_id uuid REFERENCES vessels(id),
  type text,
  weight numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Weather conditions table
CREATE TABLE IF NOT EXISTS public.weather_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  temperature numeric NOT NULL,
  conditions text,
  wind_speed numeric,
  wave_height numeric,
  next_high_tide timestamptz,
  next_low_tide timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Metrics table
CREATE TABLE IF NOT EXISTS public.metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  value numeric NOT NULL,
  unit text,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Resource usage table
CREATE TABLE IF NOT EXISTS public.resource_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  consumption numeric NOT NULL,
  unit text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow authenticated users to read equipment"
  ON public.equipment
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read vessels"
  ON public.vessels
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read containers"
  ON public.containers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read weather"
  ON public.weather_conditions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read metrics"
  ON public.metrics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read resource usage"
  ON public.resource_usage
  FOR SELECT
  TO authenticated
  USING (true);

-- Create functions for real-time updates
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vessels_updated_at
  BEFORE UPDATE ON vessels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_containers_updated_at
  BEFORE UPDATE ON containers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_weather_conditions_updated_at
  BEFORE UPDATE ON weather_conditions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();