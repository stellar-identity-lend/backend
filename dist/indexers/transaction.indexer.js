"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionIndexer = void 0;
const stellar_sdk_1 = require("@stellar/stellar-sdk");
const config_1 = require("../config");
const credit_service_1 = require("../services/credit.service");
class TransactionIndexer {
    constructor() {
        // Derive Horizon URL from RPC URL (testnet convention)
        this.horizonUrl = config_1.config.rpcUrl.includes("testnet")
            ? "https://horizon-testnet.stellar.org"
            : "https://horizon.stellar.org";
        this.creditService = new credit_service_1.CreditService();
    }
    /** Fetch on-chain stats for a wallet and compute ScoreInput */
    async indexWallet(userAddress) {
        const server = new stellar_sdk_1.Horizon.Server(this.horizonUrl);
        const [account, payments] = await Promise.all([
            server.loadAccount(userAddress),
            server.payments().forAccount(userAddress).limit(200).call(),
        ]);
        const txCount = payments.records.length;
        // wallet_age: map ledger sequence to 0–1000 (cap at 1M ledgers ≈ ~2 years)
        const sequence = parseInt(account.sequence ?? "0", 10);
        const walletAgeLedgers = Math.min(Math.round((sequence / 1000000) * 1000), 1000);
        // tx_history: map tx count to 0–1000 (cap at 500 txs)
        const txHistory = Math.min(Math.round((txCount / 500) * 1000), 1000);
        return {
            tx_history: txHistory,
            repayment_rate: 0, // updated by loan-manager once built
            wallet_age: walletAgeLedgers,
        };
    }
    /** Index a wallet and push the score to the credit-engine contract */
    async indexAndUpdateScore(userAddress) {
        const input = await this.indexWallet(userAddress);
        await this.creditService.updateScore(userAddress, input);
        return input;
    }
}
exports.TransactionIndexer = TransactionIndexer;
