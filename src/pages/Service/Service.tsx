import { useNavigate } from "react-router-dom";
import BreadCrump from "../../component/BreadCrump/BreadCrump";
import Button from "../../component/Buttons/Button";
import { BookmarkCheck, Calculator, ChartBarStacked, Plus, Toolbox } from "lucide-react";
import StatusCard from "../../component/Cards/StatusCard";
import TableSkeleton from "../../component/Table/TableSkeleton";
import type { ColumnDef, TableQuery } from "../../component/Table/tableTypes";
import { defaultTableActionFeatures, type ExportFormat, type TableActionFeatures } from "../../utils/tableDataProps";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import {
    getAllServices,
    getArchivedServices,
    deleteService,
    restoreService,
    permanentlyDeleteService,
    getServiceStats,
    type ServiceRow,
    type ServiceStats,
    importServices,
    exportServices
} from "../../service/serviceApi";
import { useAuth } from "../../context/AuthContext";

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

const ServiceTable = lazy(
    () => import("../../component/Table/Table")
) as unknown as <T>(props: TableProps<T>) => ReactElement;

export default function Service() {
    const navigate = useNavigate();
    const { permissions } = useAuth();

    const canWrite = permissions?.includes("SERVICE_WRITE");
    const canUpdate = permissions?.includes("SERVICE_UPDATE");
    const canDelete = permissions?.includes("SERVICE_DELETE");

    const [viewMode, setViewMode] = useState<"live" | "archived">("live");

    const breadCrumpOptions = useMemo(() => [{ id: 1, label: "Services" }], []);

    const [stats, setStats] = useState<ServiceStats>({
        totalServices: 0,
        activeServices: 0,
        totalBookings: 0,
        categories: 0,
    });
    const [statsLoading, setStatsLoading] = useState(false);
    const [allRows, setAllRows] = useState<ServiceRow[]>([]);
    const [rows, setRows] = useState<ServiceRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [_hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const statusData = useMemo(() => [
        { id: 1, title: "Total Services", value: String(stats.totalServices), icon: Calculator },
        { id: 2, title: "Active Services", value: String(stats.activeServices), icon: Toolbox },
        { id: 3, title: "Total Bookings", value: String(stats.totalBookings), icon: BookmarkCheck },
        { id: 4, title: "Categories", value: String(stats.categories), icon: ChartBarStacked }
    ], [stats]);

    const loadStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const data = await getServiceStats();
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    const liveColumns = useMemo<ColumnDef<ServiceRow>[]>(() => [
        { key: "serviceId", header: "Service ID", sortable: true, accessor: "serviceId", widthClassName: "w-32" },
        { key: "serviceName", header: "Name", sortable: true, accessor: "serviceName", widthClassName: "min-w-[180px]" },
        { key: "category", header: "Category", sortable: true, accessor: "category", widthClassName: "min-w-[140px]" },
        {
            key: "active",
            header: "Status",
            sortable: true,
            accessor: "active",
            widthClassName: "w-36",
            cell: (row) => (
                <span
                    className={[
                        "inline-flex min-w-24 items-center justify-center rounded-full px-3 py-1 text-xs font-semibold",
                        row.active ? "bg-green-300 text-green-700" : "bg-red-200 text-red-700"
                    ].join(" ")}
                >
                    {row.active ? "Active" : "Inactive"}
                </span>
            )
        },
        { key: "createdAt", header: "Created At", sortable: true, accessor: "createdAt", widthClassName: "min-w-[160px]" },
    ], []);

    const archivedColumns = useMemo<ColumnDef<ServiceRow>[]>(() => [
        { key: "serviceId", header: "Service ID", sortable: true, accessor: "serviceId", widthClassName: "w-32" },
        { key: "serviceName", header: "Name", sortable: true, accessor: "serviceName", widthClassName: "min-w-[180px]" },
        { key: "category", header: "Category", sortable: true, accessor: "category", widthClassName: "min-w-[140px]" },
        { key: "updatedAt", header: "Archived On", sortable: true, accessor: "updatedAt", widthClassName: "min-w-[160px]" },
    ], []);

    const columns = viewMode === "live" ? liveColumns : archivedColumns;

    const loadRows = useCallback(async (mode: "live" | "archived") => {
        setLoading(true);
        setError(null);
        try {
            const data = mode === "live" ? await getAllServices() : await getArchivedServices();
            setAllRows(data);
        } catch (err) {
            console.error(err);
            setError(mode === "live" ? "Failed to load services" : "Failed to load archived services");
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

    const matchesQuery = useCallback((rowsToFilter: ServiceRow[], query: TableQuery) => {
        let next = [...rowsToFilter];

        if (query.search.trim()) {
            const needle = query.search.toLowerCase();
            next = next.filter((row) =>
                Object.values(row).some((value) => String(value).toLowerCase().includes(needle))
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
                const sortKey = query.sortKey as keyof ServiceRow;
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
    const handleDelete = useCallback(async (row: ServiceRow) => {
        await deleteService(row.id);
        await loadRows("live");
        await loadStats();
    }, [loadRows, loadStats]);

    const handleArchiveSelected = useCallback(async (selectedRows: ServiceRow[]) => {
        for (const row of selectedRows) {
            await deleteService(row.id);
        }
        await loadRows("live");
        await loadStats();
    }, [loadRows, loadStats]);

    const handleView = useCallback((row: ServiceRow) => {
        navigate(`view-service/${row.id}`, { state: row });
    }, [navigate]);

    const handleEdit = useCallback((row: ServiceRow) => {
        navigate(`edit-service/${row.id}`, { state: row });
    }, [navigate]);

    // Archived view actions
    const handleRestore = useCallback(async (row: ServiceRow) => {
        if (!confirm(`Restore "${row.serviceName}" back to live services?`)) return;
        await restoreService(row.id);
        await loadRows("archived");
    }, [loadRows]);

    const handlePermanentDelete = useCallback(async (row: ServiceRow) => {
        if (!confirm(`Permanently delete "${row.serviceName}"? This cannot be undone.`)) return;
        try {
            await permanentlyDeleteService(row.id);
            await loadRows("archived");
        } catch (err) {
            console.error(err);
            alert("Could not delete — this service may still be referenced in customer carts or orders.");
        }
    }, [loadRows]);

    const handleImportFile = useCallback(async (file: File) => {
        await importServices(file);
        await loadRows("live");
        await loadStats();
    }, [loadRows, loadStats]);

    const handleExportFile = useCallback(async (format: string, selectedIds: string[]) => {
        const exportType = format.toUpperCase() as "EXCEL" | "PDF" | "CSV";
        const serviceIds = selectedIds.length > 0
            ? rows.filter((r) => selectedIds.includes(String(r.id))).map((r) => r.serviceId)
            : undefined;
        await exportServices(exportType, serviceIds);
    }, [rows]);

    const handleRefresh = async () => {
        setLoading(true);

        try {
            const data = await getAllServices();

            setAllRows(data);

            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (err) {
            console.error(err);
            setError("Failed to refresh services");
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
        <main className="flex flex-col space-y-4">
            <section className="flex items-center justify-between">
                <BreadCrump
                    breadCrumpActive={false}
                    options={breadCrumpOptions}
                    title={viewMode === "live" ? "Service Management" : "Archived Services"}
                    subtitles={
                        viewMode === "live"
                            ? "Manage your drone services and offerings"
                            : "Services hidden from customers — restore or delete permanently"
                    }
                />
                {viewMode === "live" && canWrite && (
                    <Button
                        buttonText="Add New Service"
                        icon={Plus}
                        varient="primary"
                        onClick={() => navigate("add-service")}
                    />
                )}
                {viewMode === "archived" && (
                    <Button
                        buttonText="Back to Services"
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
                        <ServiceTable<ServiceRow>
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
                        <ServiceTable<ServiceRow>
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