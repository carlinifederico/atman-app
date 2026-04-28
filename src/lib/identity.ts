/**
 * Demo identity layer.
 *
 * The DEMO_MODE app has no backend session, but each visitor needs
 * their own scoped state so the demo feels like a real account.
 * Identity is stored in localStorage as JSON; all per-user demo data
 * (wallets/heirs/distributions/vault/outbox) is then namespaced by
 * `getIdentityKey()`.
 *
 * This is NOT auth — there's no token, no server, no protected resource.
 * It's just a persistent identity for client-side data scoping.
 */

const STORAGE_KEY = "atman_identity";

export type IdentitySource = "google" | "demo";

export interface Identity {
  name: string;
  email?: string;
  picture?: string;
  source: IdentitySource;
}

export function getIdentity(): Identity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Identity;
    if (typeof parsed?.name !== "string" || !parsed.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setIdentity(identity: Identity): void {
  if (typeof window === "undefined") return;
  if (!identity?.name) throw new Error("identity.name is required");
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
}

export function clearIdentity(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * Slug suitable for namespacing localStorage keys. Idempotent + stable
 * for a given identity. Falls back to a fixed "anon" key when no identity
 * is set, but callers should generally avoid using scoped storage in
 * that case.
 */
export function getIdentityKey(identity?: Identity | null): string {
  const id = identity ?? getIdentity();
  if (!id) return "anon";
  // Prefer email for stability across name typos when source is google.
  // Demo identities use the name (sanitized).
  const seed = (id.source === "google" && id.email ? id.email : id.name).toLowerCase().trim();
  return seed.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "anon";
}

/**
 * Wipe all per-identity scoped storage for the given identity.
 * Used by logout to clean up. Does NOT touch the identity record itself.
 */
export function clearScopedStorage(identity: Identity): void {
  if (typeof window === "undefined") return;
  const key = getIdentityKey(identity);
  const prefix = `atman_scoped_${key}_`;
  const toRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(prefix)) toRemove.push(k);
  }
  for (const k of toRemove) window.localStorage.removeItem(k);
}
