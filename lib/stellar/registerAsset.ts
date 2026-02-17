import {
    TransactionBuilder,
    Networks,
    Operation,
    Memo,
    Asset,
} from "@stellar/stellar-sdk";
import { server } from "./server";
import { signTransaction } from "@stellar/freighter-api";

export async function registerAsset(publicKey: string, hash: string) {
    // shorten fingerprint to fit memo limit
    const shortHash = hash.slice(0, 20);

    // load account
    const account = await server.loadAccount(publicKey);

    // create transaction
    const tx = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
    })
        .addOperation(
            Operation.payment({
                destination: publicKey, // self payment (notarization)
                asset: Asset.native(),
                amount: "0.0000001",
            })
        )
        .addMemo(Memo.text(`REG|${shortHash}`))
        .setTimeout(30)
        .build();

    // sign with Freighter
    const signed = await signTransaction(tx.toXDR(), {
        networkPassphrase: Networks.TESTNET,
    });

    // submit
    const result = await server.submitTransaction(
        TransactionBuilder.fromXDR(signed.signedTxXdr, Networks.TESTNET)
    );

    return result.hash;
}
