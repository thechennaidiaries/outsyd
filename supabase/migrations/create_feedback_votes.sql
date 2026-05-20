-- Create the feedback_votes table
CREATE TABLE IF NOT EXISTS feedback_votes (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usage       TEXT    NOT NULL,            -- Q1: how they use Outsyd
    next_feature TEXT   NOT NULL,            -- Q2: what feature to build next
    suggestion  TEXT    DEFAULT '',          -- Q3: free-text suggestion
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Allow inserts from the service-role (API routes use the service key)
-- No RLS needed since we insert server-side only.
