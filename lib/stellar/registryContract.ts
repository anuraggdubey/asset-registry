import {
    contract as StellarContract,
    nativeToScVal,
    Networks,
    scValToNative,
} from "@stellar/stellar-sdk";
import { kit } from "@/lib/state/walletStore";

const DEFAULT_RPC_URL = "https://soroban-testnet.stellar.org";

function getRpcUrl() {
    return process.env.NEXT_PUBLIC_STELLAR_RPC_URL || DEFAULT_RPC_URL;
}

function getContractId() {
    const contractId = process.env.NEXT_PUBLIC_STELLAR_REGISTRY_CONTRACT_ID;

    if (!contractId) {
        throw new Error(
            "Missing NEXT_PUBLIC_STELLAR_REGISTRY_CONTRACT_ID. Deploy the Soroban registry contract and add its contract ID to your environment."
        );
    }

    return contractId;
}

function requireWalletKit() {
    if (!kit) {
        throw new Error("Wallet kit is unavailable in the current runtime.");
    }

    return kit;
}

async function buildRegistryCall(method: string, args: unknown[], publicKey?: string) {
    return StellarContract.AssembledTransaction.build({
        contractId: getContractId(),
        method,
        args: args.map((arg) => nativeToScVal(arg)),
        rpcUrl: getRpcUrl(),
        networkPassphrase: Networks.TESTNET,
        publicKey,
        parseResultXdr: scValToNative,
        signTransaction: async (xdr, opts) => {
            const walletKit = requireWalletKit();
            return walletKit.signTransaction(xdr, {
                ...opts,
                networkPassphrase: Networks.TESTNET,
            });
        },
        signAuthEntry: async (entryXdr, opts) => {
            const walletKit = requireWalletKit();
            return walletKit.signAuthEntry(entryXdr, {
                ...opts,
                networkPassphrase: Networks.TESTNET,
            });
        },
        timeoutInSeconds: 60,
    });
}

export function getRegistryContractId() {
    return getContractId();
}

export async function getContractOwner(assetHash: string): Promise<string | null> {
    try {
        const tx = await buildRegistryCall("owner", [assetHash]);
        const result = tx.result;

        return typeof result === "string" ? result : null;
    } catch (error) {
        console.error("Failed to read contract owner", error);
        return null;
    }
}

export async function registerAssetOnContract(assetHash: string, owner: string) {
    const tx = await buildRegistryCall(
        "register",
        [assetHash, nativeToScVal(owner, { type: "address" })],
        owner
    );
    const sent = await tx.signAndSend();

    if (!sent.sendTransactionResponse || !sent.getTransactionResponse) {
        throw new Error("Contract registration did not finalize.");
    }

    if (sent.getTransactionResponse.status !== "SUCCESS") {
        throw new Error(`Contract registration failed with status ${sent.getTransactionResponse.status}.`);
    }

    return {
        txHash: sent.sendTransactionResponse.hash,
    };
}

export async function transferAssetOnContract(assetHash: string, owner: string, recipient: string) {
    const tx = await buildRegistryCall(
        "transfer",
        [assetHash, nativeToScVal(recipient, { type: "address" })],
        owner
    );
    const sent = await tx.signAndSend();

    if (!sent.sendTransactionResponse || !sent.getTransactionResponse) {
        throw new Error("Contract transfer did not finalize.");
    }

    if (sent.getTransactionResponse.status !== "SUCCESS") {
        throw new Error(`Contract transfer failed with status ${sent.getTransactionResponse.status}.`);
    }

    return {
        txHash: sent.sendTransactionResponse.hash,
    };
}
