"use client";

import { useEffect, useState } from "react";
import { supabase, CountyWithWeather, SyncLog } from "@/lib/supabase";
import { TNMap } from "@/components/TNMap";
import { WeatherTable } from "@/components/WeatherTable";
import { SyncStatus } from "@/components/SyncStatus";

export default function Dashboard() {
  const [counties, setCounties] = useState<CountyWithWeather[]>([]);
  const [syncLog, setSyncLog] = useState<SyncLog | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  async function fetchData() {
    try {
      // Fetch counties with weather data
      const { data: countiesData, error: countiesError } = await supabase
        .from("counties")
        .select("*")
        .order("name");

      if (countiesError) throw countiesError;

      // Fetch current weather
      const { data: weatherData, error: weatherError } = await supabase
        .from("weather_current")
        .select("*");

      if (weatherError) throw weatherError;

      // Fetch active alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from("weather_alerts")
        .select("*")
        .gt("expires", new Date().toISOString());

      if (alertsError) throw alertsError;

      // Fetch latest sync log
      const { data: syncData, error: syncError } = await supabase
        .from("sync_logs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(1)
        .single();

      if (!syncError) {
        setSyncLog(syncData);
      }

      // Combine data
      const combined: CountyWithWeather[] = countiesData.map((county) => ({
        ...county,
        weather: weatherData?.find((w) => w.county_id === county.id),
        alerts: alertsData?.filter((a) => a.county_id === county.id) || [],
      }));

      setCounties(combined);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Stats
  const totalCounties = counties.length;
  const countiesWithData = counties.filter((c) => c.weather).length;
  const activeAlerts = counties.reduce((sum, c) => sum + (c.alerts?.length || 0), 0);
  const avgTemp =
    counties.reduce((sum, c) => sum + (c.weather?.temperature || 0), 0) / countiesWithData || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-200 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-zinc-400">Loading Tennessee data...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">TN Intel</h1>
            <p className="text-zinc-400 mt-1">
              Real-time intelligence for all 95 Tennessee counties
            </p>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-500 text-sm">Counties</p>
          <p className="text-2xl font-bold mt-1">{totalCounties}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-500 text-sm">With Weather Data</p>
          <p className="text-2xl font-bold mt-1">{countiesWithData}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-500 text-sm">Avg Temperature</p>
          <p className="text-2xl font-bold mt-1">{Math.round(avgTemp)}°F</p>
        </div>
        <div
          className={`border rounded-lg p-4 ${
            activeAlerts > 0
              ? "bg-red-950/30 border-red-900/50"
              : "bg-zinc-900 border-zinc-800"
          }`}
        >
          <p className={`text-sm ${activeAlerts > 0 ? "text-red-400" : "text-zinc-500"}`}>
            Active Alerts
          </p>
          <p className={`text-2xl font-bold mt-1 ${activeAlerts > 0 ? "text-red-400" : ""}`}>
            {activeAlerts}
          </p>
        </div>
      </div>

      {/* Sync Status */}
      <div className="mb-8">
        <SyncStatus syncLog={syncLog} />
      </div>

      {/* Map */}
      <div className="mb-8">
        <TNMap
          counties={counties}
          selectedCounty={selectedCounty}
          onSelectCounty={setSelectedCounty}
        />
      </div>

      {/* Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">All Counties</h2>
        <WeatherTable
          counties={counties}
          selectedCounty={selectedCounty}
          onSelectCounty={setSelectedCounty}
        />
      </div>

      {/* Footer */}
      <footer className="text-center text-zinc-600 text-sm py-8">
        <p>
          Last refreshed: {lastRefresh.toLocaleTimeString()} | Data from{" "}
          <a
            href="https://www.weather.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-200"
          >
            National Weather Service
          </a>
        </p>
      </footer>
    </main>
  );
}
