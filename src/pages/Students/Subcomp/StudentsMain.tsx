import { useNavigate } from "react-router-dom";
import BreadCrump from "../../../component/BreadCrump/BreadCrump";
import Button from "../../../component/Buttons/Button";
import { BookOpenCheck, Calculator, Info, Plus, Users } from "lucide-react";
import StatusCard from "../../../component/Cards/StatusCard";
import TableSkeleton from "../../../component/Table/TableSkeleton";
import type { ColumnDef, TableQuery } from "../../../component/Table/tableTypes";
import { defaultTableActionFeatures, type ExportFormat, type TableActionFeatures } from "../../../utils/tableDataProps";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import {
    getAllStudents,
    getArchivedStudents,
    deleteStudent,
    restoreStudent,
    permanentlyDeleteStudent,
    importStudents,
    exportStudents,
    type StudentRow,
} from "../../../service/studentApi";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";

type TableProps<T> = {
    mode?: "client" | "server";
    data: T[];
    columns: ColumnDef<T>[];
    rowKey: (row: T) => string;
    dateFilterAccessor?: keyof T;
    loading?: boolean;
    totalCount?: number;
    onServerQueryChange?: (query: TableQuery) => void;
    showRowActions?: boolean;
    renderRowActions?: (row: T) => ReactElement;
    tableActionFeatures?: TableActionFeatures;
    onViewRow?: (row: T) => void;
    onEditRow?: (row: T) => void;
    onDeleteRow?: (row: T) => void | Promise<void>;
    onArchiveSelected?: (rows: T[]) => void | Promise<void>;
    onShowArchive?: () => void;
    onImportFile?: (file: File) => void | Promise<void>;
    onExportFile?: (format: ExportFormat, selectedIds: string[]) => void | Promise<void>;
    onRefresh: () => void;
};

const StudentTable = lazy(
    () => import("../../../component/Table/Table")
) as unknown as <T>(props: TableProps<T>) => ReactElement;

const statusLabel: Record<string, string> = {
    ENROLLED: "Enrolled",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    DROPPED: "Dropped",
};

const statusBadgeClass: Record<string, string> = {
    ENROLLED: "bg-blue-100 text-blue-600",
    IN_PROGRESS: "bg-yellow-100 text-yellow-600",
    COMPLETED: "bg-green-100 text-green-600",
    DROPPED: "bg-red-100 text-red-600",
};

export default function StudentsMain() {
    const navigate = useNavigate();
    const { permissions } = useAuth();

    const canWrite = permissions?.includes("STUDENT_WRITE");
    const canUpdate = permissions?.includes("STUDENT_UPDATE");
    const canDelete = permissions?.includes("STUDENT_DELETE");

    const [viewMode, setViewMode] = useState<"live" | "archived">("live");

    const breadCrumpOptions = useMemo(() => [{ id: 1, label: "Students" }], []);

    const [allRows, setAllRows] = useState<StudentRow[]>([]);
    const [rows, setRows] = useState<StudentRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const statusData = useMemo(() => {
        const liveRows = viewMode === "live" ? allRows : [];
        const totalCount = liveRows.length;
        const active = liveRows.filter(s => s.status === "ENROLLED" || s.status === "IN_PROGRESS").length;
        const completed = liveRows.filter(s => s.status === "COMPLETED").length;
        const avgProgress = totalCount > 0
            ? Math.round(liveRows.reduce((sum, s) => sum + (s.progressPercent ?? 0), 0) / totalCount)
            : 0;

        return [
            { id: 1, title: "Total Students", value: String(totalCount), icon: Users },
            { id: 2, title: "Active", value: String(active), icon: Info },
            { id: 3, title: "Completed", value: String(completed), icon: BookOpenCheck },
            { id: 4, title: "Avg. Progress", value: `${avgProgress}%`, icon: Calculator },
        ];
    }, [allRows, viewMode]);

    const liveColumns = useMemo<ColumnDef<StudentRow>[]>(() => [
        { key: "studentId", header: "Student ID", sortable: true, accessor: "studentId", widthClassName: "w-32" },
        { key: "fullName", header: "Full Name", sortable: true, accessor: "fullName", widthClassName: "min-w-[180px]" },
        { key: "email", header: "Email", accessor: "email", widthClassName: "min-w-[220px]" },
        { key: "mobile", header: "Phone Number", accessor: "mobile", widthClassName: "w-40" },
        { key: "courseName", header: "Course", sortable: true, accessor: "courseName", widthClassName: "min-w-[180px]" },
        {
            key: "enrolledAt",
            header: "Enrollment Date",
            sortable: true,
            accessor: (row) => row.enrolledAt ? new Date(row.enrolledAt).toLocaleDateString() : "-",
            widthClassName: "w-40"
        },
        {
            key: "status",
            header: "Status",
            accessor: "status",
            widthClassName: "w-28",
            cell: (row) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClass[row.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {statusLabel[row.status] ?? row.status}
                </span>
            )
        },
        {
            key: "progressPercent",
            header: "Progress",
            accessor: "progressPercent",
            widthClassName: "w-24",
            cell: (row) => (
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${row.progressPercent}%` }}></div>
                </div>
            )
        }
    ], []);

    const archivedColumns = useMemo<ColumnDef<StudentRow>[]>(() => [
        { key: "studentId", header: "Student ID", sortable: true, accessor: "studentId", widthClassName: "w-32" },
        { key: "fullName", header: "Full Name", sortable: true, accessor: "fullName", widthClassName: "min-w-[180px]" },
        { key: "courseName", header: "Course", sortable: true, accessor: "courseName", widthClassName: "min-w-[180px]" },
        { key: "updatedAt", header: "Archived On", sortable: true, accessor: (row) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "-", widthClassName: "min-w-[160px]" },
    ], []);

    const columns = viewMode === "live" ? liveColumns : archivedColumns;

    const loadRows = useCallback(async (mode: "live" | "archived") => {
        setLoading(true);
        setError(null);
        try {
            const data = mode === "live" ? await getAllStudents() : await getArchivedStudents();
            setAllRows(data);
        } catch (err) {
            console.error(err);
            setError(mode === "live" ? "Failed to load students" : "Failed to load archived students");
        } finally {
            setLoading(false);
            setHasLoadedOnce(true);
        }
    }, []);

    const tableActionFeatures: TableActionFeatures = useMemo(() => ({
        ...defaultTableActionFeatures,
        showDateFilter: viewMode === "live",
        showDelete: viewMode === "live",
        showCustomButton: viewMode === "live",
    }), [viewMode]);

    const matchesQuery = useCallback((rowsToFilter: StudentRow[], query: TableQuery) => {
        let next = [...rowsToFilter];

        if (query.search.trim()) {
            const needle = query.search.toLowerCase();
            next = next.filter((row) =>
                Object.values(row).some((value) => String(value).toLowerCase().includes(needle))
            );
        }

        if (query.dateFrom || query.dateTo) {
            next = next.filter((row) => {
                const rowDate = row.enrolledAt?.slice(0, 10) ?? "";
                if (!rowDate) return false;
                const matchesFrom = !query.dateFrom || rowDate >= query.dateFrom;
                const matchesTo = !query.dateTo || rowDate <= query.dateTo;
                return matchesFrom && matchesTo;
            });
        }

        if (query.sortKey) {
            const dir = query.sortDir === "desc" ? -1 : 1;
            next.sort((a, b) => {
                const sortKey = query.sortKey as keyof StudentRow;
                const av = String(a[sortKey] ?? "");
                const bv = String(b[sortKey] ?? "");
                return av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" }) * dir;
            });
        }

        return next;
    }, []);

    const fetchRows = useCallback((query: TableQuery) => {
        setLoading(true);
        try {
            const filtered = matchesQuery(allRows, query);
            const totalCount = filtered.length;
            const start = (query.page - 1) * query.pageSize;
            const end = start + query.pageSize;

            setRows(filtered.slice(start, end));
            setTotal(totalCount);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allRows, matchesQuery]);

    // Live view actions
    const handleDelete = useCallback(async (row: StudentRow) => {
        await deleteStudent(row.id);
        await loadRows("live");
    }, [loadRows]);

    const handleArchiveSelected = useCallback(async (selectedRows: StudentRow[]) => {
        for (const row of selectedRows) {
            await deleteStudent(row.id);
        }
        await loadRows("live");
    }, [loadRows]);

    const handleView = useCallback((row: StudentRow) => {
        navigate(`view-student/${row.id}`, { state: row });
    }, [navigate]);

    const handleEdit = useCallback((row: StudentRow) => {
        navigate(`edit-student/${row.id}`, { state: row });
    }, [navigate]);

    // Archived view actions
    const handleRestore = useCallback(async (row: StudentRow) => {
        if (!toast.warning(`Restore "${row.fullName}" back to active students?`)) return;
        await restoreStudent(row.id);
        await loadRows("archived");
    }, [loadRows]);

    const handlePermanentDelete = useCallback(async (row: StudentRow) => {
        if (!toast.warning(`Permanently delete "${row.fullName}"? This cannot be undone.`)) return;
        try {
            await permanentlyDeleteStudent(row.id);
            await loadRows("archived");
        } catch (err) {
            console.error(err);
            alert("Could not delete — this student may still have linked records.");
        }
    }, [loadRows]);

    const handleImportFile = useCallback(async (file: File) => {
        await importStudents(file);
        await loadRows("live");
    }, [loadRows]);

    const handleExportFile = useCallback(async (format: string, selectedIds: string[]) => {
        const exportType = format.toUpperCase() as "EXCEL" | "PDF" | "CSV";
        const studentIds = selectedIds.length > 0
            ? rows.filter((r) => selectedIds.includes(String(r.id))).map((r) => r.studentId)
            : undefined;
        await exportStudents(exportType, studentIds);
    }, [rows]);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const data = await getAllStudents();
            setAllRows(data);
        } catch (err) {
            console.error(err);
            setError("Failed to refresh students");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setHasLoadedOnce(false);
        loadRows(viewMode);
    }, [viewMode]);

    return (
        <main className="space-y-4">
            <section className="flex items-center justify-between">
                <BreadCrump
                    breadCrumpActive={false}
                    options={breadCrumpOptions}
                    title={viewMode === "live" ? "Students Management" : "Archived Students"}
                    subtitles={
                        viewMode === "live"
                            ? "Manage student enrollments and progress"
                            : "Students removed from active list — restore or delete permanently"
                    }
                />
                {viewMode === "live" && canWrite && (
                    <Button
                        buttonText="Add New Student"
                        icon={Plus}
                        onClick={() => navigate("add-student")}
                    />
                )}
                {viewMode === "archived" && (
                    <Button
                        buttonText="Back to Students"
                        varient="secondary"
                        onClick={() => setViewMode("live")}
                    />
                )}
            </section>

            {error && <p className="text-red-500">{error}</p>}

            {viewMode === "live" && (
                <section>
                    <StatusCard data={statusData} gridcount={4} />
                </section>
            )}

            <section>
                <Suspense fallback={<TableSkeleton columns={columns.length || 6} />}>
                    {viewMode === "live" ? (
                        <StudentTable<StudentRow>
                            mode="server"
                            data={rows}
                            columns={columns}
                            rowKey={(row) => String(row.id)}
                            dateFilterAccessor="enrolledAt"
                            loading={loading}
                            totalCount={total}
                            onServerQueryChange={fetchRows}
                            showRowActions
                            tableActionFeatures={tableActionFeatures}
                            onViewRow={handleView}
                            onEditRow={canUpdate ? handleEdit : undefined}
                            onDeleteRow={handleDelete}
                            onArchiveSelected={handleArchiveSelected}
                            onShowArchive={() => setViewMode("archived")}
                            onImportFile={handleImportFile}
                            onExportFile={handleExportFile}
                            onRefresh={handleRefresh}
                        />
                    ) : (
                        <StudentTable<StudentRow>
                            mode="server"
                            data={rows}
                            columns={columns}
                            rowKey={(row) => String(row.id)}
                            loading={loading}
                            totalCount={total}
                            onServerQueryChange={fetchRows}
                            showRowActions
                            tableActionFeatures={tableActionFeatures}
                            renderRowActions={(row) => (
                                <div className="flex items-center gap-2">
                                    {canUpdate && (
                                        <Button buttonText="Restore" varient="primary" onClick={() => handleRestore(row)} />
                                    )}
                                    {canDelete && (
                                        <Button buttonText="Delete Permanently" varient="danger" onClick={() => handlePermanentDelete(row)} />
                                    )}
                                </div>
                            )}
                            onRefresh={handleRefresh}
                        />
                    )}
                </Suspense>
            </section>
        </main>
    );
}