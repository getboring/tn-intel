"use client";

import { SyncLog } from "@/lib/supabase";
import { getActiveSources, getPlannedSources } from "@/lib/data-sources";

interface SystemOverviewProps {
  lastSync: SyncLog | null;
  totalRecords: number;
}

export function SystemOverview({ lastSync, totalRecords }: SystemOverviewProps) {
  const activeSources = getActiveSources();
  const plannedSources = getPlannedSources();

  // Calculate next sync (top of the next hour)
  const now = new Date();
  const nextSync = new Date(now);
  nextSync.setHours(nextSync.getHours() + 1, 0, 0, 0);
  const minutesUntilSync = Math.round(
    (nextSync.getTime() - now.getTime()) / 60000
  );

  // Determine system health
  const isHealthy = lastSync?.status === "success";
  const isDegraded = lastSync?.status === "partial";
  const isUnhealthy = lastSync?.status === "failed" || !lastSync;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">System Overview</h2>
          <p className="text-zinc-400 text-sm mt-1">
            How data flows from external APIs to your dashboard
          </p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
            isHealthy
              ? "bg-emerald-950 text-emerald-400"
              : isDegraded
              ? "bg-amber-950 text-amber-400"
              : "bg-red-950 text-red-400"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isHealthy
                ? "bg-emerald-400"
                : isDegraded
                ? "bg-amber-400"
                : "bg-red-400"
            } animate-pulse`}
          />
          {isHealthy ? "Healthy" : isDegraded ? "Degraded" : "Unhealthy"}
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="mb-6 p-4 bg-zinc-950 rounded-lg border border-zinc-800 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px] gap-2">
          {/* GitHub Actions */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center mb-2">
              <svg
                className="w-8 h-8 text-zinc-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <span className="text-xs text-zinc-500 text-center">
              GitHub
              <br />
              Actions
            </span>
          </div>

          {/* Arrow */}
          <div className="flex-1 flex items-center">
            <div className="h-0.5 flex-1 bg-zinc-700" />
            <div className="text-zinc-600 text-xs px-2 whitespace-nowrap">
              Hourly trigger
            </div>
            <div className="h-0.5 flex-1 bg-zinc-700" />
            <svg
              className="w-4 h-4 text-zinc-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>

          {/* Edge Function */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-950 border border-emerald-900 rounded-lg flex items-center justify-center mb-2">
              <svg
                className="w-8 h-8 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-xs text-zinc-500 text-center">
              Supabase
              <br />
              Edge Function
            </span>
          </div>

          {/* Arrow */}
          <div className="flex-1 flex items-center">
            <div className="h-0.5 flex-1 bg-zinc-700" />
            <div className="text-zinc-600 text-xs px-2 whitespace-nowrap">
              API calls
            </div>
            <div className="h-0.5 flex-1 bg-zinc-700" />
            <svg
              className="w-4 h-4 text-zinc-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>

          {/* External APIs */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-950 border border-blue-900 rounded-lg flex items-center justify-center mb-2">
              <svg
                className="w-8 h-8 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-xs text-zinc-500 text-center">
              External
              <br />
              APIs
            </span>
          </div>

          {/* Arrow */}
          <div className="flex-1 flex items-center">
            <div className="h-0.5 flex-1 bg-zinc-700" />
            <div className="text-zinc-600 text-xs px-2 whitespace-nowrap">
              Store data
            </div>
            <div className="h-0.5 flex-1 bg-zinc-700" />
            <svg
              className="w-4 h-4 text-zinc-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>

          {/* Database */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-violet-950 border border-violet-900 rounded-lg flex items-center justify-center mb-2">
              <svg
                className="w-8 h-8 text-violet-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
            </div>
            <span className="text-xs text-zinc-500 text-center">
              Supabase
              <br />
              Database
            </span>
          </div>

          {/* Arrow */}
          <div className="flex-1 flex items-center">
            <div className="h-0.5 flex-1 bg-zinc-700" />
            <div className="text-zinc-600 text-xs px-2 whitespace-nowrap">
              Query
            </div>
            <div className="h-0.5 flex-1 bg-zinc-700" />
            <svg
              className="w-4 h-4 text-zinc-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>

          {/* Dashboard */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-orange-950 border border-orange-900 rounded-lg flex items-center justify-center mb-2">
              <svg
                className="w-8 h-8 text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <span className="text-xs text-zinc-500 text-center">
              Your
              <br />
              Dashboard
            </span>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="text-sm text-zinc-400 mb-6 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
        <p className="mb-2">
          <strong className="text-zinc-200">How it works:</strong>
        </p>
        <ol className="list-decimal list-inside space-y-1 text-zinc-500">
          <li>
            <strong className="text-zinc-400">GitHub Actions</strong> runs a
            scheduled job every hour
          </li>
          <li>
            It triggers a <strong className="text-zinc-400">Supabase Edge Function</strong>{" "}
            (serverless code)
          </li>
          <li>
            The function calls <strong className="text-zinc-400">external APIs</strong>{" "}
            (like NWS Weather)
          </li>
          <li>
            Data is cleaned and stored in the{" "}
            <strong className="text-zinc-400">PostgreSQL database</strong>
          </li>
          <li>
            The <strong className="text-zinc-400">dashboard</strong> queries
            the database and displays the data
          </li>
        </ol>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
          <p className="text-zinc-500 text-xs uppercase tracking-wide">
            Data Sources
          </p>
          <p className="text-2xl font-bold mt-1">{activeSources.length}</p>
          <p className="text-zinc-600 text-xs mt-1">
            +{plannedSources.length} planned
          </p>
        </div>

        <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
          <p className="text-zinc-500 text-xs uppercase tracking-wide">
            Total Records
          </p>
          <p className="text-2xl font-bold mt-1">{totalRecords}</p>
          <p className="text-zinc-600 text-xs mt-1">across all counties</p>
        </div>

        <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
          <p className="text-zinc-500 text-xs uppercase tracking-wide">
            Last Sync
          </p>
          <p className="text-2xl font-bold mt-1">
            {lastSync
              ? new Date(lastSync.completed_at!).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "Never"}
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            {lastSync?.records_synced || 0} records
          </p>
        </div>

        <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
          <p className="text-zinc-500 text-xs uppercase tracking-wide">
            Next Sync
          </p>
          <p className="text-2xl font-bold mt-1">
            {minutesUntilSync} min
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            at {nextSync.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </p>
        </div>
      </div>
    </div>
  );
}
