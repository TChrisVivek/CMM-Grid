-- CMM Grid — Full Database Reset
-- RUN THIS IN THE SUPABASE SQL EDITOR TO CLEAR ALL DATA AND START FRESH.
-- After running this, the first person to log in via Google will become ADMIN.

-- ─── 1. Clear all operational & user tables ───────────────────────────────────
TRUNCATE TABLE
  payments,
  attendance,
  assignments,
  usages,
  allocations,
  client_payments,
  direct_purchases,
  workers,
  projects,
  products,
  system_users
RESTART IDENTITY CASCADE;

-- ─── 2. Ensure base settings row exists ──────────────────────────────────────
INSERT INTO settings (id) VALUES (1) ON CONFLICT DO NOTHING;
