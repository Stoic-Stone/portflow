-- Supabase Database Schema for PortFlow Dashboard

-- 1. Users Table
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text not null,
  avatar_url text,
  role text not null check (role in ('admin', 'supervisor', 'logistics_agent', 'customs_agent', 'crane_operator', 'security')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Admin users can view all profiles"
  on public.users for select
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

create policy "Admin users can delete users"
  on public.users for delete
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- 2. Terminal Zones Table
create table if not exists public.zones (
  id serial primary key,
  zone_code text not null unique,
  name text not null,
  type text not null check (type in ('berth', 'storage', 'entry', 'customs', 'maintenance')),
  active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.zones enable row level security;

-- 3. Vessels Table
create table if not exists public.vessels (
  id serial primary key,
  name text not null,
  imo_number text unique not null,
  vessel_type text not null,
  status text not null check (status in ('approaching', 'at_berth', 'departing', 'departed')),
  eta timestamptz,
  etd timestamptz,
  berth_id integer references public.zones(id),
  capacity_teu integer not null,
  length_overall numeric not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.vessels enable row level security;

create or replace function public.count_vessels_at_berth()
returns table (total bigint, occupied bigint) as $$
begin
  return query
    select 
      count(*)::bigint as total,
      count(v.id)::bigint as occupied
    from 
      public.zones z
      left join public.vessels v on z.id = v.berth_id and v.status = 'at_berth'
    where 
      z.type = 'berth';
end;
$$ language plpgsql security definer;

-- 4. Equipment Table
create table if not exists public.equipment (
  id serial primary key,
  name text not null,
  type text not null check (type in ('crane', 'tractor', 'sensor')),
  equipment_code text unique not null,
  zone_id integer references public.zones(id),
  status text not null check (status in ('active', 'inactive', 'maintenance')),
  load_percentage integer check (load_percentage >= 0 and load_percentage <= 100),
  metric_value text,
  metric_name text,
  metric_unit text,
  battery_level integer check (battery_level >= 0 and battery_level <= 100),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.equipment enable row level security;

create or replace function public.count_active_cranes()
returns table (total bigint, active bigint) as $$
begin
  return query
    select 
      count(*)::bigint as total,
      count(*) filter (where status = 'active')::bigint as active
    from 
      public.equipment
    where 
      type = 'crane';
end;
$$ language plpgsql security definer;

-- 5. Containers Table
create table if not exists public.containers (
  id serial primary key,
  container_number text unique not null,
  iso_code text not null,
  size text not null check (size in ('20ft', '40ft', '45ft')),
  type text not null check (type in ('dry', 'reefer', 'open_top', 'flat_rack', 'tank')),
  status text not null check (status in ('import_waiting', 'export_waiting', 'in_storage', 'in_transit', 'delivered')),
  zone_id integer references public.zones(id),
  vessel_id integer references public.vessels(id),
  customs_cleared boolean default false not null,
  arrival_date timestamptz,
  departure_date timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.containers enable row level security;

create or replace function public.count_waiting_containers()
returns table (total bigint, waiting bigint) as $$
begin
  return query
    select 
      count(*)::bigint as total,
      count(*) filter (where status in ('import_waiting', 'export_waiting'))::bigint as waiting
    from 
      public.containers;
end;
$$ language plpgsql security definer;

-- 6. Customs Status Table
create table if not exists public.customs_status (
  id serial primary key,
  status text not null check (status in ('open', 'closed', 'restricted')),
  opening_time time not null,
  closing_time time not null,
  effective_date date not null default current_date,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.customs_status enable row level security;

create or replace function public.get_customs_status()
returns table (status text, is_open boolean, closing_at time) as $$
begin
  return query
    select 
      cs.status,
      (cs.status = 'open' and current_time between cs.opening_time and cs.closing_time) as is_open,
      cs.closing_time
    from 
      public.customs_status cs
    where 
      cs.effective_date = current_date
    order by 
      cs.created_at desc
    limit 1;
end;
$$ language plpgsql security definer;

-- 7. Port Status Table
create table if not exists public.port_status (
  id serial primary key,
  temperature numeric not null,
  weather text not null check (weather in ('sunny', 'cloudy', 'rainy', 'stormy', 'foggy')),
  traffic_level text not null check (traffic_level in ('low', 'medium', 'high')),
  sea_condition text not null check (sea_condition in ('calm', 'moderate', 'rough')),
  next_high_tide timestamptz not null,
  created_at timestamptz default now() not null
);

alter table public.port_status enable row level security;

create or replace function public.get_current_port_status()
returns public.port_status as $$
begin
  return (
    select *
    from public.port_status
    order by created_at desc
    limit 1
  );
end;
$$ language plpgsql security definer;

-- 8. Team Assignments Table
create table if not exists public.team_assignments (
  id serial primary key,
  user_id uuid references public.users(id) not null,
  zone_id integer references public.zones(id) not null,
  status text not null check (status in ('online', 'busy', 'away')),
  start_time timestamptz not null default now(),
  end_time timestamptz,
  active boolean not null default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.team_assignments enable row level security;

create or replace function public.get_active_team()
returns table (
  user_id uuid,
  full_name text,
  role text,
  avatar_url text,
  zone_name text,
  status text
) as $$
begin
  return query
    select 
      u.id as user_id,
      u.full_name,
      u.role,
      u.avatar_url,
      z.name as zone_name,
      ta.status
    from 
      public.team_assignments ta
      join public.users u on ta.user_id = u.id
      join public.zones z on ta.zone_id = z.id
    where 
      ta.active = true and
      (ta.end_time is null or ta.end_time > now());
end;
$$ language plpgsql security definer;

-- 9. Resource Usage Table
create table if not exists public.resource_usage (
  id serial primary key,
  resource_type text not null check (resource_type in ('crane', 'tractor', 'electricity', 'fuel', 'water')),
  usage_percentage numeric not null check (usage_percentage >= 0 and usage_percentage <= 100),
  recorded_at timestamptz not null default now()
);

alter table public.resource_usage enable row level security;

-- 10. Sample Data Insertion for Zones and Containers

-- Insert sample zones (berths and storage)
insert into public.zones (zone_code, name, type) values
('B1', 'Berth 1', 'berth'),
('B2', 'Berth 2', 'berth'),
('S1', 'Storage Area 1', 'storage'),
('S2', 'Storage Area 2', 'storage'),
('E1', 'Entry Gate 1', 'entry'),
('C1', 'Customs Zone 1', 'customs')
on conflict (zone_code) do nothing;

-- Insert sample vessels (example)
insert into public.vessels (name, imo_number, vessel_type, status, eta, etd, berth_id, capacity_teu, length_overall)
values 
('Evergreen', '1234567', 'container_ship', 'approaching', now() + interval '1 day', null, null, 5000, 300),
('Maersk', '7654321', 'container_ship', 'at_berth', now(), now() + interval '5 days', 1, 4000, 280)
on conflict (imo_number) do nothing;

-- Insert sample containers with randomized assignment to zones and vessels
do $$
declare
  container_sizes text[] := array['20ft', '40ft', '45ft'];
  container_types text[] := array['dry', 'reefer', 'open_top', 'flat_rack', 'tank'];
  container_statuses text[] := array['import_waiting', 'export_waiting', 'in_storage', 'in_transit', 'delivered'];
  zone_count int;
  vessel_count int;
  i int := 0;
  cont_num text;
begin
  select count(*) into zone_count from public.zones;
  select count(*) into vessel_count from public.vessels;

  while i < 100 loop
    cont_num := 'CONT' || lpad(i::text, 5, '0');

    insert into public.containers (
      container_number, iso_code, size, type, status, zone_id, vessel_id, customs_cleared, arrival_date, departure_date
    ) values (
      cont_num,
      'ISO' || floor(random() * 1000)::text,
      container_sizes[floor(random() * array_length(container_sizes,1)) + 1],
      container_types[floor(random() * array_length(container_types,1)) + 1],
      container_statuses[floor(random() * array_length(container_statuses,1)) + 1],
      (floor(random() * zone_count) + 1),
      (floor(random() * vessel_count) + 1),
      (random() > 0.5),
      now() - interval '1 day' * floor(random() * 30),
      now() + interval '1 day' * floor(random() * 30)
    );

    i := i + 1;
  end loop;
end
$$ language plpgsql; 