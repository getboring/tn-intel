"use client";

import { useState } from "react";
import { DataSource } from "@/lib/data-sources";
import { SyncLog } from "@/lib/supabase";
import { EndpointExplainer } from "./EndpointExplainer";
import { CodeExample } from "./CodeExample";

interface DataSourceCardProps {
  source: DataSource;
  lastSync: SyncLog | null;
  recordCount: number;
  onManualSync?: () => Promise<void>;
  isSyncing?: boolean;
  cooldownRemaining?: number;
}

export function DataSourceCard({
  source,
  lastSync,
  recordCount,
  onManualSync,
  isSyncing = false,
  cooldownRemaining = 0,
}: DataSourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isActive = source.status === "active";
  const isPlanned = source.status === "planned";

  const statusColors = {
    success: "bg-emerald-950 text-emerald-400",
    partial: "bg-amber-950 text-amber-400",
    failed: "bg-red-950 text-red-400",
  };

  // Icon based on source type
  const sourceIcons: Record<string, JSX.Element> = {
    weather: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    census: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    bls: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    airnow: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
    ),
  };

  return (
    <div
      className={`rounded-lg border overflow-hidden transition-colors ${
        isPlanned
          ? "bg-zinc-900/50 border-zinc-800/50"
          : "bg-zinc-900 border-zinc-800"
      }`}
    >
      {/* Collapsed Header */}
      <div
        className={`p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors ${
          isPlanned ? "opacity-60" : ""
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isActive
                  ? "bg-blue-950 text-blue-400"
                  : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {sourceIcons[source.id] || sourceIcons.weather}
            </div>
            <div>
              <h3 className="font-medium">{source.displayName}</h3>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                {isActive ? (
                  <>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        lastSync ? statusColors[lastSync.status] : "bg-zinc-800"
                      }`}
                    >
                      {lastSync?.status || "Never synced"}
                    </span>
                    <span>
                      {lastSync
                        ? `Last sync: ${new Date(
                            lastSync.completed_at!
                          ).toLocaleTimeString()}`
                        : ""}
                    </span>
                  </>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-500">
                    Coming Soon
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isActive && (
              <div className="text-right text-sm">
                <p className="text-zinc-400">{recordCount} records</p>
                <p className="text-zinc-600">
                  {lastSync?.error_message ? "with errors" : "synced"}
                </p>
              </div>
            )}
            <svg
              className={`w-5 h-5 text-zinc-500 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-zinc-800 p-4 space-y-6">
          {/* About */}
          <div>
            <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-2">
              About This API
            </h4>
            <p className="text-zinc-300">{source.description}</p>
            <a
              href={source.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mt-2"
            >
              Official Documentation
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>

          {/* Base URL */}
          <div>
            <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-2">
              Base URL
            </h4>
            <CodeExample code={source.baseUrl} language="bash" maxHeight={50} />
          </div>

          {/* Auth Type */}
          <div className="flex gap-8">
            <div>
              <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-2">
                Authentication
              </h4>
              <p className="text-zinc-300">
                {source.authType === "none" ? (
                  <span className="text-emerald-400">No API key required</span>
                ) : source.authType === "apiKey" ? (
                  <span className="text-amber-400">API key required (free)</span>
                ) : (
                  <span className="text-blue-400">OAuth authentication</span>
                )}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-2">
                Rate Limits
              </h4>
              <p className="text-zinc-300">
                {source.rateLimit.perSecond} request/sec
              </p>
              <p className="text-zinc-500 text-sm mt-1">
                {source.rateLimit.note}
              </p>
            </div>
          </div>

          {/* Endpoints */}
          {source.endpoints && source.endpoints.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-3">
                Endpoints We Use
              </h4>
              <div className="space-y-3">
                {source.endpoints.map((endpoint, i) => (
                  <EndpointExplainer
                    key={i}
                    endpoint={endpoint}
                    baseUrl={source.baseUrl}
                    index={i + 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sync Schedule */}
          {isActive && (
            <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
              <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-3">
                Sync Schedule
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-zinc-300">
                    {source.syncSchedule.humanReadable}
                  </p>
                  <code className="text-xs text-zinc-500 font-mono mt-1 block">
                    cron: {source.syncSchedule.cron}
                  </code>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">
                    <strong className="text-zinc-400">Why this schedule?</strong>{" "}
                    {source.syncSchedule.whyThisSchedule}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Manual Sync */}
          {isActive && onManualSync && (
            <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
              <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-3">
                Manual Sync
              </h4>
              <div className="flex items-center justify-between">
                <div className="text-sm text-zinc-500">
                  {cooldownRemaining > 0 ? (
                    <p>
                      Cooldown: {Math.ceil(cooldownRemaining / 60)} min remaining
                      <br />
                      <span className="text-zinc-600">
                        (prevents overloading the API)
                      </span>
                    </p>
                  ) : (
                    <p>
                      Trigger a sync now. There&apos;s a 5-minute cooldown between
                      manual syncs to respect API rate limits.
                    </p>
                  )}
                </div>
                <button
                  onClick={onManualSync}
                  disabled={isSyncing || cooldownRemaining > 0}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isSyncing || cooldownRemaining > 0
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-500 text-white"
                  }`}
                >
                  {isSyncing ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Syncing...
                    </span>
                  ) : (
                    "Sync Now"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
