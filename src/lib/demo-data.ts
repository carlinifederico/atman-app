import type { Wallet, Heir, Distribution, ActivationConfig, ActivityLog } from "./types";

const USER_ID = "demo-user-001";

export const DEMO_MODE =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "your_supabase_url_here";

export const DEMO_USER = {
  id: USER_ID,
  email: "carlos@atman.io",
  user_metadata: { full_name: "Carlos Rivera" },
};

export const DEMO_WALLETS: Wallet[] = [
  {
    id: "w1",
    user_id: USER_ID,
    label: "Bitcoin Principal",
    blockchain: "Bitcoin",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    encrypted_notes: "Cold wallet Ledger Nano X",
    balance: 1.847,
    created_at: "2025-11-15T10:00:00Z",
    updated_at: "2026-03-01T14:30:00Z",
  },
  {
    id: "w2",
    user_id: USER_ID,
    label: "Ethereum DeFi",
    blockchain: "Ethereum",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
    encrypted_notes: "MetaMask - cuenta principal DeFi",
    balance: 12.5,
    created_at: "2025-12-01T08:00:00Z",
    updated_at: "2026-02-20T11:15:00Z",
  },
  {
    id: "w3",
    user_id: USER_ID,
    label: "Solana Trading",
    blockchain: "Solana",
    address: "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV",
    encrypted_notes: "Phantom wallet",
    balance: 245.8,
    created_at: "2026-01-10T16:00:00Z",
    updated_at: "2026-03-10T09:45:00Z",
  },
];

export const DEMO_HEIRS: Heir[] = [
  {
    id: "h1",
    user_id: USER_ID,
    name: "Maria Rivera",
    email: "maria@email.com",
    wallet_address: "0x8ba1f109551bD432803012645Hac136c22C57ec",
    relationship: "Conyuge",
    created_at: "2025-11-20T10:00:00Z",
    updated_at: "2026-01-15T12:00:00Z",
  },
  {
    id: "h2",
    user_id: USER_ID,
    name: "Lucas Rivera",
    email: "lucas@email.com",
    wallet_address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    relationship: "Hijo/a",
    created_at: "2025-11-20T10:05:00Z",
    updated_at: "2026-01-15T12:00:00Z",
  },
  {
    id: "h3",
    user_id: USER_ID,
    name: "Sofia Rivera",
    email: "sofia@email.com",
    wallet_address: null,
    relationship: "Hijo/a",
    created_at: "2025-12-05T14:00:00Z",
    updated_at: "2026-02-01T10:00:00Z",
  },
];

export const DEMO_DISTRIBUTIONS: Distribution[] = [
  {
    id: "d1",
    user_id: USER_ID,
    wallet_id: "w1",
    heir_id: "h1",
    percentage: 50,
    created_at: "2026-01-20T10:00:00Z",
    updated_at: "2026-01-20T10:00:00Z",
  },
  {
    id: "d2",
    user_id: USER_ID,
    wallet_id: "w1",
    heir_id: "h2",
    percentage: 25,
    created_at: "2026-01-20T10:00:00Z",
    updated_at: "2026-01-20T10:00:00Z",
  },
  {
    id: "d3",
    user_id: USER_ID,
    wallet_id: "w1",
    heir_id: "h3",
    percentage: 25,
    created_at: "2026-01-20T10:00:00Z",
    updated_at: "2026-01-20T10:00:00Z",
  },
  {
    id: "d4",
    user_id: USER_ID,
    wallet_id: "w2",
    heir_id: "h1",
    percentage: 40,
    created_at: "2026-01-20T10:00:00Z",
    updated_at: "2026-01-20T10:00:00Z",
  },
  {
    id: "d5",
    user_id: USER_ID,
    wallet_id: "w2",
    heir_id: "h2",
    percentage: 30,
    created_at: "2026-01-20T10:00:00Z",
    updated_at: "2026-01-20T10:00:00Z",
  },
  {
    id: "d6",
    user_id: USER_ID,
    wallet_id: "w2",
    heir_id: "h3",
    percentage: 30,
    created_at: "2026-01-20T10:00:00Z",
    updated_at: "2026-01-20T10:00:00Z",
  },
  {
    id: "d7",
    user_id: USER_ID,
    wallet_id: "w3",
    heir_id: "h2",
    percentage: 60,
    created_at: "2026-01-20T10:00:00Z",
    updated_at: "2026-01-20T10:00:00Z",
  },
  {
    id: "d8",
    user_id: USER_ID,
    wallet_id: "w3",
    heir_id: "h3",
    percentage: 40,
    created_at: "2026-01-20T10:00:00Z",
    updated_at: "2026-01-20T10:00:00Z",
  },
];

export const DEMO_ACTIVATION: ActivationConfig = {
  id: "ac1",
  user_id: USER_ID,
  method: "inactivity",
  inactivity_days: 365,
  is_active: true,
  last_check_in: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  created_at: "2025-11-15T10:00:00Z",
  updated_at: "2026-03-13T09:00:00Z",
};

export const DEMO_ACTIVITIES: ActivityLog[] = [
  {
    id: "a1",
    user_id: USER_ID,
    action: "check_in",
    details: { timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a2",
    user_id: USER_ID,
    action: "distribution_updated",
    details: { wallet_id: "w3", entries: 2 },
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a3",
    user_id: USER_ID,
    action: "wallet_added",
    details: { label: "Solana Trading", blockchain: "Solana" },
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a4",
    user_id: USER_ID,
    action: "heir_added",
    details: { name: "Sofia Rivera", relationship: "Hijo/a" },
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a5",
    user_id: USER_ID,
    action: "plan_activated",
    details: { method: "inactivity" },
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a6",
    user_id: USER_ID,
    action: "distribution_updated",
    details: { wallet_id: "w1", entries: 3 },
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a7",
    user_id: USER_ID,
    action: "heir_added",
    details: { name: "Lucas Rivera", relationship: "Hijo/a" },
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a8",
    user_id: USER_ID,
    action: "wallet_added",
    details: { label: "Ethereum DeFi", blockchain: "Ethereum" },
    created_at: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
