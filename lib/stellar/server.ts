import { Horizon } from "@stellar/stellar-sdk";

export const server = new Horizon.Server(
    "https://horizon-testnet.stellar.org"
);
