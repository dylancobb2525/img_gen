/**
 * Supabase client for database operations
 * Returns null if credentials are not configured
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = 
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Database types
export interface LibraryItemDB {
  id: string;
  user_email: string;
  timestamp: number;
  subsidiary: string;
  request_type: string;
  title: string;
  alt_text: string;
  stock_keywords: string[] | null;
  graphic_suggestions: string[];
  notes: string[] | null;
  source_preview: string;
  created_at?: string;
}

