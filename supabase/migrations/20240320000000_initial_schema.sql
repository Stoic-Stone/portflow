-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor', 'logistics')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create ships table
CREATE TABLE ships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'arrived', 'departed', 'delayed')),
    dock_assignment UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create docks table
CREATE TABLE docks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('available', 'occupied', 'maintenance')),
    current_ship_id UUID REFERENCES ships(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add foreign key constraint to ships table
ALTER TABLE ships
ADD CONSTRAINT fk_dock_assignment
FOREIGN KEY (dock_assignment)
REFERENCES docks(id);

-- Create containers table
CREATE TABLE containers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    container_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('in_transit', 'at_port', 'loading', 'unloading', 'departed')),
    location TEXT NOT NULL,
    ship_id UUID REFERENCES ships(id),
    cargo_type TEXT NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    destination TEXT NOT NULL,
    estimated_arrival TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ships ENABLE ROW LEVEL SECURITY;
ALTER TABLE docks ENABLE ROW LEVEL SECURITY;
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Ships policies
CREATE POLICY "All authenticated users can view ships"
    ON ships FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Supervisors and admins can manage ships"
    ON ships FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('supervisor', 'admin')
        )
    );

-- Docks policies
CREATE POLICY "All authenticated users can view docks"
    ON docks FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Supervisors and admins can manage docks"
    ON docks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('supervisor', 'admin')
        )
    );

-- Containers policies
CREATE POLICY "All authenticated users can view containers"
    ON containers FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Logistics agents, supervisors, and admins can manage containers"
    ON containers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('logistics', 'supervisor', 'admin')
        )
    );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, email, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'logistics')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 