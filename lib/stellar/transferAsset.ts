import {
    TransactionBuilder,
    Networks,
    Operation,
    Memo,
    Asset
} from "@stellar/stellar-sdk";
import { server } from "./server";
import { signTransaction } from "@stellar/freighter-api";

export async function transferAsset(
    senderPublicKey: string,
    receiverPublicKey: string,
    fileHash20: string
) {

    // Verify destination account exists
    let receiverExists = true;
    try {
        await server.loadAccount(receiverPublicKey);
    } catch {
        receiverExists = false;
    }

    const account = await server.loadAccount(senderPublicKey);

    const builder = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
    });

    if (receiverExists) {
        builder.addOperation(
            Operation.payment({
                destination: receiverPublicKey,
                asset: Asset.native(),
                amount: "0.1",
            })
        );
    } else {
        // If receiver doesn't exist, we must create it (fund it)
        // Minimum reserve is 1 XLM. We'll send 2 XLM to be safe and generous.
        builder.addOperation(
            Operation.createAccount({
                destination: receiverPublicKey,
                startingBalance: "2.0"
            })
        );
    }

    const tx = builder
        .addMemo(Memo.text(`OWN|${fileHash20}`))
        .setTimeout(60)
        .build();

    const signed = await signTransaction(tx.toXDR(), {
        networkPassphrase: Networks.TESTNET,
    });

    const result = await server.submitTransaction(
        TransactionBuilder.fromXDR(signed.signedTxXdr, Networks.TESTNET)
    );

    return result.hash;
}
