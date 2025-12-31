"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase, SyncLog } from "@/lib/supabase";
import { DATA_SOURCES, GLOSSARY } from "@/lib/data-sources";
import { SystemOverview } from "@/components/control-panel/SystemOverview";
import { DataSourceCard } from "@/components/control-panel/DataSourceCard";
import { SyncHistoryViewer } from "@/components/control-panel/SyncHistoryViewer";

const COOLDOWN_DURATION = 5 * 60 * 1000; // 5 minutes in ms

export default function ControlPanel() {
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [weatherCount, setWeatherCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [lastManualSync, setLastManualSync] = useState<number | null>(null);

  // Load data
  const fetchData = useCallback(async () => {
    try {
      // Fetch sync logs
      const { data: logs } = await supabase
        .from("sync_logs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(50);

      if (logs) setSyncLogs(logs);

      // Fetch weather record count
      const { count } = await supabase
        .from("weather_current")
        .select("*", { count: "exact", head: true });

      if (count) setWeatherCount(count);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Check for stored last manual sync time
    const stored = localStorage.getItem("lastManualSync");
    if (stored) {
      setLastManualSync(parseInt(stored, 10));
    }
  }, [fetchData]);

  // Update cooldown timer
  useEffect(() => {
    if (!lastManualSync) {
      setCooldownRemaining(0);
      return;
    }

    const updateCooldown = () => {
      const elapsed = Date.now() - lastManualSync;
      const remaining = Math.max(0, COOLDOWN_DURATION - elapsed);
      setCooldownRemaining(remaining);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [lastManualSync]);

  // Handle manual sync
  const handleManualSync = async () => {
    if (cooldownRemaining > 0 || isSyncing) return;

    setIsSyncing(true);

    try {
      const response = await fetch("/api/sync/weather", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Sync failed");
      }

      // Update last manual sync time
      const now = Date.now();
      setLastManualSync(now);
      localStorage.setItem("lastManualSync", now.toString());

      // Refresh data
      await fetchData();
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const latestWeatherSync = syncLogs.find((l) => l.source === "weather") || null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-200 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-zinc-400">Loading control panel...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">Control Panel</h1>
            </div>
            <p className="text-zinc-400">
              Your window into how data flows. See exactly what APIs are called,
              when, and why.
            </p>
          </div>
        </div>
      </header>

      {/* System Overview */}
      <section className="mb-8">
        <SystemOverview lastSync={latestWeatherSync} totalRecords={weatherCount} />
      </section>

      {/* Data Sources */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Data Sources</h2>
          <span className="text-sm text-zinc-500">
            {Object.values(DATA_SOURCES).filter((s) => s.status === "active").length}{" "}
            active,{" "}
            {Object.values(DATA_SOURCES).filter((s) => s.status === "planned").length}{" "}
            planned
          </span>
        </div>

        <div className="space-y-4">
          {/* Active sources first */}
          {Object.values(DATA_SOURCES)
            .filter((s) => s.status === "active")
            .map((source) => (
              <DataSourceCard
                key={source.id}
                source={source}
                lastSync={
                  syncLogs.find((l) => l.source === source.id) || null
                }
                recordCount={source.id === "weather" ? weatherCount : 0}
                onManualSync={source.id === "weather" ? handleManualSync : undefined}
                isSyncing={isSyncing}
                cooldownRemaining={Math.ceil(cooldownRemaining / 1000)}
              />
            ))}

          {/* Planned sources */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-3">
              Coming Soon
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(DATA_SOURCES)
                .filter((s) => s.status === "planned")
                .map((source) => (
                  <DataSourceCard
                    key={source.id}
                    source={source}
                    lastSync={null}
                    recordCount={0}
                  />
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sync History */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sync History</h2>
        <SyncHistoryViewer logs={syncLogs} />
      </section>

      {/* Glossary */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Glossary</h2>
        <p className="text-zinc-400 text-sm mb-4">
          New to APIs? Here are some terms you&apos;ll see in this dashboard:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(GLOSSARY).map((item) => (
            <div
              key={item.term}
              className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg"
            >
              <h4 className="font-medium text-zinc-200">{item.term}</h4>
              <p className="text-sm text-zinc-500 mt-1">{item.definition}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-zinc-600 text-sm py-8 border-t border-zinc-800">
        <p>
          TN Intel Control Panel | Learn more about APIs at{" "}
          <a
            href="https://www.restapitutorial.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-200"
          >
            REST API Tutorial
          </a>
        </p>
      </footer>
    </main>
  );
}
