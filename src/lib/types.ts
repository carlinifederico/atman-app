export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  last_active_at: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  label: string;
  blockchain: string;
  address: string;
  encrypted_notes: string | null;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Heir {
  id: string;
  user_id: string;
  name: string;
  email: string;
  wallet_address: string | null;
  relationship: string;
  created_at: string;
  updated_at: string;
}

export interface Distribution {
  id: string;
  user_id: string;
  wallet_id: string;
  heir_id: string;
  percentage: number;
  created_at: string;
  updated_at: string;
}

export interface ActivationConfig {
  id: string;
  user_id: string;
  method: "inactivity" | "manual" | "multisig";
  inactivity_days: number;
  is_active: boolean;
  last_check_in: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export type BlockchainType =
  | "Bitcoin"
  | "Ethereum"
  | "Solana"
  | "Polygon"
  | "Avalanche"
  | "BNB Chain";

export type RelationshipType =
  | "Conyuge"
  | "Hijo/a"
  | "Hermano/a"
  | "Padre/Madre"
  | "Amigo/a"
  | "Socio/a"
  | "Otro";

export interface DistributionWithDetails extends Distribution {
  wallet?: Wallet;
  heir?: Heir;
}

export interface VaultEntry {
  id: string;
  user_id: string;
  heir_id: string;
  label: string;
  algo: string;
  ciphertext: string;
  nonce: string;
  salt: string;
  created_at: string;
  updated_at: string;
}
