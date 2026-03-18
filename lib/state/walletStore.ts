"use client";

import { create } from "zustand";
import {
    StellarWalletsKit,
    WalletNetwork,
    allowAllModules
} from "@creit.tech/stellar-wallets-kit";

declare global {
    interface Window {
        __stellarWalletKit?: StellarWalletsKit;
    }
}

function getWalletKit() {
    if (typeof window === "undefined") {
        return null as unknown as StellarWalletsKit;
    }

    if (!window.__stellarWalletKit) {
        window.__stellarWalletKit = new StellarWalletsKit({
            network: WalletNetwork.TESTNET,
            selectedWalletId: "freighter",
            modules: allowAllModules(),
        });
    }

    return window.__stellarWalletKit;
}

export const kit = getWalletKit();

type WalletState = {
    publicKey: string | null;
    connected: boolean;
    walletId: string | null;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    restore: () => Promise<void>;
};

export const useWalletStore = create<WalletState>((set, get) => ({
    publicKey: null,
    connected: false,
    walletId: null,

    connect: async () => {
        try {
            await kit.openModal({
                onWalletSelected: async (option) => {
                    try {
                        kit.setWallet(option.id);
                        const { address } = await kit.getAddress();
                        set({
                            publicKey: address,
                            connected: true,
                            walletId: option.id
                        });
                        localStorage.setItem("wallet_id", option.id);
                    } catch (e) {
                        console.error("Connection failed", e);
                    }
                }
            });
        } catch (e) {
            console.error("Modal error", e);
        }
    },

    restore: async () => {
        const savedId = localStorage.getItem("wallet_id");
        if (savedId) {
            try {
                kit.setWallet(savedId);
                const { address } = await kit.getAddress();
                set({
                    publicKey: address,
                    connected: true,
                    walletId: savedId
                });
            } catch (e) {
                console.error("Restore failed", e);
                // If restore fails, clear state
                localStorage.removeItem("wallet_id");
            }
        }
    },

    disconnect: async () => {
        // Kit doesn't strictly have a 'disconnect' that wipes state for all wallets, 
        // but we can clear our local state.
        localStorage.removeItem("wallet_id");
        set({
            publicKey: null,
            connected: false,
            walletId: null
        });
    },
}));
