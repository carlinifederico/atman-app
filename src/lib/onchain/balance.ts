/**
 * Read-only balance fetchers using free public RPCs. No signup, no API keys.
 *
 * Public RPCs are rate-limited and not for production scale, but for
 * Phase 2 demo / beta they're enough. Swapping to Alchemy / Moralis later
 * is a one-line config change in the EVM_RPCS / chain endpoints map.
 */

const EVM_RPCS: Record<string, string> = {
  Ethereum: "https://cloudflare-eth.com",
  Polygon: "https://polygon-rpc.com",
  Avalanche: "https://api.avax.network/ext/bc/C/rpc",
  "BNB Chain": "https://bsc-dataseed.binance.org",
};

const EVM_DECIMALS = 18; // ETH, MATIC, AVAX, BNB are all 18-decimal native

const BTC_API = "https://blockstream.info/api";
const SOL_RPC = "https://api.mainnet-beta.solana.com";

export class BalanceFetchError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "BalanceFetchError";
  }
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new BalanceFetchError(`HTTP ${res.status} from ${url}`);
  return (await res.json()) as T;
}

export async function fetchEvmBalance(blockchain: string, address: string): Promise<number> {
  const rpc = EVM_RPCS[blockchain];
  if (!rpc) throw new BalanceFetchError(`No public RPC configured for ${blockchain}`);
  const data = await postJson<{ result?: string; error?: { message: string } }>(rpc, {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_getBalance",
    params: [address, "latest"],
  });
  if (data.error) throw new BalanceFetchError(data.error.message);
  if (!data.result) throw new BalanceFetchError("Empty result from RPC");
  const wei = BigInt(data.result);
  // Convert with one digit of precision loss tolerance for display
  return Number(wei) / 10 ** EVM_DECIMALS;
}

export async function fetchBtcBalance(address: string): Promise<number> {
  const res = await fetch(`${BTC_API}/address/${encodeURIComponent(address)}`);
  if (!res.ok) throw new BalanceFetchError(`HTTP ${res.status} from blockstream`);
  const data = (await res.json()) as {
    chain_stats: { funded_txo_sum: number; spent_txo_sum: number };
    mempool_stats: { funded_txo_sum: number; spent_txo_sum: number };
  };
  const confirmed = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
  const pending = data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum;
  return (confirmed + pending) / 1e8; // satoshis → BTC
}

export async function fetchSolBalance(address: string): Promise<number> {
  const data = await postJson<{ result?: { value: number }; error?: { message: string } }>(
    SOL_RPC,
    {
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [address],
    }
  );
  if (data.error) throw new BalanceFetchError(data.error.message);
  if (!data.result) throw new BalanceFetchError("Empty result from Solana RPC");
  return data.result.value / 1e9; // lamports → SOL
}

export async function fetchBalance(blockchain: string, address: string): Promise<number> {
  if (!address) throw new BalanceFetchError("address is required");
  if (blockchain === "Bitcoin") return fetchBtcBalance(address);
  if (blockchain === "Solana") return fetchSolBalance(address);
  return fetchEvmBalance(blockchain, address);
}

export const SUPPORTED_CHAINS = [
  "Bitcoin",
  "Ethereum",
  "Solana",
  "Polygon",
  "Avalanche",
  "BNB Chain",
] as const;
