-- 1. Insert Users (do it first, so FK on user_id won't fail)
INSERT INTO public.users (id, email, full_name, avatar_url, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@portflow.com', 'Admin User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'supervisor@portflow.com', 'John Smith', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', 'supervisor'),
  ('00000000-0000-0000-0000-000000000003', 'logistics@portflow.com', 'Sarah Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 'logistics_agent'),
  ('00000000-0000-0000-0000-000000000004', 'customs@portflow.com', 'Mike Brown', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', 'customs_agent'),
  ('00000000-0000-0000-0000-000000000005', 'crane@portflow.com', 'Alex Wilson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 'crane_operator'),
  ('00000000-0000-0000-0000-000000000006', 'security@portflow.com', 'Emma Davis', 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', 'security')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Equipment (assume zone_id exists)
INSERT INTO public.equipment (name, type, equipment_code, zone_id, status, load_percentage, metric_value, metric_name, metric_unit, battery_level) VALUES
  ('RTG-001', 'crane', 'CRN001', 1, 'active', 75, '85', 'utilization', '%', 92),
  ('RTG-002', 'crane', 'CRN002', 1, 'active', 60, '78', 'utilization', '%', 88),
  ('STS-001', 'crane', 'CRN003', 2, 'maintenance', 0, '0', 'utilization', '%', 45),
  ('STS-002', 'crane', 'CRN004', 2, 'active', 85, '92', 'utilization', '%', 95),
  ('TRC-001', 'tractor', 'TRC001', 3, 'active', 40, '65', 'fuel_level', '%', 85),
  ('TRC-002', 'tractor', 'TRC002', 3, 'inactive', 0, '30', 'fuel_level', '%', 20),
  ('TRC-003', 'tractor', 'TRC003', 4, 'active', 55, '80', 'fuel_level', '%', 90),
  ('SNS-001', 'sensor', 'SNS001', 1, 'active', null, '23.5', 'temperature', '°C', 95),
  ('SNS-002', 'sensor', 'SNS002', 2, 'active', null, '24.2', 'temperature', '°C', 92),
  ('SNS-003', 'sensor', 'SNS003', 3, 'active', null, '22.8', 'temperature', '°C', 88)
ON CONFLICT (equipment_code) DO NOTHING;

-- 3. Insert Port Status
INSERT INTO public.port_status (temperature, weather, traffic_level, sea_condition, next_high_tide) VALUES
  (23.5, 'sunny', 'medium', 'calm', now() + interval '4 hours'),
  (22.8, 'cloudy', 'high', 'moderate', now() + interval '16 hours'),
  (24.2, 'sunny', 'low', 'calm', now() + interval '28 hours')
ON CONFLICT DO NOTHING;

-- 4. Insert Customs Status
INSERT INTO public.customs_status (status, opening_time, closing_time, effective_date, notes) VALUES
  ('open', '08:00:00', '18:00:00', current_date, 'Regular business hours'),
  ('closed', '00:00:00', '00:00:00', current_date + 1, 'Weekend closure'),
  ('restricted', '10:00:00', '16:00:00', current_date + 2, 'Holiday hours')
ON CONFLICT DO NOTHING;

-- 5. Insert Team Assignments (references users.id, so after users insertion)
INSERT INTO public.team_assignments (user_id, zone_id, status, start_time) VALUES
  ('00000000-0000-0000-0000-000000000002', 1, 'online', now()),
  ('00000000-0000-0000-0000-000000000003', 2, 'busy', now()),
  ('00000000-0000-0000-0000-000000000004', 3, 'online', now()),
  ('00000000-0000-0000-0000-000000000005', 1, 'away', now()),
  ('00000000-0000-0000-0000-000000000006', 4, 'online', now())
ON CONFLICT DO NOTHING;

-- 6. Insert Resource Usage
INSERT INTO public.resource_usage (resource_type, usage_percentage, recorded_at) VALUES
  ('crane', 75, now() - interval '1 hour'),
  ('crane', 82, now() - interval '2 hours'),
  ('crane', 68, now() - interval '3 hours'),
  ('tractor', 45, now() - interval '1 hour'),
  ('tractor', 52, now() - interval '2 hours'),
  ('tractor', 38, now() - interval '3 hours'),
  ('electricity', 65, now() - interval '1 hour'),
  ('electricity', 72, now() - interval '2 hours'),
  ('electricity', 58, now() - interval '3 hours'),
  ('fuel', 85, now() - interval '1 hour'),
  ('fuel', 78, now() - interval '2 hours'),
  ('fuel', 82, now() - interval '3 hours'),
  ('water', 30, now() - interval '1 hour'),
  ('water', 35, now() - interval '2 hours'),
  ('water', 28, now() - interval '3 hours')
ON CONFLICT DO NOTHING;

-- 7. Insert Vessels (assuming berth_id exists)
INSERT INTO public.vessels (name, imo_number, vessel_type, status, eta, etd, berth_id, capacity_teu, length_overall) VALUES
  ('MSC Fantasia', 'IMO1234567', 'container_ship', 'at_berth', now() - interval '2 days', now() + interval '3 days', 1, 8000, 350),
  ('CMA CGM Marco Polo', 'IMO7654321', 'container_ship', 'approaching', now() + interval '1 day', null, null, 6000, 320),
  ('Maersk Sealand', 'IMO9876543', 'container_ship', 'departing', now() - interval '5 days', now() + interval '1 day', 2, 7000, 330),
  ('Hapag-Lloyd Express', 'IMO4567890', 'container_ship', 'departed', now() - interval '7 days', now() - interval '1 day', null, 5500, 300)
ON CONFLICT (imo_number) DO NOTHING;

-- 8. Insert Containers (assume vessel_id and zone_id exist)
INSERT INTO public.containers (container_number, iso_code, size, type, status, zone_id, vessel_id, customs_cleared, arrival_date, departure_date) VALUES
  ('MSCU1234567', 'MSCU', '40ft', 'dry', 'in_storage', 3, 1, true, now() - interval '2 days', now() + interval '5 days'),
  ('MAEU7654321', 'MAEU', '20ft', 'reefer', 'import_waiting', 4, 2, false, now() - interval '1 day', null),
  ('CMAU9876543', 'CMAU', '45ft', 'open_top', 'export_waiting', 3, 3, true, now() - interval '3 days', now() + interval '2 days'),
  ('HLXU4567890', 'HLXU', '40ft', 'flat_rack', 'in_transit', 2, 4, false, now() - interval '4 days', now() + interval '1 day')
ON CONFLICT (container_number) DO NOTHING;
