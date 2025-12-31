"use client";

import { SyncLog } from "@/lib/supabase";

interface SyncStatusProps {
  syncLog: SyncLog | null;
}

export function SyncStatus({ syncLog }: SyncStatusProps) {
  if (!syncLog) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <p className="text-zinc-500 text-sm">No sync data available</p>
      </div>
    );
  }

  const statusColors = {
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    partial: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const statusDot = {
    success: "bg-emerald-500",
    partial: "bg-amber-500",
    failed: "bg-red-500",
  };

  const syncedAt = syncLog.completed_at
    ? new Date(syncLog.completed_at).toLocaleString()
    : "In progress...";

  return (
    <div
      className={`border rounded-lg p-4 ${statusColors[syncLog.status]}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${statusDot[syncLog.status]} animate-pulse`} />
          <div>
            <p className="font-medium capitalize">{syncLog.source} Sync</p>
            <p className="text-xs opacity-70">{syncedAt}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{syncLog.records_synced}</p>
          <p className="text-xs opacity-70">counties synced</p>
        </div>
      </div>
      {syncLog.error_message && (
        <p className="mt-2 text-xs opacity-70 truncate" title={syncLog.error_message}>
          {syncLog.error_message}
        </p>
      )}
    </div>
  );
}
