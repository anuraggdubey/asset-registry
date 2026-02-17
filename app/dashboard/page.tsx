"use client";

import { useEffect, useState } from "react";
import { useWalletStore } from "@/lib/state/walletStore";
import { fetchAccountHistory, ActivityItem } from "@/lib/stellar/fetchAccountHistory";
import ActivityTable from "@/components/dashboard/ActivityTable";
import AssetGrid from "@/components/dashboard/AssetGrid";
import ConnectButton from "@/components/wallet/ConnectButton";
import Card from "@/components/ui/Card";
import Link from "next/link";

export default function DashboardPage() {
    const { publicKey, connected } = useWalletStore();

    const [activeTab, setActiveTab] = useState<"assets" | "activity" | "verified">("assets");
    const [loading, setLoading] = useState(false);

    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [myAssets, setMyAssets] = useState<any[]>([]);
    const [recentlyVerified, setRecentlyVerified] = useState<any[]>([]);

    useEffect(() => {
        if (connected && publicKey) {
            loadDashboardData();
        }
    }, [connected, publicKey]);

    // Load local storage items on mount
    useEffect(() => {
        const stored = localStorage.getItem("stellar_verified_assets");
        if (stored) {
            try {
                setRecentlyVerified(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse local history", e);
            }
        }
    }, []);

    async function loadDashboardData() {
        if (!publicKey) return;
        setLoading(true);

        try {
            try {
                // 1. Fetch Activity (Historical)
                const history = await fetchAccountHistory(publicKey);
                setActivities(history);

                // 2. Fetch "My Assets" from Registry API (Trusted/Indexed Source)
                // This ensures we see assets even if history nodes are incomplete or slow.
                // It also allows showing assets we own but haven't interacted with recently if indexed.
                try {
                    const res = await fetch(`/api/registry/collection?owner=${publicKey}`);
                    const data = await res.json();
                    if (data.assets) {
                        setMyAssets(data.assets.map((a: any) => ({
                            hash: a.id,
                            // If we have a 'createdAt' or 'verifiedAt', use it.
                            // Otherwise fallback to something else or just don't show date if missing.
                            timestamp: a.createdAt || new Date().toISOString(),
                            ...a
                        })));
                    }
                } catch (e) {
                    console.error("Failed to fetch collection:", e);
                    // Fallback to deducing from history if API fails?
                    // For now, just log it. The API should be the source of truth.
                }

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (!connected) {
        return (
            <main className="max-w-4xl mx-auto py-24 px-6 text-center">
                <h1 className="text-3xl font-bold text-neutral-900 mb-6">User Dashboard</h1>
                <p className="text-neutral-500 mb-8">
                    Connect your wallet to view your assets and activity history.
                </p>
                <div className="flex justify-center">
                    <ConnectButton />
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-6xl mx-auto py-12 px-6">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
                <p className="text-neutral-500">Manage your digital assets and view history.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
                <button
                    onClick={() => setActiveTab("assets")}
                    className={`pb-4 px-6 text-sm font-medium transition-colors border-b-2 ${activeTab === "assets"
                        ? "border-black text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    My Assets
                </button>
                <button
                    onClick={() => setActiveTab("activity")}
                    className={`pb-4 px-6 text-sm font-medium transition-colors border-b-2 ${activeTab === "activity"
                        ? "border-black text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Activity Log
                </button>
                <button
                    onClick={() => setActiveTab("verified")}
                    className={`pb-4 px-6 text-sm font-medium transition-colors border-b-2 ${activeTab === "verified"
                        ? "border-black text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Recently Verified
                </button>
            </div>

            {/* Content */}
            <div>
                {activeTab === "assets" && (
                    <AssetGrid assets={myAssets} loading={loading} />
                )}

                {activeTab === "activity" && (
                    <Card className="p-0 overflow-hidden">
                        <ActivityTable activities={activities} loading={loading} />
                    </Card>
                )}

                {activeTab === "verified" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentlyVerified.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-400">
                                No recently verified assets.
                            </div>
                        ) : (
                            recentlyVerified.map((item: any, idx) => (
                                <Link key={idx} href={`/asset/${item.hash}`}>
                                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                                {item.hash.slice(0, 12)}...
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Owner: {item.owner ? item.owner.slice(0, 8) + '...' : 'Unknown'}
                                        </p>
                                    </Card>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
