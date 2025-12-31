import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NWSObservation {
  temperature: { value: number | null };
  relativeHumidity: { value: number | null };
  windSpeed: { value: number | null };
  windDirection: { value: number | null };
  textDescription: string;
  icon: string;
  timestamp: string;
}

interface NWSAlert {
  id: string;
  properties: {
    event: string;
    severity: string;
    headline: string;
    description: string;
    effective: string;
    expires: string;
    geocode: { FIPS6: string[] };
  };
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "tn-intel/1.0 (github.com/getboring/tn-intel)" },
      });
      if (response.ok) return response;
      if (response.status === 404) return null;
      console.error(`Attempt ${i + 1} failed for ${url}: ${response.status}`);
    } catch (error) {
      console.error(`Attempt ${i + 1} error for ${url}:`, error);
    }
    await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
  }
  return null;
}

function celsiusToFahrenheit(c: number | null): number | null {
  if (c === null) return null;
  return (c * 9) / 5 + 32;
}

function metersPerSecToMph(mps: number | null): number | null {
  if (mps === null) return null;
  return mps * 2.237;
}

function degreesToDirection(degrees: number | null): string {
  if (degrees === null) return "Unknown";
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = new Date();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all counties with NWS grid info
    const { data: counties, error: countiesError } = await supabase
      .from("counties")
      .select("id, fips_code, name, lat, lon, nws_grid_id, nws_grid_x, nws_grid_y")
      .not("nws_grid_id", "is", null);

    if (countiesError) throw countiesError;

    console.log(`Syncing weather for ${counties?.length || 0} counties`);

    let syncedCount = 0;
    const errors: string[] = [];

    // Sync current conditions for each county
    for (const county of counties || []) {
      try {
        // Get nearest observation station
        const stationsUrl = `https://api.weather.gov/gridpoints/${county.nws_grid_id}/${county.nws_grid_x},${county.nws_grid_y}/stations`;
        const stationsRes = await fetchWithRetry(stationsUrl);

        if (!stationsRes) {
          errors.push(`No stations for ${county.name}`);
          continue;
        }

        const stationsData = await stationsRes.json();
        const stationId = stationsData.features?.[0]?.properties?.stationIdentifier;

        if (!stationId) {
          errors.push(`No station ID for ${county.name}`);
          continue;
        }

        // Get latest observation
        const obsUrl = `https://api.weather.gov/stations/${stationId}/observations/latest`;
        const obsRes = await fetchWithRetry(obsUrl);

        if (!obsRes) {
          errors.push(`No observation for ${county.name}`);
          continue;
        }

        const obsData = await obsRes.json();
        const props = obsData.properties as NWSObservation;

        // Upsert weather data
        const { error: upsertError } = await supabase.from("weather_current").upsert(
          {
            county_id: county.id,
            temperature: celsiusToFahrenheit(props.temperature?.value),
            humidity: props.relativeHumidity?.value,
            wind_speed: metersPerSecToMph(props.windSpeed?.value),
            wind_direction: degreesToDirection(props.windDirection?.value),
            conditions: props.textDescription || "Unknown",
            icon_url: props.icon || null,
            observed_at: props.timestamp,
            synced_at: new Date().toISOString(),
          },
          { onConflict: "county_id" }
        );

        if (upsertError) {
          errors.push(`Upsert failed for ${county.name}: ${upsertError.message}`);
        } else {
          syncedCount++;
        }

        // Small delay to be nice to NWS API
        await new Promise((r) => setTimeout(r, 200));
      } catch (error) {
        errors.push(`Error for ${county.name}: ${error}`);
      }
    }

    // Sync alerts for all of Tennessee
    try {
      const alertsRes = await fetchWithRetry("https://api.weather.gov/alerts/active?area=TN");

      if (alertsRes) {
        const alertsData = await alertsRes.json();
        const alerts: NWSAlert[] = alertsData.features || [];

        // Clear expired alerts
        await supabase.from("weather_alerts").delete().lt("expires", new Date().toISOString());

        // Insert new alerts
        for (const alert of alerts) {
          const fipsCodes = alert.properties.geocode?.FIPS6 || [];

          for (const fips of fipsCodes) {
            // TN FIPS codes start with 047
            if (!fips.startsWith("047")) continue;

            // Convert to our format (47XXX)
            const countyFips = "47" + fips.slice(3);

            // Find county
            const county = counties?.find((c) => c.fips_code === countyFips);
            if (!county) continue;

            await supabase.from("weather_alerts").upsert(
              {
                county_id: county.id,
                alert_id: alert.id,
                event: alert.properties.event,
                severity: alert.properties.severity,
                headline: alert.properties.headline,
                description: alert.properties.description,
                effective: alert.properties.effective,
                expires: alert.properties.expires,
                synced_at: new Date().toISOString(),
              },
              { onConflict: "alert_id" }
            );
          }
        }
      }
    } catch (error) {
      errors.push(`Alerts sync error: ${error}`);
    }

    // Log sync result
    const status = errors.length === 0 ? "success" : errors.length < 10 ? "partial" : "failed";

    await supabase.from("sync_logs").insert({
      source: "weather",
      status,
      records_synced: syncedCount,
      error_message: errors.length > 0 ? errors.slice(0, 10).join("; ") : null,
      started_at: startTime.toISOString(),
      completed_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        synced: syncedCount,
        errors: errors.length,
        status,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Sync failed:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
