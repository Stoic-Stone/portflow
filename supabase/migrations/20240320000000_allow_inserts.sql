-- Allow all inserts for equipment
CREATE POLICY "Allow all inserts for equipment"
  ON public.equipment
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow all inserts for vessels
CREATE POLICY "Allow all inserts for vessels"
  ON public.vessels
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow all inserts for containers
CREATE POLICY "Allow all inserts for containers"
  ON public.containers
  FOR INSERT
  TO authenticated
  WITH CHECK (true); 