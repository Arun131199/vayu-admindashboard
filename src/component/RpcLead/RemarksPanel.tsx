import { useEffect, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { addRpcRemark, getRpcRemarks, type RemarkRow } from "../../service/rpcApi";

type RemarksPanelProps = {
    rpcId: number;
};

export default function RemarksPanel({ rpcId }: RemarksPanelProps) {
    const [remarks, setRemarks] = useState<RemarkRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [newRemark, setNewRemark] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const fetchRemarks = async () => {
        setLoading(true);
        try {
            const data = await getRpcRemarks(rpcId);
            setRemarks(data);
        } catch (err) {
            console.error("Failed to fetch remarks", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRemarks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rpcId]);

    const handleAddRemark = async () => {
        if (!newRemark.trim()) return;
        setSubmitting(true);
        setError("");
        try {
            await addRpcRemark(rpcId, newRemark.trim());
            setNewRemark("");
            await fetchRemarks();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to add remark");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="border dark:border-gray-700 shadow-xl rounded-md p-6 border-gray-300 bg-white dark:bg-gray-900 space-y-4">
            <div className="flex items-center gap-2">
                <MessageSquare size={20} className="text-yellow-500" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Remarks History</h2>
            </div>

            <div className="flex gap-3">
                <input
                    type="text"
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddRemark()}
                    placeholder="Add a remark..."
                    className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
                />
                <button
                    onClick={handleAddRemark}
                    disabled={submitting || !newRemark.trim()}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                    <Send size={16} />
                    {submitting ? "Sending..." : "Add"}
                </button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {loading ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Loading remarks...</p>
                ) : remarks.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No remarks yet.</p>
                ) : (
                    remarks.map((r) => (
                        <div key={r.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-sm text-gray-900 dark:text-white">{r.employeeName}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(r.createdAt).toLocaleString("en-IN")}
                                </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{r.remark}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}