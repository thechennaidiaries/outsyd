import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (safe to use in 'use client' components)
// Uses anon key — respects RLS policies
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
