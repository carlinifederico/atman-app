import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchBalance,
  fetchEvmBalance,
  fetchBtcBalance,
  fetchSolBalance,
  BalanceFetchError,
} from "@/lib/onchain/balance";

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  }) as unknown as Response;
}

describe("fetchEvmBalance", () => {
  it("decodes hex wei to native units", async () => {
    // 0xde0b6b3a7640000 = 1e18 wei = 1 ETH
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse({ jsonrpc: "2.0", id: 1, result: "0xde0b6b3a7640000" })
    );
    const balance = await fetchEvmBalance("Ethereum", "0x0");
    expect(balance).toBe(1);
  });

  it("throws on unknown chain", async () => {
    await expect(fetchEvmBalance("Dogecoin", "0x0")).rejects.toThrow(BalanceFetchError);
  });

  it("propagates RPC error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse({ error: { message: "invalid address" } })
    );
    await expect(fetchEvmBalance("Ethereum", "0xbad")).rejects.toThrow(/invalid address/i);
  });
});

describe("fetchBtcBalance", () => {
  it("computes BTC from satoshi confirmed + mempool", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse({
        chain_stats: { funded_txo_sum: 200_000_000, spent_txo_sum: 50_000_000 },
        mempool_stats: { funded_txo_sum: 0, spent_txo_sum: 0 },
      })
    );
    const balance = await fetchBtcBalance("bc1q...");
    expect(balance).toBeCloseTo(1.5, 8);
  });

  it("includes mempool pending", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse({
        chain_stats: { funded_txo_sum: 100_000_000, spent_txo_sum: 0 },
        mempool_stats: { funded_txo_sum: 50_000_000, spent_txo_sum: 0 },
      })
    );
    expect(await fetchBtcBalance("bc1q...")).toBeCloseTo(1.5, 8);
  });
});

describe("fetchSolBalance", () => {
  it("converts lamports to SOL", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse({ jsonrpc: "2.0", id: 1, result: { value: 2_500_000_000 } })
    );
    const balance = await fetchSolBalance("Sol1...");
    expect(balance).toBeCloseTo(2.5, 9);
  });
});

describe("fetchBalance dispatcher", () => {
  it("dispatches to BTC fetcher", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse({
        chain_stats: { funded_txo_sum: 100_000_000, spent_txo_sum: 0 },
        mempool_stats: { funded_txo_sum: 0, spent_txo_sum: 0 },
      })
    );
    expect(await fetchBalance("Bitcoin", "bc1q...")).toBeCloseTo(1, 8);
  });

  it("dispatches to EVM fetcher for Ethereum", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse({ jsonrpc: "2.0", id: 1, result: "0x0" })
    );
    expect(await fetchBalance("Ethereum", "0x0")).toBe(0);
  });

  it("rejects empty address", async () => {
    await expect(fetchBalance("Ethereum", "")).rejects.toThrow(/address is required/i);
  });
});
