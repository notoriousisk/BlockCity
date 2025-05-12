import type { Timestamp } from "firebase/firestore";

export interface GameBackendLevel {
  id: number;
  index: number;
  columns: number;
  rows: number;
  minMatchLength: number;
  scoreMultiplier: number;
  movesLimit: number;
  colorsLimit: number;
  requiredScore: number;
  grid: number[];
  energyCost: number;
  reward: number;
}

export interface Assets {
  showAvailableMoves: number;
  aiAssistant: number;
}

export interface ActiveBoosts {
  showAvailableMoves?: { expiresAt: number };
  aiAssistant?: { expiresAt: number };
}

export interface UserDoc {
  telegramId: string;
  walletAddress: string;
  balance: number;
  energy: number;
  assets: Assets;
  currentLevelId: number;
  numberOfRefs: number;
  referralMultiplier: number;
  lastEnergyUpdate: Timestamp;
  energyRefillRateMs: number;
  referredBy?: string | null;
  activeBoosts?: ActiveBoosts;
}

export const ASSET_COSTS = {
  showAvailableMoves: 200,
  aiAssistant: 600,
};

export interface ToastProps {
  title: string;
  content?: string;
  type?: "success" | "error" | "warning";
  variant?: "default" | "compact";
}
