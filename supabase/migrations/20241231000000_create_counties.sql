-- Create counties table for all 95 Tennessee counties
CREATE TABLE counties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fips_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  lat NUMERIC(9,6) NOT NULL,
  lon NUMERIC(9,6) NOT NULL,
  nws_grid_id TEXT,
  nws_grid_x INTEGER,
  nws_grid_y INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common lookups
CREATE INDEX idx_counties_fips ON counties(fips_code);
CREATE INDEX idx_counties_name ON counties(name);

-- Enable RLS
ALTER TABLE counties ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Counties are publicly readable"
  ON counties FOR SELECT
  USING (true);
