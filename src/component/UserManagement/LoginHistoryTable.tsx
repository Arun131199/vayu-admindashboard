import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { getLoginHistory, type LoginSessionRow } from "../../service/companyUserApi";

export default function LoginHistoryTable({ userId }: { userId: number }) {
    const [sessions, setSessions] = useState<LoginSessionRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLoginHistory(userId)
            .then(setSessions)
            .catch((err) => console.error("Failed to load login history", err))
            .finally(() => setLoading(false));
    }, [userId]);

    return (
        <div className="border dark:border-gray-700 shadow-xl rounded-md p-6 border-gray-300 bg-white dark:bg-gray-900 space-y-4">
            <div className="flex items-center gap-2">
                <Clock size={20} className="text-yellow-500" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Login History</h2>
            </div>

            {loading ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
            ) : sessions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No login history yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                <th className="py-2 pr-4">Date</th>
                                <th className="py-2 pr-4">Login Time</th>
                                <th className="py-2 pr-4">Logout Time</th>
                                <th className="py-2 pr-4">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((s, idx) => (
                                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                                    <td className="py-2 pr-4 text-gray-900 dark:text-white">{new Date(s.date).toLocaleDateString("en-IN")}</td>
                                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{new Date(s.loginAt).toLocaleTimeString("en-IN")}</td>
                                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                                        {s.logoutAt ? new Date(s.logoutAt).toLocaleTimeString("en-IN") : (
                                            <span className="text-green-600 font-medium">Active now</span>
                                        )}
                                    </td>
                                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{s.durationText}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}