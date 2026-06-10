-- ============================================================
-- Event Marketplace Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── 1. VENDORS ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendors (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id    UUID REFERENCES outsyd_users(id) UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  email            TEXT,
  phone            TEXT,
  brand_name       TEXT,
  logo_url         TEXT,            -- 1:1 square logo (ImageKit URL)
  status           TEXT DEFAULT 'pending_approval'
                     CHECK (status IN ('pending_approval', 'active', 'paused', 'suspended')),
  settlement_notes TEXT,            -- filled manually when vendor requests first payout
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. ALTER EVENTS (add marketplace columns) ────────────────

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS vendor_id               UUID REFERENCES vendors(id),
  ADD COLUMN IF NOT EXISTS approval_status         TEXT DEFAULT 'draft'
                             CHECK (approval_status IN
                               ('draft','submitted','approved','rejected','closed','completed')),
  ADD COLUMN IF NOT EXISTS booking_enabled         BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS event_phone             TEXT,
  ADD COLUMN IF NOT EXISTS service_fee_pct         NUMERIC(5,2) DEFAULT 5.00,
  ADD COLUMN IF NOT EXISTS fee_absorbed_by_vendor  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS refund_policy           TEXT;

-- ── 3. EVENT TIERS ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS event_tiers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,        -- e.g. 'Early Bird', 'General', 'VIP'
  price       INTEGER NOT NULL,     -- stored in paise (₹499 = 49900)
  capacity    INTEGER,              -- NULL = unlimited
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. EVENT BOOKINGS ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS event_bookings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference    TEXT UNIQUE NOT NULL,      -- EVT-YYYYMMDD-XXXX

  event_id             UUID NOT NULL REFERENCES events(id),
  tier_id              UUID NOT NULL REFERENCES event_tiers(id),
  vendor_id            UUID REFERENCES vendors(id),

  -- Snapshots (captured at booking time — event/tier can change later)
  event_title          TEXT NOT NULL,
  event_date           TIMESTAMPTZ NOT NULL,
  event_venue          TEXT,
  tier_title           TEXT NOT NULL,

  user_id              UUID REFERENCES outsyd_users(id),
  customer_name        TEXT NOT NULL,
  customer_phone       TEXT NOT NULL,
  customer_email       TEXT,

  quantity             INTEGER NOT NULL DEFAULT 1,
  base_amount          INTEGER NOT NULL,           -- paise: tier.price × quantity
  service_fee_amount   INTEGER NOT NULL DEFAULT 0, -- paise: 5% fee (0 if absorbed)
  discount_amount      INTEGER DEFAULT 0,          -- paise: coupon savings
  amount_paid          INTEGER NOT NULL,           -- paise: final charged to customer
  coupon_code          TEXT,

  -- Payment
  payment_provider     TEXT DEFAULT 'cashfree',
  cf_order_id          TEXT,
  cf_payment_id        TEXT,
  payment_status       TEXT DEFAULT 'pending'
                         CHECK (payment_status IN ('pending','paid','failed','refunded')),

  -- Booking lifecycle (independent of payment)
  booking_status       TEXT DEFAULT 'confirmed'
                         CHECK (booking_status IN ('confirmed','cancelled')),

  booking_source       TEXT DEFAULT 'web',
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent duplicate paid booking (same phone + event + tier)
CREATE UNIQUE INDEX IF NOT EXISTS uq_event_booking_paid
  ON event_bookings(event_id, customer_phone, tier_id)
  WHERE payment_status = 'paid';

-- ── 5. EVENT COUPONS ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS event_coupons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id       UUID REFERENCES vendors(id),
  event_id        UUID REFERENCES events(id),  -- NULL = valid for all vendor events
  code            TEXT UNIQUE NOT NULL,
  discount_type   TEXT NOT NULL
                    CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value  INTEGER NOT NULL,             -- % (0-100) or paise flat amount
  usage_limit     INTEGER,                      -- NULL = unlimited
  start_at        TIMESTAMPTZ DEFAULT NOW(),
  end_at          TIMESTAMPTZ,
  active          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. VENDOR SETTLEMENTS ────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_settlements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id         UUID REFERENCES vendors(id),
  event_id          UUID REFERENCES events(id),
  gross_sales       INTEGER NOT NULL DEFAULT 0,   -- paise: sum of amount_paid
  refunds           INTEGER DEFAULT 0,            -- paise: any refunds issued
  platform_fee      INTEGER NOT NULL DEFAULT 0,   -- paise: sum of service_fee_amount
  estimated_payout  INTEGER NOT NULL DEFAULT 0,   -- paise: gross - refunds - platform_fee
  payout_status     TEXT DEFAULT 'pending'
                      CHECK (payout_status IN ('pending', 'paid')),
  payout_reference  TEXT,                         -- bank transfer ref / UTR
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. confirm_booking RPC ───────────────────────────────────
-- Atomic: idempotency + capacity check + payment confirmation
-- Called from the Cashfree webhook handler.

CREATE OR REPLACE FUNCTION confirm_booking(
  p_booking_id    UUID,
  p_cf_payment_id TEXT
) RETURNS TEXT AS $$
DECLARE
  v_booking  event_bookings%ROWTYPE;
  v_sold     INTEGER;
  v_capacity INTEGER;
BEGIN
  -- Lock this booking row to prevent concurrent webhook calls racing
  SELECT * INTO v_booking
    FROM event_bookings
    WHERE id = p_booking_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'not_found';
  END IF;

  -- Idempotency guard: already processed
  IF v_booking.payment_status != 'pending' THEN
    RETURN 'already_processed';
  END IF;

  -- Recount paid seats for this tier (count happens inside the lock)
  SELECT COALESCE(SUM(quantity), 0) INTO v_sold
    FROM event_bookings
    WHERE tier_id = v_booking.tier_id
      AND payment_status = 'paid';

  -- Fetch tier capacity
  SELECT capacity INTO v_capacity
    FROM event_tiers
    WHERE id = v_booking.tier_id;

  -- Capacity check (NULL capacity = unlimited)
  IF v_capacity IS NOT NULL AND (v_sold + v_booking.quantity) > v_capacity THEN
    UPDATE event_bookings
      SET payment_status = 'failed',
          updated_at     = NOW()
      WHERE id = p_booking_id;
    RETURN 'over_capacity';  -- webhook handler flags for manual Cashfree refund
  END IF;

  -- Safe to confirm
  UPDATE event_bookings
    SET payment_status  = 'paid',
        cf_payment_id   = p_cf_payment_id,
        booking_status  = 'confirmed',
        updated_at      = NOW()
    WHERE id = p_booking_id;

  RETURN 'confirmed';
END;
$$ LANGUAGE plpgsql;

-- ── 8. ROW LEVEL SECURITY ────────────────────────────────────

-- Enable RLS on all new tables
ALTER TABLE vendors             ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tiers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_coupons       ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_settlements  ENABLE ROW LEVEL SECURITY;

-- Public: only approved events visible (applies to existing events table)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'events' AND policyname = 'approved events readable'
  ) THEN
    CREATE POLICY "approved events readable"
      ON events FOR SELECT
      USING (approval_status = 'approved' OR approval_status IS NULL);
  END IF;
END $$;

-- Public: tiers readable only for approved events
CREATE POLICY "tiers of approved events readable"
  ON event_tiers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_tiers.event_id
        AND (events.approval_status = 'approved' OR events.approval_status IS NULL)
    )
  );

-- All other new tables: no anon access (service role key only via API routes)
-- No SELECT policies on vendors, event_bookings, event_coupons, vendor_settlements
-- = anon key returns nothing on those tables
