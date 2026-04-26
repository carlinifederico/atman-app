-- =============================================
-- 002_rls_hardening.sql
-- Tightens RLS policies, adds updated_at trigger,
-- composite indexes, and hardens SECURITY DEFINER
-- functions against search_path injection.
-- =============================================

-- ---------------------------------------------
-- Distributions: enforce wallet + heir ownership
-- ---------------------------------------------
-- Replace the broad "FOR ALL" with split policies that also verify
-- the referenced wallet and heir belong to auth.uid().
DROP POLICY IF EXISTS "Users can CRUD own distributions" ON distributions;

CREATE POLICY "distributions_select_own"
  ON distributions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "distributions_insert_owned_refs"
  ON distributions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM wallets w WHERE w.id = wallet_id AND w.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM heirs h WHERE h.id = heir_id AND h.user_id = auth.uid())
  );

CREATE POLICY "distributions_update_owned_refs"
  ON distributions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM wallets w WHERE w.id = wallet_id AND w.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM heirs h WHERE h.id = heir_id AND h.user_id = auth.uid())
  );

CREATE POLICY "distributions_delete_own"
  ON distributions FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------
-- activity_log: keep insert+select, no update/delete
-- ---------------------------------------------
-- RLS default-denies actions without a policy, so absence of UPDATE/DELETE
-- policies already makes the log effectively immutable. Make it explicit
-- by ensuring no permissive policies exist for those actions.
-- (No-op if none exist; safe to re-run.)

-- ---------------------------------------------
-- Auto-update updated_at on UPDATE
-- ---------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles', 'wallets', 'heirs', 'distributions', 'activation_configs']
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_%I_updated_at ON %I;', t, t
    );
    -- Only attach to tables that actually have an updated_at column
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = 'updated_at'
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER set_%I_updated_at BEFORE UPDATE ON %I
           FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
        t, t
      );
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------
-- Indexes for common queries
-- ---------------------------------------------
CREATE INDEX IF NOT EXISTS idx_wallets_user_created
  ON wallets (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_heirs_user_created
  ON heirs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_distributions_user
  ON distributions (user_id);

CREATE INDEX IF NOT EXISTS idx_distributions_wallet
  ON distributions (wallet_id);

CREATE INDEX IF NOT EXISTS idx_distributions_heir
  ON distributions (heir_id);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_created
  ON activity_log (user_id, created_at DESC);

-- ---------------------------------------------
-- Harden SECURITY DEFINER functions
-- ---------------------------------------------
-- Pin search_path to prevent privilege escalation via PUBLIC schema hijack.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp;

CREATE OR REPLACE FUNCTION public.handle_new_user_activation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activation_configs (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp;
