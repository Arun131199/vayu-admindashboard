import { useMemo, useState } from "react";
import { toast } from "sonner";
import Modal from "../Table/Modal";
import {
    generateRpcBatches,
    getErrorMessage,
    type BatchDay,
} from "../../service/rpcBatchApi";
import {
    addMonthsMinusOneDay,
    dayLabel,
    parseISODate,
    toISODate,
    todayISO,
} from "../../utils/rpcBatchDate";

type Props = {
    open: boolean;
    onClose: () => void;
    onDone: () => void;
};

const ALL_DAYS: BatchDay[] = ["MONDAY", "THURSDAY"];

const inputClass =
    "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 outline-none focus:border-yellow-500";
const labelClass = "block text-sm font-medium mb-1 dark:text-gray-200";

export default function GenerateBatchesModal({ open, onClose, onDone }: Props) {
    const [startDate, setStartDate] = useState<string>(todayISO());
    const [months, setMonths] = useState<number>(1);
    const [days, setDays] = useState<BatchDay[]>(ALL_DAYS);
    const [maxStudents, setMaxStudents] = useState<number>(5);
    const [saving, setSaving] = useState(false);

    const endDate = useMemo(() => {
        if (!startDate) return "";
        return toISODate(addMonthsMinusOneDay(parseISODate(startDate), months));
    }, [startDate, months]);

    const preview = useMemo(() => {
        const counts: Record<BatchDay, number> = { MONDAY: 0, THURSDAY: 0 };
        if (!startDate || !endDate) return counts;
        const end = parseISODate(endDate);
        for (let d = parseISODate(startDate); d <= end; d.setDate(d.getDate() + 1)) {
            const dow = d.getDay();
            if (dow === 1 && days.includes("MONDAY")) counts.MONDAY += 1;
            if (dow === 4 && days.includes("THURSDAY")) counts.THURSDAY += 1;
        }
        return counts;
    }, [startDate, endDate, days]);

    const totalBatches = preview.MONDAY + preview.THURSDAY;

    const toggleDay = (day: BatchDay) => {
        setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
    };

    const handleSubmit = async () => {
        if (!startDate) {
            toast.error("Select a start date");
            return;
        }
        if (days.length === 0) {
            toast.error("Select at least one batch day");
            return;
        }
        if (!maxStudents || maxStudents < 1) {
            toast.error("Seats per batch must be at least 1");
            return;
        }

        setSaving(true);
        try {
            const result = await generateRpcBatches({ startDate, endDate, days, maxStudents });
            if (result.created === 0) {
                toast.info("No new batches created. These dates already exist.");
            } else {
                const skippedText = result.skipped > 0 ? ` (${result.skipped} already existed)` : "";
                toast.success(`${result.created} batch(es) created${skippedText}`);
            }
            onDone();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, "Unable to generate batches"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open={open} title="Generate Batches" onClose={onClose} size="md">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Start date</label>
                        <input
                            type="date"
                            className={inputClass}
                            value={startDate}
                            min={todayISO()}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Duration</label>
                        <select
                            className={inputClass}
                            value={months}
                            onChange={(e) => setMonths(Number(e.target.value))}
                        >
                            <option value={1}>1 month</option>
                            <option value={2}>2 months</option>
                            <option value={3}>3 months</option>
                            <option value={6}>6 months</option>
                        </select>
                    </div>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Batches will be created up to <span className="font-semibold">{endDate || "-"}</span>
                </p>

                <div>
                    <label className={labelClass}>Batch days (every week)</label>
                    <div className="flex gap-4">
                        {ALL_DAYS.map((day) => (
                            <label key={day} className="flex items-center gap-2 cursor-pointer dark:text-gray-200">
                                <input
                                    type="checkbox"
                                    checked={days.includes(day)}
                                    onChange={() => toggleDay(day)}
                                />
                                {dayLabel(day)}
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Seats per batch</label>
                    <input
                        type="number"
                        min={1}
                        max={100}
                        className={inputClass}
                        value={maxStudents}
                        onChange={(e) => setMaxStudents(Number(e.target.value))}
                    />
                </div>

                <div className="rounded-lg bg-yellow-50 dark:bg-gray-800 border border-yellow-200 dark:border-gray-700 p-3 text-sm dark:text-gray-200">
                    <span className="font-semibold">{totalBatches}</span> batch(es) will be created
                    {" "}({preview.MONDAY} Monday, {preview.THURSDAY} Thursday) with{" "}
                    <span className="font-semibold">{maxStudents || 0}</span> seats each. Dates that already
                    have a batch are skipped.
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
                        disabled={saving || totalBatches === 0}
                        className="px-4 py-2 rounded-lg bg-yellow-500 text-gray-900 font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? "Generating..." : "Generate"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}