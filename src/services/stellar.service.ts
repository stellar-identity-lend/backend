import {
  Contract,
  Keypair,
  rpc,
  TransactionBuilder,
  BASE_FEE,
  xdr,
  nativeToScVal,
  scValToNative,
  Address,
} from "@stellar/stellar-sdk";
import { config } from "../config";

export class StellarService {
  private server: rpc.Server;
  private adminKeypair: Keypair;
  private networkPassphrase: string;

  constructor() {
    this.server = new rpc.Server(config.rpcUrl, { allowHttp: false });
    this.adminKeypair = Keypair.fromSecret(config.adminSecretKey);
    this.networkPassphrase = config.networkPassphrase;
  }

  /** Low-level: simulate + send a contract invocation signed by admin */
  async invokeContract(
    contractId: string,
    method: string,
    args: xdr.ScVal[]
  ): Promise<xdr.ScVal> {
    const contract = new Contract(contractId);
    const account = await this.server.getAccount(this.adminKeypair.publicKey());

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const simResult = await this.server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(simResult)) {
      throw new Error(`Simulation error: ${simResult.error}`);
    }

    const preparedTx = rpc.assembleTransaction(tx, simResult).build();
    preparedTx.sign(this.adminKeypair);

    const sendResult = await this.server.sendTransaction(preparedTx);
    if (sendResult.status === "ERROR") {
      throw new Error(`Send error: ${JSON.stringify(sendResult.errorResult)}`);
    }

    // Poll for confirmation
    let getResult = await this.server.getTransaction(sendResult.hash);
    for (
      let i = 0;
      i < 10 && getResult.status === rpc.Api.GetTransactionStatus.NOT_FOUND;
      i++
    ) {
      await new Promise((r) => setTimeout(r, 2000));
      getResult = await this.server.getTransaction(sendResult.hash);
    }

    if (getResult.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
      throw new Error(`Transaction failed: ${getResult.status}`);
    }

    return (getResult as rpc.Api.GetSuccessfulTransactionResponse).returnValue!;
  }

  /** Read-only simulation (no signing needed) */
  async queryContract(
    contractId: string,
    method: string,
    args: xdr.ScVal[]
  ): Promise<xdr.ScVal> {
    const contract = new Contract(contractId);
    const account = await this.server.getAccount(this.adminKeypair.publicKey());

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const simResult = await this.server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(simResult)) {
      throw new Error(`Simulation error: ${simResult.error}`);
    }

    const successSim = simResult as rpc.Api.SimulateTransactionSuccessResponse;
    return successSim.result!.retval;
  }

  addressToScVal(address: string): xdr.ScVal {
    return new Address(address).toScVal();
  }

  bytesToScVal(hex: string): xdr.ScVal {
    return xdr.ScVal.scvBytes(Buffer.from(hex, "hex"));
  }

  u32ToScVal(n: number): xdr.ScVal {
    return nativeToScVal(n, { type: "u32" });
  }

  scValToNative(val: xdr.ScVal): unknown {
    return scValToNative(val);
  }
}
