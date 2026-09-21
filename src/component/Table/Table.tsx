import { CheckCircle2, Eye, GripVertical, Pencil, Trash, TriangleAlert, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ConfirmationPopup from "../Popup/ConfirmationPopup";
import { defaultTableActionFeatures, type ExportFormat, type features, type TableActionFeatures } from "../../utils/tableDataProps";
import DataTable from "./DataTable";
import Modal from "./Modal";
import TableSkeleton from "./TableSkeleton";
import UniverselButton from "./TableAction/UniverselButton";
import TableAction from "./TableAction/TableAction";
import type { AdvancedFilterRule, ColumnDef, FilterOperator, TableQuery } from "./tableTypes";
import useInitialLoading from "../../hooks/useInitialLoading";

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
    renderRowActions?: (row: T) => React.ReactNode;
    tableActionFeatures?: TableActionFeatures;
    onViewRow?: (row: T) => void;
    onEditRow?: (row: T) => void;
    onDeleteRow?: (row: T) => void | Promise<void>;
    onArchiveSelected?: (rows: T[]) => void | Promise<void>;
    onShowArchive?: () => void;
    onImportFile?: (file: File) => void | Promise<void>;
    onExportFile?: (format: string, selectedIds: string[]) => void | Promise<void>;
    onRefresh: () => void;
};

export default function Table<T>({
    mode = "client",
    data,
    columns,
    rowKey,
    dateFilterAccessor,
    loading = false,
    totalCount,
    onServerQueryChange,
    showRowActions,
    renderRowActions,
    tableActionFeatures,
    onViewRow,
    onEditRow,
    onDeleteRow,
    onArchiveSelected,
    onShowArchive,
    onImportFile,
    onExportFile,
    onRefresh
}: TableProps<T>) {
    const initialLoading = useInitialLoading();
    const [searchValue, setSearchValue] = useState("");
    const [importFile, setImportFile] = useState<File | null>(null);
    const [dateRangeForm, setDateRangeForm] = useState({ from: "", to: "" });

    const [activePanel, setActivePanel] = useState<
        null | "filter" | "columns" | "dateRange" | "import" | "export" | "deleteConfirm" | "archive" | "view"
    >(null);

    const [deleteTargetRow, setDeleteTargetRow] = useState<T | null>(null);
    const [actionLoading, setActionLoading] = useState<null | "delete" | "import" | "export" | "archive">(null);
    const [successPopup, setSuccessPopup] = useState<{
        title: string;
        message: string;
        confirmButtonText?: string;
    } | null>(null);
    const [reloadKey, _setReloadKey] = useState(0);
    const [draftFilters, setDraftFilters] = useState<AdvancedFilterRule[]>([]);
    const [filterPopoverOffset, setFilterPopoverOffset] = useState({ x: 0, y: 0 });
    const [viewData, setViewData] = useState<T | null>(null);
    const filterContainerRef = useRef<HTMLDivElement | null>(null);
    const dragStateRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);

    const [query, setQuery] = useState<TableQuery>({
        page: 1,
        pageSize: 10,
        search: "",
        advancedFilters: [],
        dateFrom: "",
        dateTo: "",
        sortKey: "id",
        sortDir: "asc"
    });

    const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
    const [visibleColumnKeys, setVisibleColumnKeys] = useState<Set<string>>(
        new Set(columns.map((column) => column.key))
    );

    const visibleColumns = columns.filter((column) => visibleColumnKeys.has(column.key));
    const canUseDateFilter = Boolean(dateFilterAccessor);
    const resolvedTableActionFeatures: features = {
        ...defaultTableActionFeatures,
        ...tableActionFeatures,
        showDateFilter: tableActionFeatures?.showDateFilter ?? canUseDateFilter
    };

    useEffect(() => {
        if (mode !== "server") return;
        onServerQueryChange?.(query);
    }, [mode, onServerQueryChange, query, reloadKey]);

    useEffect(() => {
        if (activePanel !== "filter") return;

        const handleMouseDown = (event: MouseEvent) => {
            if (!filterContainerRef.current?.contains(event.target as Node)) {
                setActivePanel(null);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setActivePanel(null);
            }
        };

        document.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [activePanel]);

    const updateQuery = (next: TableQuery | ((prev: TableQuery) => TableQuery)) => {
        setQuery((prev) => (typeof next === "function" ? next(prev) : next));
    };

    const onRowCLick = () => {
        console.log("Row clicked");
    };

    const filterableColumns = columns.filter((column) => Boolean(column.accessor));
    const defaultFilterColumnKey = filterableColumns[0]?.key ?? "";

    const createFilterRule = (): AdvancedFilterRule => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        columnKey: defaultFilterColumnKey,
        operator: "contains",
        value: ""
    });

    const onFilter = () => {
        setDraftFilters(
            query.advancedFilters && query.advancedFilters.length > 0
                ? query.advancedFilters
                : [createFilterRule()]
        );
        setFilterPopoverOffset({ x: 0, y: 0 });
        setActivePanel("filter");
    };
    const onColumnSettings = () => setActivePanel("columns");
    const onDateFilter = () => {
        setDateRangeForm({
            from: query.dateFrom ?? "",
            to: query.dateTo ?? ""
        });
        setActivePanel("dateRange");
    };
    const onImportClick = () => setActivePanel("import");
    const onExportClick = () => setActivePanel("export");
    const onDelete = () => {
        setDeleteTargetRow(null);
        setActivePanel("deleteConfirm");
    };
    const onEdit = () => console.log("Edit clicked");
    const onView = () => setActivePanel("view");
    const onArchiveData = () => setActivePanel("archive");

    const handleRefresh = async () => {
        await onRefresh();
    };

    const onCustomAction = (actionId: string | number) => {
        if (actionId === 1) {
            setActivePanel("archive");
        }
        if (actionId === 2) {
            onShowArchive?.();
        }
    };


    const onExportFormat = async (format: ExportFormat) => {
        setActionLoading("export");
        try {
            await onExportFile?.(format, Array.from(selectedRowIds));
            setActionLoading(null);
            setSuccessPopup({
                title: "Export Complete",
                message: `${String(format).toUpperCase()} export has been completed successfully.`,
                confirmButtonText: "Done"
            });
            setActivePanel(null);
        } catch (err) {
            console.error(err);
            setActionLoading(null);
        }
    };

    const closeSuccessPopup = () => setSuccessPopup(null);

    const handleDeleteConfirm = async () => {
        setActionLoading("delete");
        try {
            if (deleteTargetRow) {
                await onDeleteRow?.(deleteTargetRow);
                setSelectedRowIds((prev) => {
                    const next = new Set(prev);
                    next.delete(rowKey(deleteTargetRow));
                    return next;
                });
            } else if (selectedRowIds.size > 0) {
                const targets = data.filter((row) => selectedRowIds.has(rowKey(row)));
                for (const row of targets) {
                    await onDeleteRow?.(row);
                }
                setSelectedRowIds(new Set());
            }

            setActionLoading(null);
            setDeleteTargetRow(null);
            setActivePanel(null);
            setSuccessPopup({
                title: "Delete Successful",
                message: deleteTargetRow
                    ? "The selected record was deleted successfully."
                    : `${selectedRowIds.size} records were deleted successfully.`,
                confirmButtonText: "Okay"
            });
        } catch (err) {
            console.error(err);
            setActionLoading(null);
            // venumna oru error popup state add pannalam, ippodhaikku console mattum
        }
    };

    const handleArchiveConfirm = async () => {
        setActionLoading("archive");
        try {
            const targets = data.filter((row) => selectedRowIds.has(rowKey(row)));
            await onArchiveSelected?.(targets);
            setSelectedRowIds(new Set());
            setActionLoading(null);
            setActivePanel(null);
            setSuccessPopup({
                title: "Archive Successful",
                message: `${targets.length} record${targets.length > 1 ? "s" : ""} archived successfully.`,
                confirmButtonText: "Okay"
            });
        } catch (err) {
            console.error(err);
            setActionLoading(null);
        }
    };

    const handleImportConfirm = async () => {
        if (!importFile) return;
        setActionLoading("import");
        try {
            await onImportFile?.(importFile);
            setActionLoading(null);
            setImportFile(null);
            setActivePanel(null);
            setSuccessPopup({
                title: "Import Successful",
                message: `${importFile.name} has been imported successfully.`,
                confirmButtonText: "Great"
            });
        } catch (err) {
            console.error(err);
            setActionLoading(null);
        }
    };

    const applyDateRangeFilter = () => {
        updateQuery((prev) => ({
            ...prev,
            dateFrom: dateRangeForm.from,
            dateTo: dateRangeForm.to,
            page: 1
        }));
        setActivePanel(null);
    };

    const clearDateRangeFilter = () => {
        setDateRangeForm({ from: "", to: "" });
        updateQuery((prev) => ({
            ...prev,
            dateFrom: "",
            dateTo: "",
            page: 1
        }));
        setActivePanel(null);
    };

    const filterOperatorOptions: Array<{ value: FilterOperator; label: string }> = [
        { value: "contains", label: "Contains" },
        { value: "equals", label: "Equals" },
        { value: "startsWith", label: "Starts With" },
        { value: "endsWith", label: "Ends With" },
        { value: "notEquals", label: "Not Equals" }
    ];

    const applyAdvancedFilters = () => {
        updateQuery((prev) => ({
            ...prev,
            advancedFilters: draftFilters.filter((rule) => rule.columnKey && rule.value.trim()),
            page: 1
        }));
        setActivePanel(null);
    };

    const clearAdvancedFilters = () => {
        setDraftFilters([createFilterRule()]);
        updateQuery((prev) => ({
            ...prev,
            advancedFilters: [],
            page: 1
        }));
        setActivePanel(null);
    };

    const handleFilterPopoverDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
        if ((event.target as HTMLElement).closest("button")) return;

        dragStateRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            originX: filterPopoverOffset.x,
            originY: filterPopoverOffset.y
        };

        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handleFilterPopoverDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const dragState = dragStateRef.current;
        if (!dragState || dragState.pointerId !== event.pointerId) return;

        setFilterPopoverOffset({
            x: dragState.originX + (event.clientX - dragState.startX),
            y: dragState.originY + (event.clientY - dragState.startY)
        });
    };

    const handleFilterPopoverDragEnd = (event: React.PointerEvent<HTMLDivElement>) => {
        if (dragStateRef.current?.pointerId === event.pointerId) {
            dragStateRef.current = null;
        }

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const filterPopover = activePanel === "filter" ? (
        <div
            className="absolute left-0 top-full z-50 mt-2 w-[min(42rem,calc(100vw-2rem))]"
            style={{ transform: `translate(${filterPopoverOffset.x}px, ${filterPopoverOffset.y}px)` }}
        >
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
                <div
                    className="flex cursor-move items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-950"
                    onPointerDown={handleFilterPopoverDragStart}
                    onPointerMove={handleFilterPopoverDragMove}
                    onPointerUp={handleFilterPopoverDragEnd}
                    onPointerCancel={handleFilterPopoverDragEnd}
                >
                    <div className="flex items-center gap-2">
                        <GripVertical size={16} className="text-gray-400 dark:text-gray-500" />
                        <div>
                            <p className="text-xs font-semibold dark:text-white">Filter</p>

                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setActivePanel(null)}
                        className="rounded-md border border-gray-200 p-2 text-gray-600 transition-colors hover:text-yellow-600 dark:border-gray-700 dark:text-gray-300"
                        aria-label="Close filter panel"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-auto p-4">
                    {filterableColumns.length === 0 ? (
                        <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                            No filterable columns available for this table.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {draftFilters.map((rule, index) => (
                                <div key={rule.id} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700 md:grid-cols-[1.2fr_1fr_1.2fr_auto]">
                                    <div>
                                        <label className="text-xs font-medium dark:text-white">Column</label>
                                        <select
                                            value={rule.columnKey}
                                            onChange={(event) =>
                                                setDraftFilters((prev) =>
                                                    prev.map((entry) =>
                                                        entry.id === rule.id ? { ...entry, columnKey: event.target.value } : entry
                                                    )
                                                )
                                            }
                                            className="mt-1 w-full rounded-md border dark:bg-gray-900 border-gray-300 bg-transparent px-3 py-2 text-xs dark:border-gray-700 dark:text-white"
                                        >
                                            {filterableColumns.map((column) => (
                                                <option key={column.key} value={column.key} className="text-black dark:text-white">
                                                    {column.header}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium dark:text-white">Condition</label>
                                        <select
                                            value={rule.operator}
                                            onChange={(event) =>
                                                setDraftFilters((prev) =>
                                                    prev.map((entry) =>
                                                        entry.id === rule.id
                                                            ? { ...entry, operator: event.target.value as FilterOperator }
                                                            : entry
                                                    )
                                                )
                                            }
                                            className="mt-1 w-full rounded-md border border-gray-300 bg-transparent dark:bg-gray-900 px-3 py-2 text-xs dark:border-gray-700 dark:text-white"
                                        >
                                            {filterOperatorOptions.map((option) => (
                                                <option key={option.value} value={option.value} className="text-black dark:text-white">
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium dark:text-white">Value</label>
                                        <input
                                            type="text"
                                            value={rule.value}
                                            onChange={(event) =>
                                                setDraftFilters((prev) =>
                                                    prev.map((entry) =>
                                                        entry.id === rule.id ? { ...entry, value: event.target.value } : entry
                                                    )
                                                )
                                            }
                                            placeholder="Enter value"
                                            className="mt-1 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-xs dark:border-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDraftFilters((prev) =>
                                                    prev.length > 1 ? prev.filter((entry) => entry.id !== rule.id) : prev
                                                )
                                            }
                                            disabled={draftFilters.length === 1}
                                            className="w-full rounded-md border border-red-200 px-4 py-2 text-xs font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="md:col-span-4">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Rule {index + 1} will be matched with the table data.
                                        </p>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => setDraftFilters((prev) => [...prev, createFilterRule()])}
                                className="rounded-md border border-dashed border-gray-300 px-4 py-2 text-xs font-medium dark:border-gray-700 dark:text-white"
                            >
                                Add Filter
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                    <button className="rounded-md border border-gray-300 px-4 py-2 text-xs dark:border-gray-700 dark:text-white" onClick={clearAdvancedFilters}>
                        Clear
                    </button>
                    <button className="rounded-md border border-gray-300 px-4 py-2 text-xs dark:border-gray-700 dark:text-white" onClick={() => setActivePanel(null)}>
                        Cancel
                    </button>
                    <button
                        className="rounded-md bg-yellow-500 px-4 py-2 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={applyAdvancedFilters}
                        disabled={filterableColumns.length === 0}
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    ) : null;

    if (initialLoading || loading) {
        return (
            <TableSkeleton
                columns={Math.max(visibleColumns.length, 1)}
                showActions={Boolean(showRowActions || renderRowActions)}
            />
        );
    }

    return (
        <main className="space-y-4">
            <section>
                <TableAction
                    features={resolvedTableActionFeatures}
                    searchValue={searchValue}
                    setSearchValue={(next) => {
                        setSearchValue(next);
                        const value = typeof next === "function" ? next(searchValue) : next;
                        updateQuery((prev) => ({ ...prev, search: value, page: 1 }));
                    }}
                    filterPopover={filterPopover}
                    filterContainerRef={filterContainerRef}
                    onRowCLick={onRowCLick}
                    onFilter={onFilter}
                    onRefresh={handleRefresh}
                    onColumnSettings={onColumnSettings}
                    onArchiveData={onArchiveData}
                    onDateFilter={onDateFilter}
                    onImportClick={onImportClick}
                    onExportClick={onExportClick}
                    onExportFormat={onExportFormat}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onView={onView}
                    onCustomAction={onCustomAction}
                />
            </section>

            <Modal open={activePanel === "columns"} title="Column Settings" onClose={() => setActivePanel(null)} size="lg">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {columns.map((column) => {
                        const checked = visibleColumnKeys.has(column.key);
                        return (
                            <label key={column.key} className="flex items-center gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-700">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) => {
                                        const next = new Set(visibleColumnKeys);
                                        if (event.target.checked) next.add(column.key);
                                        else next.delete(column.key);
                                        setVisibleColumnKeys(next);
                                    }}
                                />
                                <span className="dark:text-white">{column.header}</span>
                            </label>
                        );
                    })}
                </div>
                <div className="mt-5 flex items-center justify-between gap-2">
                    <button
                        className="rounded-md border border-gray-300 px-4 py-2 dark:border-gray-700 dark:text-white"
                        onClick={() => setVisibleColumnKeys(new Set(columns.map((column) => column.key)))}
                    >
                        Show all
                    </button>
                    <button className="rounded-md border border-gray-300 px-4 py-2 dark:border-gray-700 dark:text-white" onClick={() => setActivePanel(null)}>
                        Close
                    </button>
                </div>
            </Modal>

            <Modal open={activePanel === "import"} title="Import" onClose={() => setActivePanel(null)}>
                <div className="space-y-3">
                    <div className="text-sm text-gray-600 dark:text-gray-300">Upload a CSV/Excel file to import rows.</div>
                    <input
                        type="file"
                        className="block w-full text-sm dark:text-white"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        onChange={(event) => setImportFile(event.target.files?.[0] ?? null)}
                    />
                </div>
                <div className="mt-5 flex items-center justify-end gap-2">
                    <button className="rounded-md border border-gray-300 px-4 py-2 dark:border-gray-700 dark:text-white" onClick={() => setActivePanel(null)}>
                        Cancel
                    </button>
                    <button
                        className="rounded-md bg-yellow-500 px-4 py-2 font-semibold text-black"
                        onClick={handleImportConfirm}
                        disabled={!importFile || actionLoading === "import"}
                    >
                        {actionLoading === "import" ? "Importing..." : "Import"}
                    </button>
                </div>
            </Modal>

            <Modal open={activePanel === "dateRange"} title="Date Range Filter" onClose={() => setActivePanel(null)}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="text-sm font-medium dark:text-white">From Date</label>
                        <input
                            type="date"
                            value={dateRangeForm.from}
                            onChange={(event) => setDateRangeForm((prev) => ({ ...prev, from: event.target.value }))}
                            className="mt-1 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium dark:text-white">To Date</label>
                        <input
                            type="date"
                            value={dateRangeForm.to}
                            onChange={(event) => setDateRangeForm((prev) => ({ ...prev, to: event.target.value }))}
                            className="mt-1 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700 dark:text-white"
                        />
                    </div>
                </div>
                <div className="mt-5 flex items-center justify-end gap-2">
                    <button className="rounded-md border border-gray-300 px-4 py-2 dark:border-gray-700 dark:text-white" onClick={clearDateRangeFilter}>
                        Clear
                    </button>
                    <button className="rounded-md border border-gray-300 px-4 py-2 dark:border-gray-700 dark:text-white" onClick={() => setActivePanel(null)}>
                        Cancel
                    </button>
                    <button className="rounded-md bg-yellow-500 px-4 py-2 font-semibold text-black" onClick={applyDateRangeFilter}>
                        Apply
                    </button>
                </div>
            </Modal>

            <ConfirmationPopup
                open={activePanel === "deleteConfirm"}
                type="danger"
                icon={TriangleAlert}
                title="Confirm Delete"
                message={
                    deleteTargetRow
                        ? "Are you sure you want to delete this record?"
                        : selectedRowIds.size > 0
                            ? `Are you sure you want to delete ${selectedRowIds.size} selected records?`
                            : "Are you sure you want to delete the selected data?"
                }
                closeButtonText="Cancel"
                confirmButtonText="Delete"
                loading={actionLoading === "delete"}
                confirmDisabled={!deleteTargetRow && selectedRowIds.size === 0}
                onClose={() => {
                    if (actionLoading === "delete") return;
                    setActivePanel(null);
                    setDeleteTargetRow(null);
                }}
                onConfirm={handleDeleteConfirm}
            />

            <ConfirmationPopup
                open={activePanel === "archive"}
                type="danger"
                icon={TriangleAlert}
                title="Confirm Archive"
                message={
                    selectedRowIds.size > 0
                        ? `Are you sure you want to archive ${selectedRowIds.size} selected record${selectedRowIds.size > 1 ? "s" : ""}? They will be hidden from customers.`
                        : "Select at least one record to archive."
                }
                closeButtonText="Cancel"
                confirmButtonText="Archive"
                loading={actionLoading === "archive"}
                confirmDisabled={selectedRowIds.size === 0}
                onClose={() => {
                    if (actionLoading === "archive") return;
                    setActivePanel(null);
                }}
                onConfirm={handleArchiveConfirm}
            />

            <ConfirmationPopup
                open={Boolean(successPopup)}
                type="success"
                icon={CheckCircle2}
                title={successPopup?.title ?? ""}
                message={successPopup?.message ?? ""}
                confirmButtonText={successPopup?.confirmButtonText ?? "Close"}
                showCloseButton={false}
                onClose={closeSuccessPopup}
                onConfirm={closeSuccessPopup}
            />

            <DataTable<T>
                mode={mode}
                data={data}
                columns={visibleColumns}
                rowKey={rowKey}
                dateFilterAccessor={dateFilterAccessor}
                query={query}
                onQueryChange={updateQuery}
                loading={loading}
                totalCount={totalCount}
                selectable
                selectedRowIds={selectedRowIds}
                onSelectedRowIdsChange={setSelectedRowIds}
                showRowActions={showRowActions}
                renderRowActions={
                    renderRowActions ??
                    ((row) => (
                        <div className="flex items-center gap-2">
                            {resolvedTableActionFeatures.showView && (
                                <UniverselButton
                                    icon={Eye}
                                    onClick={() => {
                                        onViewRow?.(row);
                                    }}
                                    label="View"
                                />
                            )}
                            {resolvedTableActionFeatures.showEdit && (
                                <UniverselButton
                                    icon={Pencil}
                                    onClick={() => onEditRow?.(row)}
                                    label="Edit"
                                />
                            )}
                            {resolvedTableActionFeatures.showDelete && (
                                <UniverselButton
                                    icon={Trash}
                                    onClick={() => {
                                        setDeleteTargetRow(row);
                                        setActivePanel("deleteConfirm");
                                    }}
                                    label="Delete"
                                />
                            )}
                        </div>
                    ))
                }
            />

            <Modal open={activePanel === "view"} title="View Details" onClose={() => {
                setActivePanel(null);
                setViewData(null);
            }} size="lg">
                {viewData ? (
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                        {columns.map((column) => {
                            let value: any;
                            if (typeof column.accessor === "function") {
                                value = column.accessor(viewData);
                            } else if (typeof column.accessor === "string") {
                                value = (viewData as any)[column.accessor];
                            } else {
                                value = (viewData as any)[column.key];
                            }

                            const renderValue = (val: any): React.ReactNode => {
                                if (val === null || val === undefined) {
                                    return <span className="text-gray-400">-</span>;
                                }

                                if (typeof val === "object") {
                                    if (Array.isArray(val)) {
                                        if (val.length === 0) {
                                            return <span className="text-gray-400">No items</span>;
                                        }
                                        return (
                                            <ul className="space-y-2">
                                                {val.map((item, idx) => (
                                                    <li key={idx} className="bg-gray-50 dark:bg-gray-800 rounded p-2 text-xs">
                                                        {typeof item === "object" ? JSON.stringify(item) : String(item)}
                                                    </li>
                                                ))}
                                            </ul>
                                        );
                                    } else {
                                        return (
                                            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 space-y-2 text-xs">
                                                {Object.entries(val).map(([key, v]) => (
                                                    <div key={key} className="flex justify-between">
                                                        <span className="font-medium text-gray-600 dark:text-gray-400">{key}:</span>
                                                        <span className="text-gray-800 dark:text-gray-200 text-right flex-1 ml-2 word-break">
                                                            {typeof v === "object" ? JSON.stringify(v) : String(v || "-")}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                }

                                return <span className="text-gray-800 dark:text-gray-200 word-break">{String(val)}</span>;
                            };

                            return (
                                <div key={column.key} className="border-b border-gray-200 pb-3 dark:border-gray-700">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-2">{column.header}</label>
                                    <div className="text-sm">
                                        {renderValue(value)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400">No data to display</div>
                )}
                <div className="mt-6 flex items-center justify-end gap-2">
                    <button className="rounded-md border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:text-white" onClick={() => {
                        setActivePanel(null);
                        setViewData(null);
                    }}>
                        Close
                    </button>
                </div>
            </Modal>
        </main>
    );
}
