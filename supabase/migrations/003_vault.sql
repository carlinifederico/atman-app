-- =============================================
-- 003_vault.sql
-- Encrypted instructions vault. ATMAN never sees plaintext:
-- the ciphertext is opaque to the server (encrypted client-side
-- with a user-only passphrase via AES-GCM-256 + PBKDF2-SHA256).
-- =============================================

CREATE TABLE vault_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  heir_id UUID REFERENCES heirs(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  -- Crypto envelope: server treats these as opaque base64 strings.
  algo TEXT NOT NULL,
  ciphertext TEXT NOT NULL,
  nonce TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vault_entries ENABLE ROW LEVEL SECURITY;

-- Owner CRUD; heir read access is deferred to the activation/delivery
-- flow (Phase 2 follow-up: separate policy that grants SELECT to heirs
-- only after the activation condition has fired and been verified).
CREATE POLICY "vault_select_own" ON vault_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "vault_insert_owned_heir" ON vault_entries
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM heirs h WHERE h.id = heir_id AND h.user_id = auth.uid())
  );

CREATE POLICY "vault_update_owned_heir" ON vault_entries
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM heirs h WHERE h.id = heir_id AND h.user_id = auth.uid())
  );

CREATE POLICY "vault_delete_own" ON vault_entries
  FOR DELETE USING (auth.uid() = user_id);

-- updated_at auto-maintenance (function defined in 002_rls_hardening.sql)
CREATE TRIGGER set_vault_entries_updated_at
  BEFORE UPDATE ON vault_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_vault_entries_user_created
  ON vault_entries (user_id, created_at DESC);

CREATE INDEX idx_vault_entries_heir
  ON vault_entries (heir_id);
