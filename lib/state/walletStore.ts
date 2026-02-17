import { create } from "zustand";

type WalletState = {
    publicKey: string | null;
    connected: boolean;
    setWallet: (key: string) => void;
    restoreWallet: (key: string) => void;
    disconnect: () => void;
};

export const useWalletStore = create<WalletState>((set) => ({
    publicKey: null,
    connected: false,

    setWallet: (key) => {
        localStorage.setItem("wallet", key);
        set({ publicKey: key, connected: true });
    },

    restoreWallet: (key) =>
        set({
            publicKey: key,
            connected: true,
        }),

    disconnect: () => {
        localStorage.removeItem("wallet");
        set({ publicKey: null, connected: false });
    },
}));
