import type { BlockchainType, RelationshipType } from "./types";

export const BLOCKCHAINS: { value: BlockchainType; label: string; icon: string }[] = [
  { value: "Bitcoin", label: "Bitcoin", icon: "BTC" },
  { value: "Ethereum", label: "Ethereum", icon: "ETH" },
  { value: "Solana", label: "Solana", icon: "SOL" },
  { value: "Polygon", label: "Polygon", icon: "MATIC" },
  { value: "Avalanche", label: "Avalanche", icon: "AVAX" },
  { value: "BNB Chain", label: "BNB Chain", icon: "BNB" },
];

export const RELATIONSHIPS: RelationshipType[] = [
  "Conyuge",
  "Hijo/a",
  "Hermano/a",
  "Padre/Madre",
  "Amigo/a",
  "Socio/a",
  "Otro",
];

export const ACTIVATION_METHODS = [
  {
    value: "inactivity" as const,
    label: "Inactividad",
    description: "Se activa automaticamente despues de un periodo de inactividad",
  },
  {
    value: "manual" as const,
    label: "Manual",
    description: "Se activa manualmente por personas designadas",
  },
  {
    value: "multisig" as const,
    label: "Multifirma",
    description: "Requiere multiples firmas para activar (proximamente)",
    disabled: true,
  },
];

export const CHART_COLORS = [
  "#D4A843",
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
];
