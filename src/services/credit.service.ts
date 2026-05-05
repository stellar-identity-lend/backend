import { StellarService } from "./stellar.service";
import { config } from "../config";
import { CreditProfile, RiskTier, ScoreInput } from "../types";
import { xdr, nativeToScVal } from "@stellar/stellar-sdk";

export class CreditService {
  private stellar: StellarService;
  private contractId: string;

  constructor() {
    this.stellar = new StellarService();
    this.contractId = config.creditContractId;
  }

  async updateScore(userAddress: string, input: ScoreInput): Promise<void> {
    const inputScVal = xdr.ScVal.scvMap([
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("tx_history"),
        val: this.stellar.u32ToScVal(input.tx_history),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("repayment_rate"),
        val: this.stellar.u32ToScVal(input.repayment_rate),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("wallet_age"),
        val: this.stellar.u32ToScVal(input.wallet_age),
      }),
    ]);

    await this.stellar.invokeContract(this.contractId, "update_score", [
      this.stellar.addressToScVal(userAddress),
      inputScVal,
    ]);
  }

  async getCreditProfile(userAddress: string): Promise<CreditProfile | null> {
    try {
      const result = await this.stellar.queryContract(this.contractId, "get_score", [
        this.stellar.addressToScVal(userAddress),
      ]);
      const native = this.stellar.scValToNative(result) as any;
      return {
        score: native.score,
        risk_tier: native.risk_tier as RiskTier,
        updated_at: native.updated_at,
      };
    } catch {
      return null;
    }
  }

  async getRiskTier(userAddress: string): Promise<RiskTier | null> {
    try {
      const result = await this.stellar.queryContract(this.contractId, "get_risk_tier", [
        this.stellar.addressToScVal(userAddress),
      ]);
      return this.stellar.scValToNative(result) as RiskTier;
    } catch {
      return null;
    }
  }

  async meetsThreshold(userAddress: string, minScore: number): Promise<boolean> {
    const result = await this.stellar.queryContract(this.contractId, "meets_threshold", [
      this.stellar.addressToScVal(userAddress),
      this.stellar.u32ToScVal(minScore),
    ]);
    return this.stellar.scValToNative(result) as boolean;
  }
}
