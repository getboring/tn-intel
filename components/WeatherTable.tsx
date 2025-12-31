"use client";

import { CountyWithWeather } from "@/lib/supabase";

interface WeatherTableProps {
  counties: CountyWithWeather[];
  selectedCounty: string | null;
  onSelectCounty: (id: string | null) => void;
}

export function WeatherTable({ counties, selectedCounty, onSelectCounty }: WeatherTableProps) {
  const sortedCounties = [...counties].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800/50 sticky top-0">
            <tr>
              <th className="text-left p-3 font-medium text-zinc-400">County</th>
              <th className="text-right p-3 font-medium text-zinc-400">Temp</th>
              <th className="text-left p-3 font-medium text-zinc-400">Conditions</th>
              <th className="text-right p-3 font-medium text-zinc-400">Humidity</th>
              <th className="text-right p-3 font-medium text-zinc-400">Wind</th>
              <th className="text-center p-3 font-medium text-zinc-400">Alerts</th>
            </tr>
          </thead>
          <tbody>
            {sortedCounties.map((county) => {
              const hasAlerts = county.alerts && county.alerts.length > 0;
              const isSelected = selectedCounty === county.id;

              return (
                <tr
                  key={county.id}
                  onClick={() => onSelectCounty(isSelected ? null : county.id)}
                  className={`
                    border-t border-zinc-800/50 cursor-pointer transition-colors
                    ${isSelected ? "bg-zinc-800" : "hover:bg-zinc-800/50"}
                    ${hasAlerts ? "bg-red-950/20" : ""}
                  `}
                >
                  <td className="p-3 font-medium">
                    {county.name}
                    {hasAlerts && (
                      <span className="ml-2 text-xs text-red-400">
                        ({county.alerts!.length} alert{county.alerts!.length > 1 ? "s" : ""})
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right font-mono">
                    {county.weather?.temperature != null
                      ? `${Math.round(county.weather.temperature)}°F`
                      : "—"}
                  </td>
                  <td className="p-3 text-zinc-400">
                    {county.weather?.conditions || "—"}
                  </td>
                  <td className="p-3 text-right font-mono text-zinc-400">
                    {county.weather?.humidity != null
                      ? `${Math.round(county.weather.humidity)}%`
                      : "—"}
                  </td>
                  <td className="p-3 text-right font-mono text-zinc-400">
                    {county.weather?.wind_speed != null
                      ? `${Math.round(county.weather.wind_speed)} mph ${county.weather.wind_direction || ""}`
                      : "—"}
                  </td>
                  <td className="p-3 text-center">
                    {hasAlerts ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
                        {county.alerts!.length}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
