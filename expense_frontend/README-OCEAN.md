# Expense Tracker Frontend (Ocean Professional)

Modern React dashboard to track expenses, analyze spending, upload receipts, and view real-time budget insights. Uses Supabase for auth, database, and storage.

## Setup

1) Install dependencies
   npm install

2) Configure environment
   - Copy .env.example to .env and set:
     REACT_APP_SUPABASE_URL
     REACT_APP_SUPABASE_KEY
     REACT_APP_SITE_URL (optional, used for sign-up redirect)

3) Supabase schema (minimum)
   - Table: expenses
     Columns:
       id: uuid (pk, default gen_random_uuid())
       user_id: uuid (index)
       title: text
       amount: numeric
       category: text
       date: timestamptz
       notes: text
       receipt_url: text (nullable)
   - Storage bucket: receipts (public)

4) Run dev server
   npm start

## Features
- Email/password authentication
- Create, update, delete expenses
- Filter by category and date range
- Summary cards and insights charts
- Upload receipts to Supabase Storage and link to expenses
- Ocean Professional theme (blue & amber accents), responsive layout

## Notes
- Ensure RLS policies allow users to access only their data (user_id = auth.uid()).
- The app reads env vars via CRA's REACT_APP_ prefix.
