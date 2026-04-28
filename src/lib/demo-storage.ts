/**
 * Per-identity localStorage helpers.
 *
 * All demo data (wallets, heirs, distributions, vault entries, outbox)
 * is keyed by the current identity so multiple visitors of the demo
 * each have their own persistent state without colliding.
 *
 * Keys take the form `atman_scoped_<identity-slug>_<bucket>`.
 */

import { getIdentityKey } from "./identity";

function fullKey(bucket: string): string {
  return `atman_scoped_${getIdentityKey()}_${bucket}`;
}

export function readScoped<T>(bucket: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(fullKey(bucket));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeScoped<T>(bucket: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(fullKey(bucket), JSON.stringify(value));
}

export function removeScoped(bucket: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(fullKey(bucket));
}

/**
 * Read with seed: if the bucket is empty for this identity, write the
 * seed value and return it. Use to bootstrap demo data on first visit.
 */
export function readScopedOrSeed<T>(bucket: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  const raw = window.localStorage.getItem(fullKey(bucket));
  if (raw === null) {
    writeScoped(bucket, seed);
    return seed;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    writeScoped(bucket, seed);
    return seed;
  }
}
