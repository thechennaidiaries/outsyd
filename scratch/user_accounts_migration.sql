-- ============================================================
-- Outsyd User Accounts Migration
-- Run each SECTION separately in Supabase SQL Editor
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- SECTION 1: OTP Verifications
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS otp_verifications (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT        NOT NULL,
    otp          TEXT        NOT NULL,
    expires_at   TIMESTAMPTZ NOT NULL,
    verified     BOOLEAN     DEFAULT false,
    attempts     INT         DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone   ON otp_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);

ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;


-- ════════════════════════════════════════════════════════════
-- SECTION 2: Users table
-- Named outsyd_users to avoid conflict with Supabase internals
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS outsyd_users (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT        UNIQUE NOT NULL,
    name         TEXT,
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outsyd_users_phone ON outsyd_users(phone_number);

ALTER TABLE outsyd_users ENABLE ROW LEVEL SECURITY;


-- ════════════════════════════════════════════════════════════
-- SECTION 3: Add user_id to bookings
-- Run ONLY after Section 2 succeeds
-- ════════════════════════════════════════════════════════════

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE bookings
            ADD COLUMN user_id UUID REFERENCES outsyd_users(id) ON DELETE SET NULL;

        CREATE INDEX idx_bookings_user_id ON bookings(user_id);

        RAISE NOTICE 'user_id column added to bookings successfully';
    ELSE
        RAISE NOTICE 'user_id already exists on bookings — skipped';
    END IF;
END $$;


-- ════════════════════════════════════════════════════════════
-- SECTION 4: Saved Activities
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS saved_activities (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES outsyd_users(id) ON DELETE CASCADE,
    activity_id TEXT        NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, activity_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_activities(user_id);

ALTER TABLE saved_activities ENABLE ROW LEVEL SECURITY;


-- ════════════════════════════════════════════════════════════
-- SECTION 5: Plans + Plan Activities
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS plans (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES outsyd_users(id) ON DELETE CASCADE,
    title      TEXT        NOT NULL DEFAULT 'My Plan',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plans_user ON plans(user_id);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS plan_activities (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id     UUID        NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    activity_id TEXT        NOT NULL,
    added_at    TIMESTAMPTZ DEFAULT now(),
    UNIQUE(plan_id, activity_id)
);

CREATE INDEX IF NOT EXISTS idx_plan_activities_plan ON plan_activities(plan_id);

ALTER TABLE plan_activities ENABLE ROW LEVEL SECURITY;
