"use client";

import { useState } from "react";
import { SyncLog } from "@/lib/supabase";

interface SyncHistoryViewerProps {
  logs: SyncLog[];
}

export function SyncHistoryViewer({ logs }: SyncHistoryViewerProps) {
  const [filter, setFilter] = useState<"all" | "success" | "partial" | "failed">(
    "all"
  );
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const filteredLogs =
    filter === "all" ? logs : logs.filter((log) => log.status === filter);

  const statusColors = {
    success: "bg-emerald-950 text-emerald-400 border-emerald-900",
    partial: "bg-amber-950 text-amber-400 border-amber-900",
    failed: "bg-red-950 text-red-400 border-red-900",
  };

  const statusIcons = {
    success: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    partial: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    failed: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  };

  const formatDuration = (startedAt: string, completedAt: string | null) => {
    if (!completedAt) return "In progress";
    const start = new Date(startedAt).getTime();
    const end = new Date(completedAt).getTime();
    const ms = end - start;
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Sync History</h3>
            <p className="text-sm text-zinc-500 mt-1">
              View past sync operations and troubleshoot issues
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-zinc-950 rounded-lg p-1">
            {(["all", "success", "partial", "failed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  filter === status
                    ? "bg-zinc-800 text-zinc-200"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="divide-y divide-zinc-800 max-h-[400px] overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            No sync logs found
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-zinc-800/30 transition-colors">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() =>
                  setExpandedLog(expandedLog === log.id ? null : log.id)
                }
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${
                      statusColors[log.status]
                    }`}
                  >
                    {statusIcons[log.status]}
                    {log.status}
                  </span>
                  <span className="text-sm text-zinc-400">{log.source}</span>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <span className="text-zinc-400">
                    {log.records_synced} records
                  </span>
                  <span className="text-zinc-500">
                    {formatDuration(log.started_at, log.completed_at)}
                  </span>
                  <span className="text-zinc-500">
                    {new Date(log.started_at).toLocaleString()}
                  </span>
                  <svg
                    className={`w-4 h-4 text-zinc-600 transition-transform ${
                      expandedLog === log.id ? "rotate-180" : ""
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

              {/* Expanded details */}
              {expandedLog === log.id && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-zinc-500">Started</p>
                      <p className="text-zinc-300">
                        {new Date(log.started_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Completed</p>
                      <p className="text-zinc-300">
                        {log.completed_at
                          ? new Date(log.completed_at).toLocaleString()
                          : "In progress"}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Duration</p>
                      <p className="text-zinc-300">
                        {formatDuration(log.started_at, log.completed_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Records</p>
                      <p className="text-zinc-300">{log.records_synced}</p>
                    </div>
                  </div>

                  {log.error_message && (
                    <div className="mt-4">
                      <p className="text-zinc-500 text-sm mb-2">Error Details</p>
                      <pre className="p-3 bg-red-950/30 border border-red-900/50 rounded text-sm text-red-300 overflow-x-auto whitespace-pre-wrap">
                        {log.error_message}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
