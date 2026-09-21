import { useNavigate } from "react-router-dom";
import BreadCrump from "../../../component/BreadCrump/BreadCrump";
import Button from "../../../component/Buttons/Button";
import { Building2, CircleCheckBig, Info, Plus, ReceiptIndianRupee } from "lucide-react";
import StatusCard from "../../../component/Cards/StatusCard";
import TableSkeleton from "../../../component/Table/TableSkeleton";
import type { ColumnDef, TableQuery } from "../../../component/Table/tableTypes";
import { defaultTableActionFeatures, type ExportFormat, type TableActionFeatures } from "../../../utils/tableDataProps";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import {
    getAllProjects,
    getArchivedProjects,
    deleteProject,
    restoreProject,
    permanentlyDeleteProject,
    getProjectStats,
    importProjects,
    exportProjects,
    type ProjectRow,
    type ProjectStats,
} from "../../../service/projectApi";
import { useAuth } from "../../../context/AuthContext";

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

const ProjectTable = lazy(
    () => import("../../../component/Table/Table")
) as unknown as <T>(props: TableProps<T>) => ReactElement;

const statusBadgeClass: Record<string, string> = {
    COMPLETED: "bg-green-100 text-green-600",
    IN_PROGRESS: "bg-blue-100 text-blue-600",
    CANCELLED: "bg-red-100 text-red-600",
    ON_HOLD: "bg-orange-100 text-orange-600",
    PLANNING: "bg-yellow-100 text-yellow-600",
};

const statusLabel: Record<string, string> = {
    PLANNING: "Planning",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    ON_HOLD: "On Hold",
    CANCELLED: "Cancelled",
};

export default function ProjectMain() {
    const navigate = useNavigate();
    const { permissions } = useAuth();

    const canWrite = permissions?.includes("PROJECT_WRITE");
    const canUpdate = permissions?.includes("PROJECT_UPDATE");
    const canDelete = permissions?.includes("PROJECT_DELETE");

    const [viewMode, setViewMode] = useState<"live" | "archived">("live");

    const breadCrumpOptions = useMemo(() => [{ id: 1, label: "Projects & Clients" }], []);

    const [stats, setStats] = useState<ProjectStats>({
        totalProjects: 0,
        ongoing: 0,
        completed: 0,
        totalRevenue: 0,
    });
    const [statsLoading, setStatsLoading] = useState(false);
    const [allRows, setAllRows] = useState<ProjectRow[]>([]);
    const [rows, setRows] = useState<ProjectRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [_hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const statusData = useMemo(() => [
        { id: 1, title: "Total Projects", value: String(stats.totalProjects), icon: Building2 },
        { id: 2, title: "Ongoing", value: String(stats.ongoing), icon: Info },
        { id: 3, title: "Completed", value: String(stats.completed), icon: CircleCheckBig },
        { id: 4, title: "Total Revenue", value: `₹${(stats.totalRevenue / 100000).toFixed(2)}L`, icon: ReceiptIndianRupee },
    ], [stats]);

    const loadStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const data = await getProjectStats();
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    const liveColumns = useMemo<ColumnDef<ProjectRow>[]>(() => [
        { key: "projectCode", header: "Project ID", sortable: true, accessor: "projectCode", widthClassName: "w-32" },
        { key: "projectName", header: "Project Name", sortable: true, accessor: "projectName", widthClassName: "min-w-[180px]" },
        { key: "location", header: "Location", sortable: true, accessor: "location", widthClassName: "min-w-[200px]" },
        {
            key: "client",
            header: "Client",
            accessor: "client",
            widthClassName: "min-w-[180px]",
            cell: (row) => (
                <div className="text-xs">
                    <div className="font-medium text-gray-900 dark:text-white">{row.client?.company}</div>
                    <div className="text-gray-500 dark:text-gray-400">{row.client?.contactPerson}</div>
                </div>
            )
        },
        { key: "category", header: "Category", sortable: true, accessor: "category", widthClassName: "min-w-[140px]" },
        {
            key: "budget",
            header: "Budget",
            sortable: true,
            accessor: (row) => `₹${row.budget?.toLocaleString("en-IN")}`,
            widthClassName: "w-36"
        },
        { key: "startDate", header: "Start Date", sortable: true, accessor: "startDate", widthClassName: "w-32" },
        { key: "endDate", header: "End Date", sortable: true, accessor: "endDate", widthClassName: "w-32" },
        {
            key: "progress",
            header: "Progress",
            accessor: "progress",
            widthClassName: "w-24",
            cell: (row) => (
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${row.progress}%` }}></div>
                </div>
            )
        },
        {
            key: "status",
            header: "Status",
            accessor: "status",
            widthClassName: "min-w-[140px]",
            cell: (row) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClass[row.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {statusLabel[row.status] ?? row.status}
                </span>
            )
        },
    ], []);

    const archivedColumns = useMemo<ColumnDef<ProjectRow>[]>(() => [
        { key: "projectCode", header: "Project ID", sortable: true, accessor: "projectCode", widthClassName: "w-32" },
        { key: "projectName", header: "Project Name", sortable: true, accessor: "projectName", widthClassName: "min-w-[180px]" },
        {
            key: "client",
            header: "Client",
            accessor: (row) => row.client?.company ?? "-",
            widthClassName: "min-w-[180px]"
        },
        { key: "updatedAt", header: "Archived On", sortable: true, accessor: (row) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "-", widthClassName: "min-w-[160px]" },
    ], []);

    const columns = viewMode === "live" ? liveColumns : archivedColumns;

    const loadRows = useCallback(async (mode: "live" | "archived") => {
        setLoading(true);
        setError(null);
        try {
            const data = mode === "live" ? await getAllProjects() : await getArchivedProjects();
            setAllRows(data);
        } catch (err) {
            console.error(err);
            setError(mode === "live" ? "Failed to load projects" : "Failed to load archived projects");
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

    const matchesQuery = useCallback((rowsToFilter: ProjectRow[], query: TableQuery) => {
        let next = [...rowsToFilter];

        if (query.search.trim()) {
            const needle = query.search.toLowerCase();
            next = next.filter((row) =>
                [row.projectCode, row.projectName, row.location, row.client?.company, row.client?.contactPerson, row.category, row.status]
                    .some((value) => String(value ?? "").toLowerCase().includes(needle))
            );
        }

        if (query.dateFrom || query.dateTo) {
            next = next.filter((row) => {
                const rowDate = row.createdAt?.slice(0, 10) ?? "";
                if (!rowDate) return false;
                const matchesFrom = !query.dateFrom || rowDate >= query.dateFrom;
                const matchesTo = !query.dateTo || rowDate <= query.dateTo;
                return matchesFrom && matchesTo;
            });
        }

        if (query.sortKey) {
            const dir = query.sortDir === "desc" ? -1 : 1;
            next.sort((a, b) => {
                const sortKey = query.sortKey as keyof ProjectRow;
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
    const handleDelete = useCallback(async (row: ProjectRow) => {
        await deleteProject(row.id);
        await loadRows("live");
        await loadStats();
    }, [loadRows, loadStats]);

    const handleArchiveSelected = useCallback(async (selectedRows: ProjectRow[]) => {
        for (const row of selectedRows) {
            await deleteProject(row.id);
        }
        await loadRows("live");
        await loadStats();
    }, [loadRows, loadStats]);

    const handleView = useCallback((row: ProjectRow) => {
        navigate(`view-project/${row.id}`, { state: row });
    }, [navigate]);

    const handleEdit = useCallback((row: ProjectRow) => {
        navigate(`edit-project/${row.id}`, { state: row });
    }, [navigate]);

    // Archived view actions
    const handleRestore = useCallback(async (row: ProjectRow) => {
        if (!confirm(`Restore "${row.projectName}" back to active projects?`)) return;
        await restoreProject(row.id);
        await loadRows("archived");
    }, [loadRows]);

    const handlePermanentDelete = useCallback(async (row: ProjectRow) => {
        if (!confirm(`Permanently delete "${row.projectName}"? This cannot be undone.`)) return;
        try {
            await permanentlyDeleteProject(row.id);
            await loadRows("archived");
        } catch (err) {
            console.error(err);
            alert("Could not delete this project.");
        }
    }, [loadRows]);

    const handleImportFile = useCallback(async (file: File) => {
        await importProjects(file);
        await loadRows("live");
        await loadStats();
    }, [loadRows, loadStats]);

    const handleExportFile = useCallback(async (format: string, selectedIds: string[]) => {
        const exportType = format.toUpperCase() as "EXCEL" | "PDF" | "CSV";
        const projectCodes = selectedIds.length > 0
            ? rows.filter((r) => selectedIds.includes(String(r.id))).map((r) => r.projectCode)
            : undefined;
        await exportProjects(exportType, projectCodes);
    }, [rows]);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const data = await getAllProjects();
            setAllRows(data);
        } catch (err) {
            console.error(err);
            setError("Failed to refresh projects");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setHasLoadedOnce(false);
        loadRows(viewMode);
        if (viewMode === "live") loadStats();
    }, [viewMode]);

    return (
        <main className="space-y-4">
            <section className="flex items-center justify-between">
                <BreadCrump
                    breadCrumpActive={false}
                    options={breadCrumpOptions}
                    title={viewMode === "live" ? "Projects & Clients" : "Archived Projects"}
                    subtitles={
                        viewMode === "live"
                            ? "Manage your client projects and relationships"
                            : "Projects hidden from the active list — restore or delete permanently"
                    }
                />
                {viewMode === "live" && canWrite && (
                    <Button
                        buttonText="Add Project"
                        icon={Plus}
                        onClick={() => navigate("add-project")}
                    />
                )}
                {viewMode === "archived" && (
                    <Button
                        buttonText="Back to Projects"
                        varient="secondary"
                        onClick={() => setViewMode("live")}
                    />
                )}
            </section>

            {error && <p className="text-red-500">{error}</p>}

            {viewMode === "live" && (
                <section>
                    <StatusCard data={statusData} gridcount={4} loading={statsLoading} />
                </section>
            )}

            <section>
                <Suspense fallback={<TableSkeleton columns={columns.length || 6} />}>
                    {viewMode === "live" ? (
                        <ProjectTable<ProjectRow>
                            mode="server"
                            data={rows}
                            columns={columns}
                            rowKey={(row) => String(row.id)}
                            dateFilterAccessor="createdAt"
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
                        <ProjectTable<ProjectRow>
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