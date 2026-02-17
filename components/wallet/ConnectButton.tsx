import { useWalletStore } from "@/lib/state/walletStore";

export default function ConnectButton() {
    const { publicKey, connected, connect, disconnect } = useWalletStore();

    // Auto-restore is handled by WalletProvider.tsx

    if (connected && publicKey) {
        return (
            <div className="flex items-center gap-4">
                <div className="hidden md:block text-right">
                    <p className="text-xs text-gray-400 font-medium">Connected</p>
                    <p className="text-sm font-mono font-bold text-gray-900">{publicKey.substring(0, 4)}...{publicKey.substring(publicKey.length - 4)}</p>
                </div>
                <button
                    onClick={disconnect}
                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors border border-red-200"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={connect}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
        >
            Connect Wallet
        </button>
    );
}
