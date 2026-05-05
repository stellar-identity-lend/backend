"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StellarService = void 0;
const stellar_sdk_1 = require("@stellar/stellar-sdk");
const config_1 = require("../config");
class StellarService {
    constructor() {
        this.server = new stellar_sdk_1.rpc.Server(config_1.config.rpcUrl, { allowHttp: false });
        this.adminKeypair = stellar_sdk_1.Keypair.fromSecret(config_1.config.adminSecretKey);
        this.networkPassphrase = config_1.config.networkPassphrase;
    }
    /** Low-level: simulate + send a contract invocation signed by admin */
    async invokeContract(contractId, method, args) {
        const contract = new stellar_sdk_1.Contract(contractId);
        const account = await this.server.getAccount(this.adminKeypair.publicKey());
        const tx = new stellar_sdk_1.TransactionBuilder(account, {
            fee: stellar_sdk_1.BASE_FEE,
            networkPassphrase: this.networkPassphrase,
        })
            .addOperation(contract.call(method, ...args))
            .setTimeout(30)
            .build();
        const simResult = await this.server.simulateTransaction(tx);
        if (stellar_sdk_1.rpc.Api.isSimulationError(simResult)) {
            throw new Error(`Simulation error: ${simResult.error}`);
        }
        const preparedTx = stellar_sdk_1.rpc.assembleTransaction(tx, simResult).build();
        preparedTx.sign(this.adminKeypair);
        const sendResult = await this.server.sendTransaction(preparedTx);
        if (sendResult.status === "ERROR") {
            throw new Error(`Send error: ${JSON.stringify(sendResult.errorResult)}`);
        }
        // Poll for confirmation
        let getResult = await this.server.getTransaction(sendResult.hash);
        for (let i = 0; i < 10 && getResult.status === stellar_sdk_1.rpc.Api.GetTransactionStatus.NOT_FOUND; i++) {
            await new Promise((r) => setTimeout(r, 2000));
            getResult = await this.server.getTransaction(sendResult.hash);
        }
        if (getResult.status !== stellar_sdk_1.rpc.Api.GetTransactionStatus.SUCCESS) {
            throw new Error(`Transaction failed: ${getResult.status}`);
        }
        return getResult.returnValue;
    }
    /** Read-only simulation (no signing needed) */
    async queryContract(contractId, method, args) {
        const contract = new stellar_sdk_1.Contract(contractId);
        const account = await this.server.getAccount(this.adminKeypair.publicKey());
        const tx = new stellar_sdk_1.TransactionBuilder(account, {
            fee: stellar_sdk_1.BASE_FEE,
            networkPassphrase: this.networkPassphrase,
        })
            .addOperation(contract.call(method, ...args))
            .setTimeout(30)
            .build();
        const simResult = await this.server.simulateTransaction(tx);
        if (stellar_sdk_1.rpc.Api.isSimulationError(simResult)) {
            throw new Error(`Simulation error: ${simResult.error}`);
        }
        const successSim = simResult;
        return successSim.result.retval;
    }
    addressToScVal(address) {
        return new stellar_sdk_1.Address(address).toScVal();
    }
    bytesToScVal(hex) {
        return stellar_sdk_1.xdr.ScVal.scvBytes(Buffer.from(hex, "hex"));
    }
    u32ToScVal(n) {
        return (0, stellar_sdk_1.nativeToScVal)(n, { type: "u32" });
    }
    scValToNative(val) {
        return (0, stellar_sdk_1.scValToNative)(val);
    }
}
exports.StellarService = StellarService;
