import Link from "next/link";
import Card from "../ui/Card";

interface AssetGridProps {
    assets: Array<{
        hash: string;
        timestamp?: string;
    }>;
    loading: boolean;
}

export default function AssetGrid({ assets, loading }: AssetGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (assets.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-500 mb-4">You don't have any assets yet.</p>
                <Link href="/register" className="text-blue-600 hover:underline text-sm font-medium">
                    Register your first asset →
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
                <Link key={asset.hash} href={`/asset/${asset.hash}`}>
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border hover:border-blue-200">
                        <div className="space-y-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-lg">
                                📄
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Asset Fingerprint</p>
                                <p className="font-mono text-xs text-gray-900 break-all bg-gray-50 p-2 rounded">
                                    {asset.hash}
                                </p>
                            </div>
                            {asset.timestamp && (
                                <p className="text-xs text-gray-400">
                                    Registered: {new Date(asset.timestamp).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
