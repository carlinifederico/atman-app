import { describe, it, expect } from "vitest";
import {
  encryptWithPassphrase,
  decryptWithPassphrase,
  type EncryptedBlob,
} from "@/lib/crypto/vault";

describe("vault encryption", () => {
  const passphrase = "correct horse battery staple";
  const plaintext = "Mi seed phrase está en la caja fuerte azul. PIN: 1234.";

  it("round-trips plaintext through encrypt/decrypt", async () => {
    const blob = await encryptWithPassphrase(plaintext, passphrase);
    const recovered = await decryptWithPassphrase(blob, passphrase);
    expect(recovered).toBe(plaintext);
  });

  it("uses the documented algo version", async () => {
    const blob = await encryptWithPassphrase(plaintext, passphrase);
    expect(blob.algo).toBe("AES-GCM-256/PBKDF2-SHA256-600k");
  });

  it("produces different ciphertext for the same input (random nonce/salt)", async () => {
    const a = await encryptWithPassphrase(plaintext, passphrase);
    const b = await encryptWithPassphrase(plaintext, passphrase);
    expect(a.ciphertext).not.toBe(b.ciphertext);
    expect(a.nonce).not.toBe(b.nonce);
    expect(a.salt).not.toBe(b.salt);
  });

  it("rejects decrypt with wrong passphrase", async () => {
    const blob = await encryptWithPassphrase(plaintext, passphrase);
    await expect(decryptWithPassphrase(blob, "wrong passphrase")).rejects.toThrow();
  });

  it("rejects decrypt of tampered ciphertext (AES-GCM auth)", async () => {
    const blob = await encryptWithPassphrase(plaintext, passphrase);
    // Flip last byte of ciphertext
    const ct = atob(blob.ciphertext);
    const tampered =
      ct.slice(0, -1) + String.fromCharCode((ct.charCodeAt(ct.length - 1) ^ 1) & 0xff);
    const bad: EncryptedBlob = { ...blob, ciphertext: btoa(tampered) };
    await expect(decryptWithPassphrase(bad, passphrase)).rejects.toThrow();
  });

  it("rejects unsupported algo version", async () => {
    const blob = await encryptWithPassphrase(plaintext, passphrase);
    const bad = { ...blob, algo: "ROT13/lol" } as unknown as EncryptedBlob;
    await expect(decryptWithPassphrase(bad, passphrase)).rejects.toThrow(/unsupported algo/i);
  });

  it("rejects empty passphrase", async () => {
    await expect(encryptWithPassphrase(plaintext, "")).rejects.toThrow();
  });

  it("preserves unicode and large payloads", async () => {
    const big = "🔐 ".repeat(5000) + "fin del mensaje.";
    const blob = await encryptWithPassphrase(big, passphrase);
    const recovered = await decryptWithPassphrase(blob, passphrase);
    expect(recovered).toBe(big);
  });
});
