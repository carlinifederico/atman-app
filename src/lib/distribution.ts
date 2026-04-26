import type { Distribution } from "./types";

export type DistributionEntry = { heir_id: string; percentage: number };

export function totalPercentage(entries: ReadonlyArray<{ percentage: number }>): number {
  return entries.reduce((sum, e) => sum + e.percentage, 0);
}

export function isValidDistribution(entries: ReadonlyArray<{ percentage: number }>): boolean {
  return totalPercentage(entries) === 100;
}

export function groupByWallet(distributions: ReadonlyArray<Distribution>): Record<string, number> {
  return distributions.reduce<Record<string, number>>((acc, d) => {
    acc[d.wallet_id] = (acc[d.wallet_id] ?? 0) + d.percentage;
    return acc;
  }, {});
}
