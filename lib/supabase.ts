/**
 * Supabase client for database operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

