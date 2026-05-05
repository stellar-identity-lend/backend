import { StellarService } from "./stellar.service";
import { config } from "../config";
import { Identity, VerificationStatus } from "../types";
import { xdr } from "@stellar/stellar-sdk";

export class IdentityService {
  private stellar: StellarService;
  private contractId: string;

  constructor() {
    this.stellar = new StellarService();
    this.contractId = config.identityContractId;
  }

  async registerIdentity(userAddress: string, identityHash: string): Promise<void> {
    await this.stellar.invokeContract(this.contractId, "register_identity", [
      this.stellar.addressToScVal(userAddress),
      this.stellar.bytesToScVal(identityHash),
    ]);
  }

  async verifyIdentity(userAddress: string, status: VerificationStatus): Promise<void> {
    const statusScVal = xdr.ScVal.scvSymbol(status);
    await this.stellar.invokeContract(this.contractId, "verify_identity", [
      this.stellar.addressToScVal(userAddress),
      statusScVal,
    ]);
  }

  async getIdentity(userAddress: string): Promise<Identity | null> {
    try {
      const result = await this.stellar.queryContract(this.contractId, "get_identity", [
        this.stellar.addressToScVal(userAddress),
      ]);
      const native = this.stellar.scValToNative(result) as any;
      return {
        identity_hash: native.identity_hash.toString("hex"),
        status: native.status as VerificationStatus,
        registered_at: native.registered_at,
        updated_at: native.updated_at,
      };
    } catch {
      return null;
    }
  }

  async isVerified(userAddress: string): Promise<boolean> {
    const result = await this.stellar.queryContract(this.contractId, "is_verified", [
      this.stellar.addressToScVal(userAddress),
    ]);
    return this.stellar.scValToNative(result) as boolean;
  }
}
