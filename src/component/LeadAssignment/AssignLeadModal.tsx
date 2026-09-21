import { useEffect, useState } from "react";
import Modal from "../Table/Modal";
import { getAllCompanyUsers, type CompanyUserRow } from "../../service/companyUserApi";
import { assignLead, type LeadType } from "../../service/leadApi";

type AssignLeadModalProps = {
    open: boolean;
    leadType: LeadType;
    entityId: number;
    currentAssigneeId?: number | null;
    onClose: () => void;
    onAssigned: () => void;
};

export default function AssignLeadModal({ open, leadType, entityId, currentAssigneeId, onClose, onAssigned }: AssignLeadModalProps) {
    const [employees, setEmployees] = useState<CompanyUserRow[]>([]);
    const [selectedId, setSelectedId] = useState<number | "">(currentAssigneeId ?? "");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        setError("");
        setSelectedId(currentAssigneeId ?? "");
        setLoading(true);
        getAllCompanyUsers()
            .then((data) => setEmployees(data.filter((e) => e.active)))
            .catch(() => setError("Failed to load employees"))
            .finally(() => setLoading(false));
    }, [open, currentAssigneeId]);

    const handleAssign = async () => {
        if (!selectedId) {
            setError("Please select an employee");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            await assignLead(leadType, entityId, Number(selectedId));
            onAssigned();
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to assign lead");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={open} title="Assign Lead" onClose={onClose} size="sm">
            <div className="space-y-4">
                {loading ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Loading employees...</p>
                ) : (
                    <div>
                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Select Employee</label>
                        <select
                            className="mt-2 w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : "")}
                        >
                            <option value="">-- Select Employee --</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name} ({emp.roleName})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleAssign}
                        disabled={submitting || loading}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium disabled:opacity-50"
                    >
                        {submitting ? "Assigning..." : "Assign"}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    );
}