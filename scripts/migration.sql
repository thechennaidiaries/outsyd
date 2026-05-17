-- Migration to add coordinates to activities and events tables
-- Run this in your Supabase SQL Editor

-- Add latitude and longitude to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add latitude and longitude to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

COMMENT ON COLUMN activities.latitude IS 'Extracted latitude from Google Maps URL';
COMMENT ON COLUMN activities.longitude IS 'Extracted longitude from Google Maps URL';
COMMENT ON COLUMN events.latitude IS 'Extracted latitude from Google Maps URL';
COMMENT ON COLUMN events.longitude IS 'Extracted longitude from Google Maps URL';
