-- Run in Supabase SQL Editor to add multiple images support
-- Add image_urls array (keeps image_url for backward compatibility - first image)

ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Migrate existing image_url to image_urls if empty
UPDATE products 
SET image_urls = ARRAY[image_url]::TEXT[] 
WHERE image_url IS NOT NULL 
  AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);
