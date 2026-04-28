import { describe, it, expect, beforeEach } from "vitest";
import { readScoped, writeScoped, readScopedOrSeed, removeScoped } from "@/lib/demo-storage";
import { setIdentity, clearIdentity } from "@/lib/identity";

beforeEach(() => {
  window.localStorage.clear();
  clearIdentity();
});

describe("demo-storage", () => {
  it("returns fallback when bucket is empty", () => {
    setIdentity({ name: "Federico", source: "demo" });
    expect(readScoped<number[]>("wallets", [])).toEqual([]);
  });

  it("round-trips values per bucket", () => {
    setIdentity({ name: "Federico", source: "demo" });
    writeScoped("wallets", [{ id: 1 }]);
    expect(readScoped<{ id: number }[]>("wallets", [])).toEqual([{ id: 1 }]);
  });

  it("isolates buckets per identity", () => {
    setIdentity({ name: "Federico", source: "demo" });
    writeScoped("wallets", ["fede-wallet"]);

    setIdentity({ name: "Otro", source: "demo" });
    writeScoped("wallets", ["otro-wallet"]);
    expect(readScoped<string[]>("wallets", [])).toEqual(["otro-wallet"]);

    setIdentity({ name: "Federico", source: "demo" });
    expect(readScoped<string[]>("wallets", [])).toEqual(["fede-wallet"]);
  });

  it("readScopedOrSeed writes seed when empty", () => {
    setIdentity({ name: "Federico", source: "demo" });
    const out = readScopedOrSeed("wallets", ["seed1"]);
    expect(out).toEqual(["seed1"]);
    expect(readScoped<string[]>("wallets", [])).toEqual(["seed1"]);
  });

  it("readScopedOrSeed does not overwrite existing data", () => {
    setIdentity({ name: "Federico", source: "demo" });
    writeScoped("wallets", ["existing"]);
    const out = readScopedOrSeed("wallets", ["seed1"]);
    expect(out).toEqual(["existing"]);
  });

  it("removeScoped only affects the specified bucket", () => {
    setIdentity({ name: "Federico", source: "demo" });
    writeScoped("wallets", ["w"]);
    writeScoped("heirs", ["h"]);
    removeScoped("wallets");
    expect(readScoped<string[]>("wallets", [])).toEqual([]);
    expect(readScoped<string[]>("heirs", [])).toEqual(["h"]);
  });
});
