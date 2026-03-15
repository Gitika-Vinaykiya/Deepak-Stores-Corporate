-- Run this SQL in your Supabase SQL Editor to set up the database

-- Price ranges (admin can add more)
CREATE TABLE price_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  min_price INTEGER NOT NULL,
  max_price INTEGER
);

-- Categories (admin can add more)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

-- Events (admin can add more)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

-- Products
-- For existing DBs: ALTER TABLE products ADD COLUMN IF NOT EXISTS generated_images JSONB DEFAULT NULL;
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  description TEXT,
  price_range_id UUID REFERENCES price_ranges(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  moq INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  generated_images JSONB DEFAULT NULL
);

-- Product-Events many-to-many
CREATE TABLE product_events (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, event_id)
);

-- Enable RLS (Row Level Security) - optional, adjust as needed
ALTER TABLE price_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_events ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for catalog browsing)
CREATE POLICY "Allow public read on price_ranges" ON price_ranges FOR SELECT USING (true);
CREATE POLICY "Allow public read on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read on events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow public read on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read on product_events" ON product_events FOR SELECT USING (true);

-- Allow insert/update for admin (use service role key for admin operations, or add auth)
-- For simplicity, we'll use anon key with policies - you may want to add auth later
CREATE POLICY "Allow insert on price_ranges" ON price_ranges FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert on categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert on events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert on products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert on product_events" ON product_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow delete on products" ON products FOR DELETE USING (true);

-- Storage bucket for product images
-- Create a bucket named 'product-images' in Supabase Dashboard > Storage
-- Set it to public for read access
