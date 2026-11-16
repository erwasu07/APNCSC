-- ============================================================
-- CSC DOST Web Push Notification Schema Migration
-- Run in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Subscriber endpoints & encryption keys (unique on endpoint)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id TEXT PRIMARY KEY,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_type TEXT DEFAULT 'unknown',
  user_agent TEXT,
  subscribed_from TEXT DEFAULT '/',
  preferences JSONB DEFAULT '{"jobs": true, "schemes": true, "exams": true, "updates": true}'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  last_seen TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_delivery_at TIMESTAMPTZ
);

-- Add columns safely if table already existed from an earlier version
ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS subscribed_from TEXT DEFAULT '/',
  ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint
  ON public.push_subscriptions (endpoint);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_last_seen
  ON public.push_subscriptions (last_seen DESC);

-- 2. Notification delivery log (last 20+ broadcasts & tests)
CREATE TABLE IF NOT EXISTS public.push_notifications_log (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'all',
  url TEXT DEFAULT '/',
  post_id TEXT,
  stats JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ DEFAULT now(),
  sent_by TEXT DEFAULT 'Admin',
  is_test BOOLEAN DEFAULT false
);

ALTER TABLE public.push_notifications_log
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_push_notifications_log_sent_at
  ON public.push_notifications_log (sent_at DESC);

-- 3. Row-Level Security (safe defaults when backend connects via service role or anon)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'push_subscriptions' AND policyname = 'Allow server push_subscriptions access'
  ) THEN
    CREATE POLICY "Allow server push_subscriptions access"
      ON public.push_subscriptions
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'push_notifications_log' AND policyname = 'Allow server push_notifications_log access'
  ) THEN
    CREATE POLICY "Allow server push_notifications_log access"
      ON public.push_notifications_log
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
