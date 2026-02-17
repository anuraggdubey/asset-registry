import {
    TransactionBuilder,
    Networks,
    Operation,
    Asset,
    StrKey,
    Claimant,
    Memo
} from "@stellar/stellar-sdk";
import { server } from "./server";
import { kit } from "@/lib/state/walletStore";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";
import { getOnChainOwner } from "./ownership"; // Keep existing import of getOnChainOwner logic

export async function transferAsset(
    senderPublicKey: string,
    receiverPublicKey: string,
    issuerPublicKey: string, // Asset ID
    assetCode: string = "ART"
) {

    console.log("transferAsset initiating", { senderPublicKey, receiverPublicKey, issuerPublicKey, assetCode });

    // 0. Validate Keys
    if (!StrKey.isValidEd25519PublicKey(senderPublicKey)) throw new Error("Invalid Sender Public Key");
    if (!StrKey.isValidEd25519PublicKey(receiverPublicKey)) throw new Error("Invalid Receiver Public Key");
    if (!StrKey.isValidEd25519PublicKey(issuerPublicKey)) throw new Error("Invalid Issuer Public Key (Asset ID)");

    try {
        // 1. STRICT SECURITY CHECK
        // Verify on-chain ownership before even building the TX
        const currentOwner = await getOnChainOwner(assetCode, issuerPublicKey);
        console.log("Current On-Chain Owner:", currentOwner);

        if (currentOwner !== senderPublicKey) {
            // Check if it's already in a claimable balance sent by us?
            // For now, strict check.
            throw new Error(`SECURITY BLOCK: You are not the current blockchain owner of this asset. Current: ${currentOwner}, You: ${senderPublicKey}`);
        }

        // 2. Load Account
        console.log("Loading sender account...");
        const account = await server.loadAccount(senderPublicKey);
        const asset = new Asset(assetCode, issuerPublicKey);

        // 3. Build Claimable Balance Transaction
        // We use Claimable Balance so the recipient does NOT need a trustline beforehand.
        console.log("Building Claimable Balance Transaction...");
        const tx = new TransactionBuilder(account, {
            fee: "10000",
            networkPassphrase: Networks.TESTNET,
        })
            .addMemo(Memo.text(`OWN|${assetCode}`))
            .addOperation(
                Operation.createClaimableBalance({
                    asset: asset,
                    amount: "1",
                    claimants: [
                        new Claimant(
                            receiverPublicKey,
                            Claimant.predicateUnconditional()
                        )
                    ]
                })
            )
            .setTimeout(60)
            .build();

        // 4. Sign
        console.log("Signing Transaction with Kit...");
        const { signedTxXdr } = await kit.signTransaction(
            tx.toXDR(),
            {
                networkPassphrase: Networks.TESTNET,
            }
        );

        // 5. Submit
        console.log("Submitting Transaction...");
        const result = await server.submitTransaction(
            TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET)
        );
        console.log("Transfer (ClaimableBalance) Success:", result.hash);

        return result.hash;
    } catch (e: any) {
        console.error("transferAsset Failed:", e);

        // Handle Horizon Errors
        if (e.response?.data?.extras?.result_codes) {
            const codes = e.response.data.extras.result_codes;
            console.error("Horizon Result Codes:", codes);
            throw new Error(`Transfer Failed: ${JSON.stringify(codes)}`);
        }

        throw e;
    }
}
