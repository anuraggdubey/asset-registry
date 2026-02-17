import Link from "next/link";
import { ActivityItem } from "@/lib/stellar/fetchAccountHistory";
import CopyButton from "../ui/CopyButton";

interface ActivityTableProps {
    activities: ActivityItem[];
    loading: boolean;
}

export default function ActivityTable({ activities, loading }: ActivityTableProps) {
    if (loading) {
        return <div className="p-8 text-center text-gray-400">Loading activity...</div>;
    }

    if (activities.length === 0) {
        return <div className="p-8 text-center text-gray-400">No recent activity found.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-3">Event</th>
                        <th className="px-6 py-3">Asset</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3 text-right">Transaction</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.map((item) => (
                        <tr key={item.txHash} className="bg-white border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <span className={`
                                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                    ${item.type === 'REGISTER' ? 'bg-purple-100 text-purple-700' : ''}
                                    ${item.type === 'SEND' ? 'bg-orange-100 text-orange-700' : ''}
                                    ${item.type === 'RECEIVE' ? 'bg-emerald-100 text-emerald-700' : ''}
                                `}>
                                    {item.type}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-gray-600">
                                <Link href={`/asset/${item.assetHash}`} className="hover:text-blue-600 hover:underline">
                                    {item.assetHash.slice(0, 8)}...
                                </Link>
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {new Date(item.timestamp).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end items-center gap-2">
                                    <span className="font-mono text-xs text-gray-400">
                                        {item.txHash.slice(0, 6)}...
                                    </span>
                                    <CopyButton text={item.txHash} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
