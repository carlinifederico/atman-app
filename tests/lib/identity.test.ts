import { describe, it, expect, beforeEach } from "vitest";
import {
  getIdentity,
  setIdentity,
  clearIdentity,
  getIdentityKey,
  clearScopedStorage,
} from "@/lib/identity";

beforeEach(() => {
  window.localStorage.clear();
});

describe("identity", () => {
  it("returns null when no identity is set", () => {
    expect(getIdentity()).toBeNull();
  });

  it("round-trips identity", () => {
    setIdentity({ name: "Federico", source: "demo" });
    expect(getIdentity()).toEqual({ name: "Federico", source: "demo" });
  });

  it("rejects identity without name", () => {
    expect(() => setIdentity({ name: "" } as never)).toThrow();
  });

  it("clears identity", () => {
    setIdentity({ name: "Test", source: "demo" });
    clearIdentity();
    expect(getIdentity()).toBeNull();
  });

  it("getIdentityKey produces stable slug for demo source", () => {
    expect(getIdentityKey({ name: "María Rivera", source: "demo" })).toBe("mar-a-rivera");
  });

  it("getIdentityKey prefers email for google source", () => {
    expect(
      getIdentityKey({
        name: "John Doe",
        email: "John.Doe@example.com",
        source: "google",
      })
    ).toBe("john-doe-example-com");
  });

  it("getIdentityKey falls back to anon when nothing is set", () => {
    expect(getIdentityKey(null)).toBe("anon");
  });

  it("clearScopedStorage removes only matching prefix", () => {
    const fede = { name: "Federico", source: "demo" as const };
    const otro = { name: "Otro", source: "demo" as const };
    window.localStorage.setItem(
      `atman_scoped_${getIdentityKey(fede)}_wallets`,
      JSON.stringify([1, 2])
    );
    window.localStorage.setItem(
      `atman_scoped_${getIdentityKey(otro)}_wallets`,
      JSON.stringify([3])
    );
    window.localStorage.setItem("atman_unrelated", "stay");

    clearScopedStorage(fede);

    expect(window.localStorage.getItem(`atman_scoped_${getIdentityKey(fede)}_wallets`)).toBeNull();
    expect(
      window.localStorage.getItem(`atman_scoped_${getIdentityKey(otro)}_wallets`)
    ).not.toBeNull();
    expect(window.localStorage.getItem("atman_unrelated")).toBe("stay");
  });
});
