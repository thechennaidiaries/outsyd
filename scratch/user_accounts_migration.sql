-- ============================================================
-- Outsyd User Accounts Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── 1. OTP Verifications ─────────────────────────────────────
-- Temporary store for WhatsApp OTP codes. Cleaned up after use.

CREATE TABLE IF NOT EXISTS otp_verifications (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT        NOT NULL,
    otp          TEXT        NOT NULL,
    expires_at   TIMESTAMPTZ NOT NULL,
    verified     BOOLEAN     DEFAULT false,
    attempts     INT         DEFAULT 0,          -- max 5 before lockout
    created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone    ON otp_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_expires  ON otp_verifications(expires_at);

-- ── 2. Users (public profile) ─────────────────────────────────
-- Custom user table — NOT Supabase auth.users.
-- Session handled via signed JWT cookie.

CREATE TABLE IF NOT EXISTS public.users (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT        UNIQUE NOT NULL,
    name         TEXT,
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone_number);

-- ── 3. Bookings — add user_id ─────────────────────────────────
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);

-- ── 4. Saved Activities ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_activities (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    activity_id TEXT        NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, activity_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_activities(user_id);

-- ── 5. Plans ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plans (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title      TEXT        NOT NULL DEFAULT 'My Plan',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plans_user ON plans(user_id);

-- ── 6. Plan Activities ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plan_activities (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id     UUID        NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    activity_id TEXT        NOT NULL,
    added_at    TIMESTAMPTZ DEFAULT now(),
    UNIQUE(plan_id, activity_id)
);

CREATE INDEX IF NOT EXISTS idx_plan_activities_plan ON plan_activities(plan_id);

-- ── 7. RLS — disable for service role (we use service key) ───
ALTER TABLE otp_verifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_activities   ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans              ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_activities    ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS — all our API routes use service role key.
-- No policies needed for MVP. Add per-user policies when adding client-side Supabase calls.
