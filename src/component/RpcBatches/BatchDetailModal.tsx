import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Modal from "../Table/Modal";
import ConfirmationPopup from "../Popup/ConfirmationPopup";
import {
    assignStudentToRpcBatch,
    getErrorMessage,
    getRpcBatchDetail,
    getUnassignedRpcStudents,
    markRpcStudentPaid,
    removeStudentFromRpcBatch,
    searchAssignableRpcStudents,
    type RpcBatch,
    type RpcBatchDetail,
    type RpcBatchStudent,
} from "../../service/rpcBatchApi";
import { dayLabel, formatBatchDate } from "../../utils/rpcBatchDate";
import WalkInStudentForm from "./WalkInStudentForm";

type Props = {
    open: boolean;
    batchId: number | null;
    allBatches: RpcBatch[];
    canManage: boolean; // add existing / move / remove / mark paid (RPC_UPDATE)
    canCreate: boolean; // add a new walk-in student (RPC_WRITE)
    onClose: () => void;
    onChanged: () => void;
};

const selectClass =
    "rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 outline-none focus:border-yellow-500";
const inputClass =
    "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 outline-none focus:border-yellow-500";

// Walk-in students without an email get a generated placeholder, do not show it
const visibleEmail = (email: string) => (email.endsWith("@noemail.invalid") ? "-" : email);

type AddTab = "walkin" | "existing";

type Confirmation = {
    title: string;
    message: string;
    confirmButtonText: string;
    type: "warning" | "danger";
    onConfirm: () => void;
};

const paymentBadge = (student: RpcBatchStudent) => {
    if (student.paymentStatus === "SUCCESS") {
        return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-600">Paid</span>;
    }
    if (student.onHold) {
        return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">Seat on hold (unpaid)</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">Not paid</span>;
};

export default function BatchDetailModal({
    open,
    batchId,
    allBatches,
    canManage,
    canCreate,
    onClose,
    onChanged,
}: Props) {
    const [detail, setDetail] = useState<RpcBatchDetail | null>(null);
    const [paidWaiting, setPaidWaiting] = useState<RpcBatchStudent[]>([]);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState<RpcBatchStudent[]>([]);
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [working, setWorking] = useState(false);
    const [addTab, setAddTab] = useState<AddTab>("walkin");
    const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

    const load = useCallback(async () => {
        if (batchId === null) return;
        setLoading(true);
        try {
            const [d, waiting] = await Promise.all([
                getRpcBatchDetail(batchId),
                canManage ? getUnassignedRpcStudents() : Promise.resolve([] as RpcBatchStudent[]),
            ]);
            setDetail(d);
            setPaidWaiting(waiting);
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, "Unable to load batch details"));
        } finally {
            setLoading(false);
        }
    }, [batchId, canManage]);

    useEffect(() => {
        if (open) {
            setDetail(null);
            setAddTab(canCreate ? "walkin" : "existing");
            setSearchText("");
            setSearchResults([]);
            load();
        }
    }, [open, load, canCreate]);

    // Search students (without a batch) while typing
    useEffect(() => {
        const q = searchText.trim();
        if (!open || !canManage || q.length < 2) {
            setSearchResults([]);
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const results = await searchAssignableRpcStudents(q);
                if (!cancelled) setSearchResults(results);
            } catch (err) {
                console.error(err);
                if (!cancelled) toast.error(getErrorMessage(err, "Unable to search students"));
            } finally {
                if (!cancelled) setSearching(false);
            }
        }, 350);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [searchText, open, canManage]);

    const batch = detail?.batch ?? null;
    const students = detail?.students ?? [];
    const canEditBatch = canManage && batch !== null && !batch.past;
    const canAddHere = canEditBatch && (batch?.availableSeats ?? 0) > 0;

    // Other upcoming batches with free seats, used for "Move to"
    const moveTargets = useMemo(
        () => allBatches.filter((b) => b.id !== batchId && !b.past && b.availableSeats > 0),
        [allBatches, batchId]
    );

    // Students shown under the search box: search results, or the paid students still waiting
    const candidates = searchText.trim().length >= 2 ? searchResults : paidWaiting;

    const runAssign = async (targetBatchId: number, student: RpcBatchStudent) => {
        setWorking(true);
        try {
            await assignStudentToRpcBatch(targetBatchId, student.rpcEnrollId);
            toast.success(`${student.username} added`);
            setSearchText("");
            setSearchResults([]);
            onChanged();
            await load();
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, "Unable to add student"));
        } finally {
            setWorking(false);
        }
    };

    const handleAdd = async (student: RpcBatchStudent) => {
        if (!batch) return;
        if (student.paymentStatus !== "SUCCESS") {
            setConfirmation({
                title: "Add unpaid student?",
                message: `${student.username} has not paid online. Add to this batch anyway?`,
                confirmButtonText: "Add student",
                type: "warning",
                onConfirm: () => {
                    setConfirmation(null);
                    void runAssign(batch.id, student);
                },
            });
            return;
        }
        await runAssign(batch.id, student);
    };

    const handleMove = (student: RpcBatchStudent, targetId: string) => {
        if (!targetId) return;
        const target = moveTargets.find((b) => String(b.id) === targetId);
        if (!target) return;
        setConfirmation({
            title: "Move student to another batch?",
            message: `Move ${student.username} to ${formatBatchDate(target.batchDate)}?`,
            confirmButtonText: "Move student",
            type: "warning",
            onConfirm: () => {
                setConfirmation(null);
                void runAssign(target.id, student);
            },
        });
    };

    const handleMarkPaid = (student: RpcBatchStudent) => {
        if (!batch) return;
        setConfirmation({
            title: "Mark student as paid?",
            message: `Mark ${student.username} as paid?`,
            confirmButtonText: "Mark as paid",
            type: "warning",
            onConfirm: () => {
                setConfirmation(null);
                void (async () => {
                    setWorking(true);
                    try {
                        await markRpcStudentPaid(batch.id, student.rpcEnrollId);
                        toast.success(`${student.username} marked as paid`);
                        onChanged();
                        await load();
                    } catch (err) {
                        console.error(err);
                        toast.error(getErrorMessage(err, "Unable to update payment"));
                    } finally {
                        setWorking(false);
                    }
                })();
            },
        });
    };

    const handleRemove = (student: RpcBatchStudent) => {
        if (!batch) return;
        setConfirmation({
            title: "Remove student from batch?",
            message: `Remove ${student.username} from the ${formatBatchDate(batch.batchDate)} batch? Their seat will be freed.`,
            confirmButtonText: "Remove student",
            type: "danger",
            onConfirm: () => {
                setConfirmation(null);
                void (async () => {
                    setWorking(true);
                    try {
                        await removeStudentFromRpcBatch(batch.id, student.rpcEnrollId);
                        toast.success(`${student.username} removed`);
                        onChanged();
                        await load();
                    } catch (err) {
                        console.error(err);
                        toast.error(getErrorMessage(err, "Unable to remove student"));
                    } finally {
                        setWorking(false);
                    }
                })();
            },
        });
    };

    return (
        <>
        <Modal open={open} title="Batch Details" onClose={onClose} size="lg">
            {loading && !detail ? (
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : !batch ? (
                <p className="text-gray-500 dark:text-gray-400">Batch not found.</p>
            ) : (
                <div className="space-y-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 dark:text-white">
                            <p className="text-gray-500 dark:text-gray-400">Date</p>
                            <p className="font-semibold">{formatBatchDate(batch.batchDate)}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 dark:text-white">
                            <p className="text-gray-500 dark:text-gray-400">Day</p>
                            <p className="font-semibold">{dayLabel(batch.batchDay)}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 dark:text-white">
                            <p className="text-gray-500 dark:text-gray-400">Seats</p>
                            <p className="font-semibold">
                                {batch.bookedStudents} / {batch.maxStudents}
                            </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 dark:text-white">
                            <p className="text-gray-500 dark:text-gray-400">Status</p>
                            <p className="font-semibold">{batch.past ? "Completed" : batch.status}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2 dark:text-white">Students ({students.length})</h3>
                        {students.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No students in this batch yet.</p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-sm text-left dark:text-gray-200">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-3 py-2">Enrollment ID</th>
                                            <th className="px-3 py-2">Name</th>
                                            <th className="px-3 py-2">Mobile</th>
                                            <th className="px-3 py-2">Payment</th>
                                            {canEditBatch && <th className="px-3 py-2">Move to</th>}
                                            {canEditBatch && <th className="px-3 py-2">Remove</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((s) => (
                                            <tr key={s.rpcEnrollId} className="border-t border-gray-200 dark:border-gray-700">
                                                <td className="px-3 py-2">{s.enrollmentId}</td>
                                                <td className="px-3 py-2">
                                                    <p>{s.username}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{visibleEmail(s.email)}</p>
                                                </td>
                                                <td className="px-3 py-2">{s.mobile}</td>
                                                <td className="px-3 py-2">
                                                    <div className="flex flex-col items-start gap-1">
                                                        {paymentBadge(s)}
                                                        {canEditBatch && s.paymentStatus !== "SUCCESS" && (
                                                            <button
                                                                type="button"
                                                                disabled={working}
                                                                onClick={() => handleMarkPaid(s)}
                                                                className="text-xs text-green-600 underline cursor-pointer disabled:opacity-50"
                                                            >
                                                                Mark as paid
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                {canEditBatch && (
                                                    <td className="px-3 py-2">
                                                        <select
                                                            className={selectClass}
                                                            disabled={working || moveTargets.length === 0}
                                                            value=""
                                                            onChange={(e) => handleMove(s, e.target.value)}
                                                        >
                                                            <option value="">Select batch</option>
                                                            {moveTargets.map((b) => (
                                                                <option key={b.id} value={b.id}>
                                                                    {formatBatchDate(b.batchDate)} ({b.availableSeats} left)
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                )}
                                                {canEditBatch && (
                                                    <td className="px-3 py-2">
                                                        <button
                                                            type="button"
                                                            disabled={working}
                                                            onClick={() => handleRemove(s)}
                                                            className="px-3 py-1 rounded-lg border border-red-400 text-red-500 cursor-pointer disabled:opacity-50"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {canEditBatch && (
                        <div className="space-y-3">
                            <h3 className="font-semibold dark:text-white">Add student to this batch</h3>

                            {!canAddHere ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    This batch is full. Increase the seats or remove a student to add someone.
                                </p>
                            ) : (
                                <>
                                    <div className="flex gap-2">
                                        {canCreate && (
                                            <button
                                                type="button"
                                                onClick={() => setAddTab("walkin")}
                                                className={`px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer border ${addTab === "walkin"
                                                        ? "bg-yellow-500 text-gray-900 border-yellow-500"
                                                        : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                                                    }`}
                                            >
                                                New walk-in student
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setAddTab("existing")}
                                            className={`px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer border ${addTab === "existing"
                                                    ? "bg-yellow-500 text-gray-900 border-yellow-500"
                                                    : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                                                }`}
                                        >
                                            Existing registration
                                        </button>
                                    </div>

                                    {addTab === "walkin" && canCreate && batch && (
                                        <WalkInStudentForm
                                            batch={batch}
                                            onAdded={() => {
                                                onChanged();
                                                load();
                                            }}
                                        />
                                    )}

                                    {(addTab === "existing" || !canCreate) && (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                className={inputClass}
                                                placeholder="Search by name, mobile, email or enrollment ID (min 2 letters)"
                                                value={searchText}
                                                onChange={(e) => setSearchText(e.target.value)}
                                            />

                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {searchText.trim().length >= 2
                                                    ? searching
                                                        ? "Searching..."
                                                        : `${searchResults.length} student(s) found (only students without a batch are listed)`
                                                    : `Paid students waiting for a batch (${paidWaiting.length})`}
                                            </p>

                                            {candidates.length > 0 && (
                                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto">
                                                    {candidates.map((s) => (
                                                        <div
                                                            key={s.rpcEnrollId}
                                                            className="flex items-center justify-between gap-3 px-3 py-2 text-sm dark:text-gray-200"
                                                        >
                                                            <div>
                                                                <p className="font-medium">
                                                                    {s.username} <span className="text-gray-500">({s.enrollmentId})</span>
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {s.mobile} · {visibleEmail(s.email)}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {paymentBadge(s)}
                                                                <button
                                                                    type="button"
                                                                    disabled={working}
                                                                    onClick={() => handleAdd(s)}
                                                                    className="px-3 py-1 rounded-lg bg-yellow-500 text-gray-900 font-semibold cursor-pointer disabled:opacity-50"
                                                                >
                                                                    Add
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Modal>
            {confirmation && (
                <ConfirmationPopup
                    open
                    type={confirmation.type}
                    title={confirmation.title}
                    message={confirmation.message}
                    confirmButtonText={confirmation.confirmButtonText}
                    onClose={() => setConfirmation(null)}
                    onConfirm={confirmation.onConfirm}
                    zIndex={110}
                />
            )}
        </>
    );
}