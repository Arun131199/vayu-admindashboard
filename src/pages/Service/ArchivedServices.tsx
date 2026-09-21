import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BreadCrump from "../../component/BreadCrump/BreadCrump";
import TableSkeleton from "../../component/Table/TableSkeleton";
import type { ColumnDef, TableQuery } from "../../component/Table/tableTypes";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import { getArchivedServices, restoreService, permanentlyDeleteService, type ServiceRow } from "../../service/serviceApi";
import { useAuth } from "../../context/AuthContext";
import Button from "../../component/Buttons/Button";

type TableProps<T> = {
    mode?: "client" | "server";
    data: T[];
    columns: ColumnDef<T>[];
    rowKey: (row: T) => string;
    loading?: boolean;
    totalCount?: number;
    onServerQueryChange?: (query: TableQuery) => void;
    showRowActions?: boolean;
    renderRowActions?: (row: T) => ReactElement;
};

const ArchivedTable = lazy(
    () => import("../../component/Table/Table")
) as unknown as <T>(props: TableProps<T>) => ReactElement;

export default function ArchivedServices() {
    const navigate = useNavigate();
    const { permissions } = useAuth();
    const canUpdate = permissions?.includes("SERVICE_UPDATE");
    const canDelete = permissions?.includes("SERVICE_DELETE");

    const [allRows, setAllRows] = useState<ServiceRow[]>([]);
    const [rows, setRows] = useState<ServiceRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const columns = useMemo<ColumnDef<ServiceRow>[]>(() => [
        { key: "serviceId", header: "Service ID", sortable: true, accessor: "serviceId", widthClassName: "w-32" },
        { key: "serviceName", header: "Name", sortable: true, accessor: "serviceName", widthClassName: "min-w-[180px]" },
        { key: "category", header: "Category", sortable: true, accessor: "category", widthClassName: "min-w-[140px]" },
        { key: "updatedAt", header: "Archived On", sortable: true, accessor: "updatedAt", widthClassName: "min-w-[160px]" },
    ], []);

    const loadArchived = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getArchivedServices();
            setAllRows(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load archived services");
        } finally {
            setLoading(false);
            setHasLoadedOnce(true);
        }
    }, []);

    useEffect(() => {
        loadArchived();
    }, [loadArchived]);

    const fetchArchived = useCallback((query: TableQuery) => {
        setLoading(true);
        try {
            let next = [...allRows];
            if (query.search.trim()) {
                const needle = query.search.toLowerCase();
                next = next.filter((row) =>
                    Object.values(row).some((value) => String(value).toLowerCase().includes(needle))
                );
            }
            const totalCount = next.length;
            const start = (query.page - 1) * query.pageSize;
            const end = start + query.pageSize;
            setRows(next.slice(start, end));
            setTotal(totalCount);
        } finally {
            setLoading(false);
        }
    }, [allRows]);

    const handleRestore = useCallback(async (row: ServiceRow) => {
        if (!confirm(`Restore "${row.serviceName}" back to live services?`)) return;
        await restoreService(row.id);
        loadArchived();
    }, [loadArchived]);

    const handlePermanentDelete = useCallback(async (row: ServiceRow) => {
        if (!confirm(`Permanently delete "${row.serviceName}"? This cannot be undone.`)) return;
        try {
            await permanentlyDeleteService(row.id);
            loadArchived();
        } catch (err) {
            console.error(err);
            alert("Could not delete — this service may still be referenced in customer carts or orders.");
        }
    }, [loadArchived]);

    return (
        <main className="flex flex-col space-y-4">
            <section className="flex items-center gap-4">
                <ArrowLeft className="cursor-pointer dark:text-white" onClick={() => navigate(-1)} />
                <BreadCrump
                    title="Archived Services"
                    subtitles="Services hidden from customers — restore or delete permanently"
                />
            </section>

            {error && <p className="text-red-500">{error}</p>}

            <section>
                <Suspense fallback={<TableSkeleton columns={columns.length} />}>
                    <ArchivedTable<ServiceRow>
                        mode="server"
                        data={rows}
                        columns={columns}
                        rowKey={(row) => String(row.id)}
                        loading={loading && !hasLoadedOnce}
                        totalCount={total}
                        onServerQueryChange={fetchArchived}
                        showRowActions
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
                    />
                </Suspense>
            </section>
        </main>
    );
}