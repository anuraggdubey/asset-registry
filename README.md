# Stellar Asset Registry
### Decentralized Proof-of-Ownership for Digital Files

A mini-dApp built on the Stellar Testnet that allows anyone to permanently register, transfer, and verify ownership of digital assets using blockchain transactions.

Instead of storing files on chain, this project stores **cryptographic fingerprints** of files and records ownership events using Stellar transaction memos.

---

## Problem

Digital creators (designers, photographers, developers) cannot easily prove ownership of their files.

Screenshots, timestamps, and cloud storage are not trustworthy proof.

We need:
• Tamper-proof ownership  
• Transferable rights  
• Public verification  

---

## Solution

This dApp turns the Stellar blockchain into an ownership ledger.

Workflow:

1. Upload file → SHA256 fingerprint generated
2. Register → fingerprint recorded on blockchain (REG event)
3. Transfer → ownership transferred (OWN event)
4. Verify → anyone can confirm owner instantly

No central database required.

---

## Key Features

- Wallet authentication (Freighter)
- On-chain ownership registry
- Ownership transfer system
- Public verification portal
- Local caching for fast verification
- Fully deterministic hashing
- Tested ownership resolution logic

---

## Architecture

File → Hash → Blockchain Memo → Ownership Resolver → Cache → UI

The blockchain acts as the source of truth.
The frontend acts as a verification client.

---

## Tests

The project includes unit tests validating:

- Deterministic hashing
- Memo event parsing
- Ownership resolution after transfers

Run tests:

```bash
npm test

Run locally:
npm install
npm run dev
Open: http://localhost:3000

Why Stellar?

Stellar allows low-cost transactions and public history access,
making it ideal for building verifiable ownership registries.

Demo Use Case

A designer uploads artwork → registers ownership → sends ownership to client → client can publicly verify authenticity.

This creates a blockchain-based certificate of authenticity.

Future Improvements

IPFS storage integration

NFT metadata compatibility

Legal contract anchoring

Multi-file collections
