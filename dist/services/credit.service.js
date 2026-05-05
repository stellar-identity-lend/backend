"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditService = void 0;
const stellar_service_1 = require("./stellar.service");
const config_1 = require("../config");
const stellar_sdk_1 = require("@stellar/stellar-sdk");
class CreditService {
    constructor() {
        this.stellar = new stellar_service_1.StellarService();
        this.contractId = config_1.config.creditContractId;
    }
    async updateScore(userAddress, input) {
        const inputScVal = stellar_sdk_1.xdr.ScVal.scvMap([
            new stellar_sdk_1.xdr.ScMapEntry({
                key: stellar_sdk_1.xdr.ScVal.scvSymbol("tx_history"),
                val: this.stellar.u32ToScVal(input.tx_history),
            }),
            new stellar_sdk_1.xdr.ScMapEntry({
                key: stellar_sdk_1.xdr.ScVal.scvSymbol("repayment_rate"),
                val: this.stellar.u32ToScVal(input.repayment_rate),
            }),
            new stellar_sdk_1.xdr.ScMapEntry({
                key: stellar_sdk_1.xdr.ScVal.scvSymbol("wallet_age"),
                val: this.stellar.u32ToScVal(input.wallet_age),
            }),
        ]);
        await this.stellar.invokeContract(this.contractId, "update_score", [
            this.stellar.addressToScVal(userAddress),
            inputScVal,
        ]);
    }
    async getCreditProfile(userAddress) {
        try {
            const result = await this.stellar.queryContract(this.contractId, "get_score", [
                this.stellar.addressToScVal(userAddress),
            ]);
            const native = this.stellar.scValToNative(result);
            return {
                score: native.score,
                risk_tier: native.risk_tier,
                updated_at: native.updated_at,
            };
        }
        catch {
            return null;
        }
    }
    async getRiskTier(userAddress) {
        try {
            const result = await this.stellar.queryContract(this.contractId, "get_risk_tier", [
                this.stellar.addressToScVal(userAddress),
            ]);
            return this.stellar.scValToNative(result);
        }
        catch {
            return null;
        }
    }
    async meetsThreshold(userAddress, minScore) {
        const result = await this.stellar.queryContract(this.contractId, "meets_threshold", [
            this.stellar.addressToScVal(userAddress),
            this.stellar.u32ToScVal(minScore),
        ]);
        return this.stellar.scValToNative(result);
    }
}
exports.CreditService = CreditService;
