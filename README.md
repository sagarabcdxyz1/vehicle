# FleetFlow Optimizer

FleetFlow is a full-stack Fleet & Trip Optimization SaaS demo built with React, Vite, Tailwind CSS, and Supabase.

## Features

- Google authentication with Supabase Auth
- Protected SaaS dashboard with KPI cards, charts, and alerts
- Route-based trip slot generation using travel, loading, and unloading times
- Order intake via manual form and CSV upload
- Best-fit order assignment using route, capacity, and delivery deadline
- Vehicle allocation priority: own -> agency -> on-call
- Realtime-ready data subscriptions for trips and vehicles
- GPS-style vehicle progress simulation every 5 seconds
- Demo mode fallback with mock data for immediate local use
- Dark mode toggle

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and add:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=http://localhost:5173
```

3. Run the SQL in `supabase/schema.sql`.

4. In Supabase Auth, enable Google provider and set the redirect URL to your app URL.

5. Start the app:

```bash
npm run dev
```

## Deploy on Vercel

1. Import the repo into Vercel.
2. Add the same `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_APP_URL` environment variables.
3. Set `VITE_APP_URL` to your Vercel production domain.
4. Redeploy after enabling Google auth redirect URLs for production.

## CSV format

```csv
route,weight,deadline
Mumbai -> Pune,8,2026-04-18T14:00
Delhi -> Jaipur,12,2026-04-18T18:30
```

## Notes

- Without Supabase variables, the app runs in demo mode and still showcases the entire SaaS workflow.
- Realtime subscriptions automatically take over once the Supabase project is connected.
