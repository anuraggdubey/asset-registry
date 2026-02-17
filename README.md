# Stellar Asset Registry

### Decentralized Proof-of-Ownership for Digital Files

A production-grade dApp on the **Stellar Testnet** that allows creators to permanently **register**, **transfer**, and **verify** ownership of digital assets. Uses a hybrid approach with on-chain cryptographic proofs and off-chain metadata indexing.

[**Live Demo**](https://your-demo-url.vercel.app) | [**Demo Video**](https://youtu.be/your-video-link)

---

## Key Features

- **Multi-Wallet Support**: Connect with Freighter, Albedo, xBull, or Rabet using `@creit.tech/stellar-wallets-kit`.
- **Asset Registration**: Hashes files locally (SHA-256) and stamps the fingerprint on the Stellar Blockchain using deterministic ID generation.
- **Secure Transfers**: Transfer ownership using **Claimable Balances**, ensuring assets can be sent to any public key without prior trustlines.
- **Proof of Ownership**: Generate and download professional **PDF Certificates** of ownership and **Transaction Receipts**.
- **Instant Verification**: Publicly verify any asset's history and current owner by its registry ID or file hash.

---

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/anuraggdubey/asset-registry.git
    cd asset-registry
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

---

## 🧪 Tests

The project includes a comprehensive test suite for hashing, ownership logic, and component rendering.

```bash
npm test
```

![Test Output](https://placeholder-image.com/tests-passing.png)
*(Run tests locally to see passing results)*

---

## Architecture

-   **Frontend**: Next.js 14 (App Router), TailwindCSS, Zustand.
-   **Blockchain**: Stellar SDK, Soroban (Future), Horizon API.
-   **Indexing**: Firebase (for performance) + Blockchain (Source of Truth).
-   **Security**: Non-custodial, client-side signing.

---

## License

MIT
