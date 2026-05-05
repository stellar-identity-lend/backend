import dotenv from "dotenv";
dotenv.config();

export const config = {
  identityContractId: process.env.IDENTITY_REGISTRY_CONTRACT_ID ?? "",
  creditContractId: process.env.CREDIT_ENGINE_CONTRACT_ID ?? "",
  adminSecretKey: process.env.ADMIN_SECRET_KEY ?? "",
  rpcUrl: process.env.STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org",
  networkPassphrase:
    process.env.STELLAR_NETWORK_PASSPHRASE ??
    "Test SDF Network ; September 2015",
  port: parseInt(process.env.PORT ?? "3000", 10),
};
