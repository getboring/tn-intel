-- Current weather conditions per county
CREATE TABLE weather_current (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id UUID NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  temperature NUMERIC(5,2),
  humidity NUMERIC(5,2),
  wind_speed NUMERIC(5,2),
  wind_direction TEXT,
  conditions TEXT,
  icon_url TEXT,
  observed_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(county_id)
);

-- Index for lookups
CREATE INDEX idx_weather_current_county ON weather_current(county_id);
CREATE INDEX idx_weather_current_synced ON weather_current(synced_at);

-- Weather alerts
CREATE TABLE weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id UUID NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  alert_id TEXT NOT NULL,
  event TEXT NOT NULL,
  severity TEXT,
  headline TEXT,
  description TEXT,
  effective TIMESTAMPTZ,
  expires TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alert_id)
);

-- Index for active alerts
CREATE INDEX idx_weather_alerts_county ON weather_alerts(county_id);
CREATE INDEX idx_weather_alerts_expires ON weather_alerts(expires);
CREATE INDEX idx_weather_alerts_severity ON weather_alerts(severity);

-- Enable RLS
ALTER TABLE weather_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_alerts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Weather current is publicly readable"
  ON weather_current FOR SELECT
  USING (true);

CREATE POLICY "Weather alerts are publicly readable"
  ON weather_alerts FOR SELECT
  USING (true);
