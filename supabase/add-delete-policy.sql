-- Run this in Supabase SQL Editor if you already ran the main schema
-- and need to add product delete permission for admin

CREATE POLICY "Allow delete on products" ON products FOR DELETE USING (true);
