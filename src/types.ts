export enum VerificationStatus {
  Unverified = "Unverified",
  Pending = "Pending",
  Verified = "Verified",
  Revoked = "Revoked",
}

export enum RiskTier {
  Low = "Low",
  Medium = "Medium",
  High = "High",
}

export interface Identity {
  identity_hash: string;
  status: VerificationStatus;
  registered_at: number;
  updated_at: number;
}

export interface ScoreInput {
  tx_history: number;   // 0–1000
  repayment_rate: number; // 0–1000
  wallet_age: number;   // 0–1000
}

export interface CreditProfile {
  score: number;
  risk_tier: RiskTier;
  updated_at: number;
}

export function scoreToRiskTier(score: number): RiskTier {
  if (score >= 700) return RiskTier.Low;
  if (score >= 400) return RiskTier.Medium;
  return RiskTier.High;
}

export function computeScore(input: ScoreInput): number {
  return Math.round(
    (input.tx_history * 30 + input.repayment_rate * 50 + input.wallet_age * 20) / 100
  );
}
