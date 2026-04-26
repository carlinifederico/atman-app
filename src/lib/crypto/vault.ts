/**
 * Client-side vault for encrypted inheritance instructions.
 *
 * Security model:
 *   - The user's "vault passphrase" is NEVER sent to ATMAN.
 *   - ATMAN stores only opaque ciphertext + nonce + salt + algo version.
 *   - Encryption: AES-GCM-256 (authenticated).
 *   - KDF: PBKDF2-SHA256 with 600,000 iterations (OWASP 2023).
 *   - Per-blob random 16-byte salt and 12-byte nonce.
 *
 * The heir receives the ciphertext via notification when the activation
 * condition fires; the passphrase is shared out-of-band (e.g. in a will,
 * with a lawyer). Phase 3 work: replace out-of-band sharing with Shamir
 * Secret Sharing under a quorum of trustees.
 */

const ALGO_VERSION = "AES-GCM-256/PBKDF2-SHA256-600k" as const;
const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 16;
const NONCE_BYTES = 12;
const KEY_BITS = 256;

export type EncryptedBlob = {
  algo: typeof ALGO_VERSION;
  ciphertext: string; // base64
  nonce: string; // base64
  salt: string; // base64
};

function getCrypto(): Crypto {
  if (typeof globalThis.crypto?.subtle !== "object") {
    throw new Error("Web Crypto API is not available in this environment");
  }
  return globalThis.crypto;
}

function toB64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromB64(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s);
  const buf = new ArrayBuffer(bin.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function deriveKey(
  passphrase: string,
  salt: Uint8Array<ArrayBuffer>
): Promise<CryptoKey> {
  if (!passphrase) throw new Error("passphrase is required");
  const c = getCrypto();
  const baseKey = await c.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return c.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: KEY_BITS },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptWithPassphrase(
  plaintext: string,
  passphrase: string
): Promise<EncryptedBlob> {
  const c = getCrypto();
  const salt = c.getRandomValues(new Uint8Array(new ArrayBuffer(SALT_BYTES)));
  const nonce = c.getRandomValues(new Uint8Array(new ArrayBuffer(NONCE_BYTES)));
  const key = await deriveKey(passphrase, salt);
  const ct = new Uint8Array(
    await c.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, new TextEncoder().encode(plaintext))
  );
  return {
    algo: ALGO_VERSION,
    ciphertext: toB64(ct),
    nonce: toB64(nonce),
    salt: toB64(salt),
  };
}

export async function decryptWithPassphrase(
  blob: EncryptedBlob,
  passphrase: string
): Promise<string> {
  if (blob.algo !== ALGO_VERSION) {
    throw new Error(`unsupported algo version: ${blob.algo}`);
  }
  const c = getCrypto();
  const salt = fromB64(blob.salt);
  const nonce = fromB64(blob.nonce);
  const ct = fromB64(blob.ciphertext);
  const key = await deriveKey(passphrase, salt);
  const pt = await c.subtle.decrypt({ name: "AES-GCM", iv: nonce }, key, ct);
  return new TextDecoder().decode(pt);
}
