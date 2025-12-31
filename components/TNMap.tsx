"use client";

import { CountyWithWeather } from "@/lib/supabase";

interface TNMapProps {
  counties: CountyWithWeather[];
  selectedCounty: string | null;
  onSelectCounty: (id: string | null) => void;
}

// TN bounding box (approximate)
const TN_BOUNDS = {
  minLat: 34.98,
  maxLat: 36.68,
  minLon: -90.31,
  maxLon: -81.65,
};

function getTemperatureColor(temp: number | null | undefined): string {
  if (temp == null) return "#3f3f46"; // zinc-700

  // Cold to hot gradient
  if (temp < 20) return "#3b82f6"; // blue
  if (temp < 32) return "#06b6d4"; // cyan
  if (temp < 50) return "#22c55e"; // green
  if (temp < 70) return "#eab308"; // yellow
  if (temp < 85) return "#f97316"; // orange
  return "#ef4444"; // red
}

function getSeverityColor(severity: string): string {
  switch (severity?.toLowerCase()) {
    case "extreme":
      return "#dc2626";
    case "severe":
      return "#ea580c";
    case "moderate":
      return "#eab308";
    default:
      return "#f97316";
  }
}

export function TNMap({ counties, selectedCounty, onSelectCounty }: TNMapProps) {
  const width = 800;
  const height = 200;
  const padding = 20;

  // Convert lat/lon to SVG coordinates
  const toX = (lon: number) => {
    const normalized = (lon - TN_BOUNDS.minLon) / (TN_BOUNDS.maxLon - TN_BOUNDS.minLon);
    return padding + normalized * (width - 2 * padding);
  };

  const toY = (lat: number) => {
    const normalized = (lat - TN_BOUNDS.minLat) / (TN_BOUNDS.maxLat - TN_BOUNDS.minLat);
    return height - padding - normalized * (height - 2 * padding);
  };

  const selectedData = counties.find((c) => c.id === selectedCounty);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Tennessee Counties</h2>
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500" /> Cold
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500" /> Mild
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-orange-500" /> Warm
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500" /> Hot
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        style={{ maxHeight: "250px" }}
      >
        {/* State outline (simplified) */}
        <rect
          x={padding}
          y={padding}
          width={width - 2 * padding}
          height={height - 2 * padding}
          fill="none"
          stroke="#27272a"
          strokeWidth="1"
          rx="4"
        />

        {/* County dots */}
        {counties.map((county) => {
          const x = toX(county.lon);
          const y = toY(county.lat);
          const temp = county.weather?.temperature;
          const hasAlerts = county.alerts && county.alerts.length > 0;
          const isSelected = selectedCounty === county.id;

          return (
            <g key={county.id}>
              {/* Alert ring */}
              {hasAlerts && (
                <circle
                  cx={x}
                  cy={y}
                  r={12}
                  fill="none"
                  stroke={getSeverityColor(county.alerts![0].severity)}
                  strokeWidth="2"
                  className="animate-pulse"
                />
              )}
              {/* County dot */}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 8 : 6}
                fill={getTemperatureColor(temp)}
                stroke={isSelected ? "#fff" : "none"}
                strokeWidth={isSelected ? 2 : 0}
                className="cursor-pointer transition-all duration-150 hover:r-8"
                onClick={() => onSelectCounty(isSelected ? null : county.id)}
              />
              {/* Label on hover/select */}
              {isSelected && (
                <text
                  x={x}
                  y={y - 14}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="10"
                  fontWeight="600"
                >
                  {county.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Selected county details */}
      {selectedData && (
        <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">{selectedData.name} County</h3>
              <p className="text-zinc-400 text-sm">
                FIPS: {selectedData.fips_code} | Grid: {selectedData.nws_grid_id || "N/A"}
              </p>
            </div>
            {selectedData.weather && (
              <div className="text-right">
                <p className="text-3xl font-bold">
                  {selectedData.weather.temperature != null
                    ? `${Math.round(selectedData.weather.temperature)}°F`
                    : "—"}
                </p>
                <p className="text-zinc-400">{selectedData.weather.conditions}</p>
              </div>
            )}
          </div>

          {selectedData.weather && (
            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
              <div>
                <p className="text-zinc-500">Humidity</p>
                <p className="font-mono">
                  {selectedData.weather.humidity != null
                    ? `${Math.round(selectedData.weather.humidity)}%`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Wind</p>
                <p className="font-mono">
                  {selectedData.weather.wind_speed != null
                    ? `${Math.round(selectedData.weather.wind_speed)} mph ${selectedData.weather.wind_direction || ""}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Updated</p>
                <p className="font-mono text-xs">
                  {selectedData.weather.synced_at
                    ? new Date(selectedData.weather.synced_at).toLocaleTimeString()
                    : "—"}
                </p>
              </div>
            </div>
          )}

          {selectedData.alerts && selectedData.alerts.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-red-400 font-medium text-sm">Active Alerts:</p>
              {selectedData.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 bg-red-950/30 border border-red-900/50 rounded text-sm"
                >
                  <p className="font-medium text-red-400">{alert.event}</p>
                  <p className="text-zinc-400 text-xs mt-1">{alert.headline}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
