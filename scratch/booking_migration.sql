-- ═══════════════════════════════════════════════════════════════════
-- OUTSYD — Booking System Migration
-- Run each section in order in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────
-- SECTION 0: Prerequisites
-- ─────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";


-- ─────────────────────────────────────────────────────────────────
-- SECTION 1: ENUM — booking_status
-- ─────────────────────────────────────────────────────────────────

create type booking_status as enum (
    'pending_vendor',
    'confirmed',
    'rejected',
    'expired',
    'manual_followup'
);


-- ─────────────────────────────────────────────────────────────────
-- SECTION 2: ALTER places
--
-- NOTE: Your places table uses (name, city_id) as its unique key.
--       place_id on activities is a TEXT field = places.name.
--       We respect this existing design here.
-- ─────────────────────────────────────────────────────────────────

alter table places
    add column if not exists phone_number             text,
    add column if not exists booking_enabled          boolean not null default false,
    add column if not exists booking_contact_method   text,        -- 'whatsapp' | 'call' | 'email'
    add column if not exists response_timeout_minutes integer not null default 30,
    add column if not exists booking_notes            text,
    add column if not exists whatsapp_template_key    text;        -- for future per-vendor WA templates

-- Phone format: must be international (+91...) if provided
alter table places
    add constraint places_phone_number_format
    check (phone_number is null or phone_number ~ '^\+[1-9]\d{6,14}$');

-- Timeout must be a positive number
alter table places
    add constraint places_response_timeout_positive
    check (response_timeout_minutes > 0);


-- ─────────────────────────────────────────────────────────────────
-- SECTION 3: ALTER activities
-- ─────────────────────────────────────────────────────────────────

alter table activities
    add column if not exists booking_enabled       boolean not null default false,
    add column if not exists available_slots       jsonb,        -- ["10:00 AM", "1:00 PM", "6:00 PM"]
    add column if not exists booking_days          jsonb,        -- ["monday", "tuesday", "saturday"]
    add column if not exists group_size_min        integer,
    add column if not exists group_size_max        integer,
    add column if not exists pricing_per_person    numeric(10, 2),
    add column if not exists cancellation_policy   text;

-- Sanity check: min must not exceed max
alter table activities
    add constraint activities_group_size_order
    check (
        group_size_min is null
        or group_size_max is null
        or group_size_min <= group_size_max
    );

-- GIN indexes for JSONB lookups
create index if not exists idx_activities_available_slots
    on activities using gin (available_slots);

create index if not exists idx_activities_booking_days
    on activities using gin (booking_days);


-- ─────────────────────────────────────────────────────────────────
-- SECTION 4: CREATE bookings table
--
-- FK design note:
--   activities.id   → uuid PK  → direct FK
--   places.name     → text PK  → FK on (name, city_id)
--   We store place_name + city_id on bookings to match existing schema.
-- ─────────────────────────────────────────────────────────────────

create table if not exists bookings (

    -- ── Core identity ────────────────────────────────────────────
    id                      uuid primary key default gen_random_uuid(),
    booking_reference       text unique not null,    -- e.g. OT-20240512-0042

    -- ── Foreign keys ─────────────────────────────────────────────
    activity_id             uuid not null references activities(id) on delete restrict,

    -- Place is keyed by (name, city_id) in your schema
    place_name              text not null,
    city_id                 text not null,

    -- ── Customer ─────────────────────────────────────────────────
    customer_name           text not null,
    customer_phone          text not null,
    customer_email          text,                    -- optional, for future email path

    -- ── Booking details ──────────────────────────────────────────
    booking_date            date not null,
    time_slot               text not null,           -- must match a value in activities.available_slots
    people_count            integer not null,

    -- ── Status lifecycle ─────────────────────────────────────────
    status                  booking_status not null default 'pending_vendor',
    booking_source          text not null default 'web',   -- 'web' | 'whatsapp' | 'admin'

    -- ── Operational / escalation ─────────────────────────────────
    response_deadline       timestamptz,             -- set at insert: created_at + timeout
    vendor_responded_at     timestamptz,
    internal_notes          text,

    -- ── Timestamps ───────────────────────────────────────────────
    created_at              timestamptz not null default now(),
    updated_at              timestamptz not null default now(),

    -- ── Composite FK: place_name + city_id → places ──────────────
    constraint fk_bookings_place
        foreign key (place_name, city_id)
        references places (name, city_id)
        on delete restrict
);


-- ─────────────────────────────────────────────────────────────────
-- SECTION 5: Constraints on bookings
-- ─────────────────────────────────────────────────────────────────

-- Phone: international format required
alter table bookings
    add constraint bookings_phone_format
    check (customer_phone ~ '^\+[1-9]\d{6,14}$');

-- People count must be at least 1
alter table bookings
    add constraint bookings_people_count_positive
    check (people_count >= 1);

-- Soft duplicate guard: same phone + activity + date (ignore rejected/expired)
create unique index if not exists bookings_duplicate_guard
    on bookings (activity_id, customer_phone, booking_date)
    where status not in ('rejected', 'expired');


-- ─────────────────────────────────────────────────────────────────
-- SECTION 6: Indexes on bookings
-- ─────────────────────────────────────────────────────────────────

-- Lookup by activity (vendor/ops view)
create index if not exists idx_bookings_activity_id
    on bookings (activity_id);

-- Lookup by place
create index if not exists idx_bookings_place_name
    on bookings (place_name, city_id);

-- Filter by status (ops dashboard)
create index if not exists idx_bookings_status
    on bookings (status);

-- Escalation cron: find pending bookings past deadline
create index if not exists idx_bookings_pending_deadline
    on bookings (response_deadline)
    where status = 'pending_vendor';

-- Customer self-lookup ("my bookings")
create index if not exists idx_bookings_customer_phone
    on bookings (customer_phone);

-- City-level ops reporting
create index if not exists idx_bookings_city_id
    on bookings (city_id);

-- Date-range queries
create index if not exists idx_bookings_booking_date
    on bookings (booking_date);


-- ─────────────────────────────────────────────────────────────────
-- SECTION 7: Auto-update updated_at trigger
-- ─────────────────────────────────────────────────────────────────

create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger bookings_set_updated_at
    before update on bookings
    for each row
    execute function update_updated_at_column();


-- ─────────────────────────────────────────────────────────────────
-- SECTION 8: Row Level Security (RLS)
-- ─────────────────────────────────────────────────────────────────

-- Enable RLS on bookings
alter table bookings enable row level security;

-- Anon users can INSERT (submit a booking request from the website)
create policy "anon_can_insert_bookings"
    on bookings
    for insert
    to anon
    with check (true);

-- Service role (Next.js API) has full access
create policy "service_role_full_access"
    on bookings
    for all
    to service_role
    using (true);


-- ─────────────────────────────────────────────────────────────────
-- SECTION 9: Verification queries (run after migration)
-- ─────────────────────────────────────────────────────────────────

-- Check new columns on places
-- select column_name, data_type, column_default
-- from information_schema.columns
-- where table_name = 'places'
-- order by ordinal_position;

-- Check new columns on activities
-- select column_name, data_type, column_default
-- from information_schema.columns
-- where table_name = 'activities'
-- order by ordinal_position;

-- Check bookings table
-- select column_name, data_type, column_default, is_nullable
-- from information_schema.columns
-- where table_name = 'bookings'
-- order by ordinal_position;

-- Check enum values
-- select enum_range(null::booking_status);

-- Check indexes
-- select indexname, indexdef
-- from pg_indexes
-- where tablename in ('bookings', 'activities', 'places')
-- order by tablename, indexname;
