"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityService = void 0;
const stellar_service_1 = require("./stellar.service");
const config_1 = require("../config");
const stellar_sdk_1 = require("@stellar/stellar-sdk");
class IdentityService {
    constructor() {
        this.stellar = new stellar_service_1.StellarService();
        this.contractId = config_1.config.identityContractId;
    }
    async registerIdentity(userAddress, identityHash) {
        await this.stellar.invokeContract(this.contractId, "register_identity", [
            this.stellar.addressToScVal(userAddress),
            this.stellar.bytesToScVal(identityHash),
        ]);
    }
    async verifyIdentity(userAddress, status) {
        const statusScVal = stellar_sdk_1.xdr.ScVal.scvSymbol(status);
        await this.stellar.invokeContract(this.contractId, "verify_identity", [
            this.stellar.addressToScVal(userAddress),
            statusScVal,
        ]);
    }
    async getIdentity(userAddress) {
        try {
            const result = await this.stellar.queryContract(this.contractId, "get_identity", [
                this.stellar.addressToScVal(userAddress),
            ]);
            const native = this.stellar.scValToNative(result);
            return {
                identity_hash: native.identity_hash.toString("hex"),
                status: native.status,
                registered_at: native.registered_at,
                updated_at: native.updated_at,
            };
        }
        catch {
            return null;
        }
    }
    async isVerified(userAddress) {
        const result = await this.stellar.queryContract(this.contractId, "is_verified", [
            this.stellar.addressToScVal(userAddress),
        ]);
        return this.stellar.scValToNative(result);
    }
}
exports.IdentityService = IdentityService;
