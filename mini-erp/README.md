# Mini ERP (Free, Public MVP)

A lightweight ERP MVP with **Items**, **Inventory**, **Sales**, **Procurement**, and **Manufacturing** (BOM + MO) built with **Next.js (App Router)**, **Tailwind**, and **Supabase**.

- Public by default (no login required): uses Supabase anon key with permissive RLS policies for MVP.
- Modern responsive UI (Tailwind).
- Easy to deploy on **Vercel** + **Supabase**.

> ⚠️ For production, lock down RLS and add auth + roles.

## Features

- **Items**: CRUD items (SKU, name, unit).
- **Inventory**: Real-time on-hand computed from `stock_transactions`; quick +/- adjustment.
- **Sales**: Quick sales issue (reduces inventory).
- **Procurement**: Quick receipt (increases inventory).
- **Manufacturing**: Define BOMs, create MO to consume components and produce finished goods.

## 1) Create Supabase project

1. Go to supabase.com → New Project.
2. Get your **Project URL** and **anon key** from Project Settings → API.
3. Open SQL Editor, run the contents of **`supabase.sql`** in this repo (creates tables and open RLS policies).

## 2) Configure env

Copy `.env.local.example` to `.env.local` and fill:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 3) Run locally

```bash
npm i
npm run dev
# open http://localhost:3000
```

## 4) Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Import the repo on vercel.com (New Project).
3. Add the two env vars to Vercel project (Settings → Environment Variables).
4. Deploy. You’ll get a public URL, e.g. `https://your-mini-erp.vercel.app`.

## Tighten Security Later

- Enable Supabase Auth (email/password, OAuth).
- Replace permissive RLS with role-based policies (examples included in comments in `supabase.sql`).
