import {
    TransactionBuilder,
    Networks,
    Operation,
    Asset,
    Keypair,
    StrKey,
    Memo
} from "@stellar/stellar-sdk";
import { server } from "./server";
import { signTransaction } from "@stellar/freighter-api";
import axios from "axios";

export async function registerAsset(userPublicKey: string, hash: string) {
    // 1. Generate Issuer for this Asset
    const issuerKeypair = Keypair.random();
    const assetCode = "ART";
    const asset = new Asset(assetCode, issuerKeypair.publicKey());

    // 2. Call Registry API to Mint 6-Digit ID
    // We pass the generated Issuer Key so the Registry knows it.
    let registryId;
    try {
        const res = await axios.post("/api/registry/mint", {
            owner: userPublicKey,
            metadataHash: hash,
            assetCode: assetCode,
            issuerPublicKey: issuerKeypair.publicKey()
        });
        registryId = res.data.registeredAssetId;
    } catch (e) {
        console.error("Registry Mint Failed", e);
        throw new Error("Failed to generate Registry ID");
    }

    if (!registryId) throw new Error("No Registry ID returned");

    // 3. Load User Account
    const userAccount = await server.loadAccount(userPublicKey);

    // 4. Build Transaction
    const tx = new TransactionBuilder(userAccount, {
        fee: "10000",
        networkPassphrase: Networks.TESTNET,
    })
        .addMemo(Memo.text(`REG|${hash.slice(0, 20)}`))
        .addOperation(Operation.createAccount({
            destination: issuerKeypair.publicKey(),
            startingBalance: "3",
            source: userPublicKey
        }))
        .addOperation(Operation.changeTrust({
            asset: asset,
            limit: "1",
            source: userPublicKey
        }))
        .addOperation(Operation.payment({
            destination: userPublicKey,
            asset: asset,
            amount: "1",
            source: issuerKeypair.publicKey()
        }))
        .addOperation(Operation.manageData({
            name: "FINGERPRINT",
            value: hash,
            source: issuerKeypair.publicKey()
        }))
        .addOperation(Operation.manageData({
            name: "REGISTRY_ID",
            value: registryId,
            source: issuerKeypair.publicKey()
        }))
        .addOperation(Operation.setOptions({
            masterWeight: 0,
            source: issuerKeypair.publicKey()
        }))
        .setTimeout(60)
        .build();

    // 5. Sign Issuer
    tx.sign(issuerKeypair);

    // 6. Sign User & Submit
    const signedXdr = await signTransaction(tx.toXDR(), {
        networkPassphrase: Networks.TESTNET,
    });

    const result = await server.submitTransaction(
        TransactionBuilder.fromXDR(signedXdr.signedTxXdr, Networks.TESTNET)
    );

    // 7. Sync Registry (Activate)
    await axios.post("/api/registry/sync", {
        registeredAssetId: registryId,
        txHash: result.hash
    });

    return {
        issuer: issuerKeypair.publicKey(),
        txHash: result.hash,
        assetCode: assetCode,
        registeredAssetId: registryId
    };
}
