-- Library Items Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS library_items (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  subsidiary TEXT NOT NULL,
  request_type TEXT NOT NULL,
  title TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  stock_keywords TEXT[],
  graphic_suggestions TEXT[] NOT NULL,
  notes TEXT[],
  source_preview TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries by email
CREATE INDEX IF NOT EXISTS idx_library_items_user_email 
ON library_items(user_email);

-- Index for sorting by timestamp
CREATE INDEX IF NOT EXISTS idx_library_items_timestamp 
ON library_items(timestamp DESC);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own items
CREATE POLICY "Users can view own library items"
ON library_items FOR SELECT
USING (true); -- We'll handle auth in the app layer

-- Policy: Users can insert their own items
CREATE POLICY "Users can insert own library items"
ON library_items FOR INSERT
WITH CHECK (true);

-- Policy: Users can delete their own items
CREATE POLICY "Users can delete own library items"
ON library_items FOR DELETE
USING (true);

