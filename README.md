# Corporate Gifting Catalog

A lightweight web app for browsing corporate gifts by price range, category, and event. Users can shortlist products and contact the vendor via call or WhatsApp.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Supabase** (database + storage)
- **Vercel** compatible

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon/public key** from Settings → API

### 2. Run SQL Schema

In Supabase Dashboard → SQL Editor, run the contents of `supabase/schema.sql`:

- Creates `price_ranges`, `categories`, `events`, `products`, `product_events` tables
- Sets up RLS policies for public read and insert
- Creates storage bucket: **product-images** (create manually in Storage if needed, set to public)

### 3. Create Storage Bucket

1. Supabase Dashboard → Storage → New bucket
2. Name: `product-images`
3. Set to **Public** (for product image URLs)

### 4. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_VENDOR_PHONE=919876543210
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
ADMIN_PASSWORD=your-secure-admin-password
```

Replace with your Supabase credentials, vendor contact numbers, and a secure admin password.

**Admin access**: Visit `/admin` and enter the password. The Admin link is only visible when logged in.

### 5. Image Domains (if needed)

If product images don't load, add your Supabase hostname to `next.config.ts`:

```ts
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "your-project-ref.supabase.co",
      pathname: "/storage/v1/object/public/**",
    },
  ],
},
```

### 6. Run Dev Server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seed Data (Optional)

Add initial price ranges, categories, and events via the Admin page at `/admin`, then add products.

## Features

- **Home**: Browse by price range, category, event
- **Product listing**: Grid of products with Add to Shortlist
- **Product detail**: Full info + Add to Shortlist
- **Shortlist**: Persisted in localStorage, Call/WhatsApp vendor buttons
- **Search**: Product name search in header
- **Admin**: Add/edit products, price ranges, categories, events; image upload (JPEG, PNG, WebP, GIF) with camera capture on mobile; password-protected

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_VENDOR_PHONE`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `ADMIN_PASSWORD`
4. Deploy
