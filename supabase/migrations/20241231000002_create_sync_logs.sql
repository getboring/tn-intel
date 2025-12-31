-- Sync job logs for monitoring
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index for monitoring queries
CREATE INDEX idx_sync_logs_source ON sync_logs(source);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);
CREATE INDEX idx_sync_logs_started ON sync_logs(started_at DESC);

-- Enable RLS
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for dashboard monitoring)
CREATE POLICY "Sync logs are publicly readable"
  ON sync_logs FOR SELECT
  USING (true);

-- Create a view for latest sync status per source
CREATE VIEW latest_syncs AS
SELECT DISTINCT ON (source)
  source,
  status,
  records_synced,
  error_message,
  started_at,
  completed_at
FROM sync_logs
ORDER BY source, started_at DESC;
