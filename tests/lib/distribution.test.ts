import { describe, it, expect } from "vitest";
import { totalPercentage, isValidDistribution, groupByWallet } from "@/lib/distribution";
import { DEMO_DISTRIBUTIONS } from "@/lib/demo-data";

describe("totalPercentage", () => {
  it("returns 0 for empty list", () => {
    expect(totalPercentage([])).toBe(0);
  });

  it("sums percentages correctly", () => {
    expect(totalPercentage([{ percentage: 30 }, { percentage: 70 }])).toBe(100);
  });

  it("handles fractional percentages", () => {
    expect(
      totalPercentage([{ percentage: 33.3 }, { percentage: 33.3 }, { percentage: 33.4 }])
    ).toBeCloseTo(100, 5);
  });
});

describe("isValidDistribution", () => {
  it("accepts entries summing to exactly 100", () => {
    expect(isValidDistribution([{ percentage: 50 }, { percentage: 50 }])).toBe(true);
  });

  it("rejects entries summing below 100", () => {
    expect(isValidDistribution([{ percentage: 99 }])).toBe(false);
  });

  it("rejects entries summing above 100", () => {
    expect(isValidDistribution([{ percentage: 60 }, { percentage: 60 }])).toBe(false);
  });

  it("rejects empty list", () => {
    expect(isValidDistribution([])).toBe(false);
  });
});

describe("groupByWallet", () => {
  it("returns empty object for no distributions", () => {
    expect(groupByWallet([])).toEqual({});
  });

  it("aggregates percentages per wallet_id", () => {
    const result = groupByWallet(DEMO_DISTRIBUTIONS);
    expect(result.w1).toBe(100);
    expect(result.w2).toBe(100);
    expect(result.w3).toBe(100);
  });
});

describe("DEMO_DISTRIBUTIONS integrity", () => {
  it("each wallet's distributions sum to exactly 100%", () => {
    const totals = groupByWallet(DEMO_DISTRIBUTIONS);
    for (const [walletId, total] of Object.entries(totals)) {
      expect(total, `wallet ${walletId} should sum to 100`).toBe(100);
    }
  });
});
