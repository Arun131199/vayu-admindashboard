import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, CalendarPlus, Info, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import BreadCrump from "../../component/BreadCrump/BreadCrump";
import Button from "../../component/Buttons/Button";
import StatusCard from "../../component/Cards/StatusCard";
import ConfirmationPopup from "../../component/Popup/ConfirmationPopup";
import GenerateBatchesModal from "../../component/RpcBatches/GenerateBatchesModal";
import BatchFormModal from "../../component/RpcBatches/BatchFormModal";
import BatchDetailModal from "../../component/RpcBatches/BatchDetailModal";
import { useAuth } from "../../context/AuthContext";
import {
    deleteRpcBatch,
    getErrorMessage,
    getRpcBatches,
    getUnassignedRpcStudents,
    type RpcBatch,
} from "../../service/rpcBatchApi";
import { dayLabel, formatBatchDate } from "../../utils/rpcBatchDate";

type Filter = "upcoming" | "past" | "all";

const filterTabs: { key: Filter; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "all", label: "All" },
];

export default function RpcBatches() {
    const { permissions } = useAuth();
    const canWrite = permissions?.includes("RPC_WRITE");
    const canUpdate = permissions?.includes("RPC_UPDATE");
    const canDelete = permissions?.includes("RPC_DELETE");

    const [batches, setBatches] = useState<RpcBatch[]>([]);
    const [unassignedCount, setUnassignedCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<Filter>("upcoming");

    const [generateOpen, setGenerateOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editBatch, setEditBatch] = useState<RpcBatch | null>(null);
    const [detailId, setDetailId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<RpcBatch | null>(null);
    const [deleting, setDeleting] = useState(false);

    const breadCrumpOptions = useMemo(() => [{ id: 1, label: "RPC Batches" }], []);

    const loadBatches = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getRpcBatches();
            setBatches(data);
            if (canUpdate) {
                const unassigned = await getUnassignedRpcStudents();
                setUnassignedCount(unassigned.length);
            }
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Failed to load batches"));
        } finally {
            setLoading(false);
        }
    }, [canUpdate]);

    useEffect(() => {
        loadBatches();
    }, [loadBatches]);

    const upcoming = useMemo(() => batches.filter((b) => !b.past), [batches]);

    const statusData = useMemo(() => {
        const totalSeats = upcoming.reduce((sum, b) => sum + b.maxStudents, 0);
        const booked = upcoming.reduce((sum, b) => sum + b.bookedStudents, 0);
        return [
            { id: 1, title: "Upcoming Batches", value: String(upcoming.length), icon: CalendarClock },
            { id: 2, title: "Total Seats", value: String(totalSeats), icon: Info },
            { id: 3, title: "Booked", value: String(booked), icon: Users },
            { id: 4, title: "Seats Available", value: String(totalSeats - booked), icon: CalendarPlus },
        ];
    }, [upcoming]);

    const visible = useMemo(() => {
        if (filter === "upcoming") return batches.filter((b) => !b.past);
        if (filter === "past") return batches.filter((b) => b.past).reverse();
        return batches;
    }, [batches, filter]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteRpcBatch(deleteTarget.id);
            toast.success("Batch deleted");
            setDeleteTarget(null);
            await loadBatches();
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, "Unable to delete batch"));
        } finally {
            setDeleting(false);
        }
    };

    const openCreate = () => {
        setEditBatch(null);
        setFormOpen(true);
    };

    const openEdit = (batch: RpcBatch) => {
        setEditBatch(batch);
        setFormOpen(true);
    };

    const statusBadge = (batch: RpcBatch) => {
        if (batch.past) {
            return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Completed</span>;
        }
        if (batch.status === "FULL") {
            return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">Full</span>;
        }
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">Available</span>;
    };

    return (
        <main className="space-y-4">
            <section className="flex items-center justify-between flex-wrap gap-3">
                <BreadCrump
                    breadCrumpActive={false}
                    options={breadCrumpOptions}
                    title="RPC Batches"
                    subtitles="Create Monday / Thursday batches and manage seats"
                />
                {canWrite && (
                    <div className="flex items-center gap-3">
                        <Button buttonText="Generate Batches" icon={CalendarPlus} varient="primary" onClick={() => setGenerateOpen(true)} />
                        <Button buttonText="Add Batch" icon={Plus} onClick={openCreate} />
                    </div>
                )}
            </section>

            {error && <p className="text-red-500">{error}</p>}

            {unassignedCount > 0 && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-gray-800 dark:border-amber-600 p-3 text-sm text-amber-800 dark:text-amber-300">
                    {unassignedCount} paid student(s) do not have a batch yet. Open any upcoming batch and use
                    "Assign a paid student" to place them.
                </div>
            )}

            <section>
                <StatusCard data={statusData} gridcount={4} loading={loading && batches.length === 0} />
            </section>

            <section className="rounded-md bg-white dark:bg-gray-900 shadow-xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer border ${filter === tab.key
                                ? "bg-yellow-500 text-gray-900 border-yellow-500"
                                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left dark:text-gray-200">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-3 py-3">Batch Date</th>
                                <th className="px-3 py-3">Day</th>
                                <th className="px-3 py-3 min-w-[160px]">Seats (Booked / Total)</th>
                                <th className="px-3 py-3">Available</th>
                                <th className="px-3 py-3">Status</th>
                                <th className="px-3 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && batches.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-3 py-6 text-center text-gray-500">Loading...</td>
                                </tr>
                            )}
                            {!loading && visible.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                                        No batches found.{canWrite ? " Use \"Generate Batches\" to create them." : ""}
                                    </td>
                                </tr>
                            )}
                            {visible.map((batch) => {
                                const percent = batch.maxStudents > 0
                                    ? Math.min(100, Math.round((batch.bookedStudents / batch.maxStudents) * 100))
                                    : 0;
                                return (
                                    <tr key={batch.id} className="border-t border-gray-200 dark:border-gray-700">
                                        <td className="px-3 py-3 font-medium">{formatBatchDate(batch.batchDate)}</td>
                                        <td className="px-3 py-3">{dayLabel(batch.batchDay)}</td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${percent}%` }} />
                                                </div>
                                                <span>{batch.bookedStudents} / {batch.maxStudents}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">{batch.availableSeats}</td>
                                        <td className="px-3 py-3">{statusBadge(batch)}</td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setDetailId(batch.id)}
                                                    className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer"
                                                >
                                                    View
                                                </button>
                                                {canUpdate && !batch.past && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(batch)}
                                                        className="px-3 py-1 rounded-lg border border-yellow-500 text-yellow-600 cursor-pointer"
                                                    >
                                                        Edit Seats
                                                    </button>
                                                )}
                                                {canDelete && batch.bookedStudents === 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteTarget(batch)}
                                                        className="px-3 py-1 rounded-lg border border-red-400 text-red-500 cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            <GenerateBatchesModal
                open={generateOpen}
                onClose={() => setGenerateOpen(false)}
                onDone={loadBatches}
            />

            <BatchFormModal
                open={formOpen}
                batch={editBatch}
                onClose={() => setFormOpen(false)}
                onDone={loadBatches}
            />

            <BatchDetailModal
                open={detailId !== null}
                batchId={detailId}
                canManage={Boolean(canUpdate)}
                canCreate={Boolean(canWrite)}
                allBatches={batches}
                onClose={() => setDetailId(null)}
                onChanged={loadBatches}
            />

            <ConfirmationPopup
                open={deleteTarget !== null}
                type="danger"
                title="Delete batch?"
                message={
                    deleteTarget
                        ? `Delete the batch on ${formatBatchDate(deleteTarget.batchDate)}? Students can no longer pick this date.`
                        : ""
                }
                confirmButtonText="Delete"
                loading={deleting}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />
        </main>
    );
}