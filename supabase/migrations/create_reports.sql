-- Create the reports table
CREATE TABLE IF NOT EXISTS reports (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_title  TEXT    NOT NULL,            -- title of the activity/event (auto-fetched from page)
    item_type   TEXT    NOT NULL,            -- 'activity' or 'event'
    reason      TEXT    NOT NULL,            -- 'closed' or 'wrong'
    details     TEXT    DEFAULT '',          -- free-text details (only when reason = 'wrong')
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Allow inserts from the service-role (API routes use the service key)
-- No RLS needed since we insert server-side only.
