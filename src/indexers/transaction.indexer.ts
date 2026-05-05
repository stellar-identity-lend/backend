import { Horizon } from "@stellar/stellar-sdk";
import { config } from "../config";
import { CreditService } from "../services/credit.service";
import { ScoreInput } from "../types";

interface TxStats {
  txCount: number;
  walletAgeLedgers: number;
  repaymentRate: number; // 0–1000
}

export class TransactionIndexer {
  private horizonUrl: string;
  private creditService: CreditService;

  constructor() {
    // Derive Horizon URL from RPC URL (testnet convention)
    this.horizonUrl = config.rpcUrl.includes("testnet")
      ? "https://horizon-testnet.stellar.org"
      : "https://horizon.stellar.org";
    this.creditService = new CreditService();
  }

  /** Fetch on-chain stats for a wallet and compute ScoreInput */
  async indexWallet(userAddress: string): Promise<ScoreInput> {
    const server = new Horizon.Server(this.horizonUrl);

    const [account, payments] = await Promise.all([
      server.loadAccount(userAddress),
      server.payments().forAccount(userAddress).limit(200).call(),
    ]);

    const txCount = payments.records.length;

    // wallet_age: map ledger sequence to 0–1000 (cap at 1M ledgers ≈ ~2 years)
    const sequence = parseInt((account as any).sequence ?? "0", 10);
    const walletAgeLedgers = Math.min(Math.round((sequence / 1_000_000) * 1000), 1000);

    // tx_history: map tx count to 0–1000 (cap at 500 txs)
    const txHistory = Math.min(Math.round((txCount / 500) * 1000), 1000);

    return {
      tx_history: txHistory,
      repayment_rate: 0, // updated by loan-manager once built
      wallet_age: walletAgeLedgers,
    };
  }

  /** Index a wallet and push the score to the credit-engine contract */
  async indexAndUpdateScore(userAddress: string): Promise<ScoreInput> {
    const input = await this.indexWallet(userAddress);
    await this.creditService.updateScore(userAddress, input);
    return input;
  }
}
