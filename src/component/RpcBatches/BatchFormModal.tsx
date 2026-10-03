import { useEffect, useState } from "react";
import { toast } from "sonner";
import Modal from "../Table/Modal";
import {
    createRpcBatch,
    getErrorMessage,
    updateRpcBatchSeats,
    type RpcBatch,
} from "../../service/rpcBatchApi";
import { formatBatchDate, parseISODate, todayISO } from "../../utils/rpcBatchDate";

type Props = {
    open: boolean;
    // null => create a new batch, otherwise edit the seats of this batch
    batch: RpcBatch | null;
    onClose: () => void;
    onDone: () => void;
};

const inputClass =
    "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 outline-none focus:border-yellow-500";
const labelClass = "block text-sm font-medium mb-1 dark:text-gray-200";

export default function BatchFormModal({ open, batch, onClose, onDone }: Props) {
    const isEdit = batch !== null;
    const [batchDate, setBatchDate] = useState<string>(todayISO());
    const [maxStudents, setMaxStudents] = useState<number>(5);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (batch) {
            setMaxStudents(batch.maxStudents);
        } else {
            setBatchDate(todayISO());
            setMaxStudents(5);
        }
    }, [open, batch]);

    const handleSubmit = async () => {
        if (!maxStudents || maxStudents < 1) {
            toast.error("Seats per batch must be at least 1");
            return;
        }

        if (!isEdit) {
            if (!batchDate) {
                toast.error("Select a batch date");
                return;
            }
            const dow = parseISODate(batchDate).getDay();
            if (dow !== 1 && dow !== 4) {
                toast.error("Batch date must be a Monday or Thursday");
                return;
            }
        }

        setSaving(true);
        try {
            if (isEdit && batch) {
                await updateRpcBatchSeats(batch.id, maxStudents);
                toast.success("Seats updated");
            } else {
                await createRpcBatch(batchDate, maxStudents);
                toast.success("Batch created");
            }
            onDone();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, "Unable to save batch"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open={open} title={isEdit ? "Edit Seats" : "Add Batch"} onClose={onClose} size="sm">
            <div className="space-y-4">
                {isEdit && batch ? (
                    <div className="text-sm dark:text-gray-200">
                        <p>
                            <span className="font-semibold">{formatBatchDate(batch.batchDate)}</span> (
                            {batch.batchDay.charAt(0) + batch.batchDay.slice(1).toLowerCase()})
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                            {batch.bookedStudents} student(s) already booked, so seats cannot go below{" "}
                            {batch.bookedStudents}.
                        </p>
                    </div>
                ) : (
                    <div>
                        <label className={labelClass}>Batch date (Monday or Thursday)</label>
                        <input
                            type="date"
                            className={inputClass}
                            value={batchDate}
                            min={todayISO()}
                            onChange={(e) => setBatchDate(e.target.value)}
                        />
                    </div>
                )}

                <div>
                    <label className={labelClass}>Seats</label>
                    <input
                        type="number"
                        className={inputClass}
                        min={isEdit && batch ? Math.max(1, batch.bookedStudents) : 1}
                        max={100}
                        value={maxStudents}
                        onChange={(e) => setMaxStudents(Number(e.target.value))}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:text-white cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg bg-yellow-500 text-gray-900 font-semibold cursor-pointer disabled:opacity-50"
                    >
                        {saving ? "Saving..." : isEdit ? "Update" : "Create"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}