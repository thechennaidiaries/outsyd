# Coordinate Enrichment Guide

This guide explains how to add `latitude` and `longitude` columns to your Supabase tables and populate them using the existing Google Maps URLs.

## Prerequisites

Ensure you have the following environment variables in your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key # Required for bypass RLS and updates
```

## Step 1: Update Database Schema

Run the SQL migration found in `scripts/migration.sql` in your Supabase SQL Editor.

This will add `latitude` and `longitude` columns (DOUBLE PRECISION) to both the `activities` and `events` tables.

## Step 2: Install Dependencies (if not already present)

The script uses `tsx` to run TypeScript directly and `node-fetch` (if on Node < 18). Since this project uses Next.js 14, you likely have everything you need. 

To be sure, run:
```bash
npm install -D tsx dotenv
```

## Step 3: Run the Enrichment Script

Run the following command from the root directory:

```bash
npx tsx scripts/enrichCoordinates.ts
```

### What the script does:
1.  Fetches all records from `activities` and `events` where `google_maps_url` is present but `latitude`/`longitude` are missing.
2.  Detects short URLs (e.g., `goo.gl`) and follows redirects to get the full URL.
3.  Uses regex patterns to extract coordinates from the URL (Supports `@lat,lng`, `!3dlat!4dlng`, and `q=lat,lng`).
4.  Updates the Supabase record with the extracted coordinates.
5.  Logs detailed progress and summaries.

### Important Notes:
- **No API Costs**: This script does NOT use the Google Geocoding API. It purely parses the URLs you already have.
- **Idempotent**: It will only process rows that don't have coordinates yet. You can run it multiple times as you add new data.
- **Safety**: It uses the Service Role key to perform updates. Ensure this key is kept secret and not used in the frontend.
