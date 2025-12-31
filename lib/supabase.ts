import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface County {
  id: string;
  fips_code: string;
  name: string;
  lat: number;
  lon: number;
  nws_grid_id: string | null;
}

export interface WeatherCurrent {
  id: string;
  county_id: string;
  temperature: number | null;
  humidity: number | null;
  wind_speed: number | null;
  wind_direction: string | null;
  conditions: string | null;
  icon_url: string | null;
  observed_at: string | null;
  synced_at: string;
}

export interface WeatherAlert {
  id: string;
  county_id: string;
  alert_id: string;
  event: string;
  severity: string;
  headline: string;
  description: string;
  effective: string;
  expires: string;
}

export interface SyncLog {
  id: string;
  source: string;
  status: "success" | "partial" | "failed";
  records_synced: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface CountyWithWeather extends County {
  weather?: WeatherCurrent;
  alerts?: WeatherAlert[];
}
