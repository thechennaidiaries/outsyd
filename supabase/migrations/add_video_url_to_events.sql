-- SQL Migration: Add video_url to events table
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)

ALTER TABLE events ADD COLUMN IF NOT EXISTS video_url TEXT;
