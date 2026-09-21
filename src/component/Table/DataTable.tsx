import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo } from "react";
import type { AdvancedFilterRule, ColumnDef, TableQuery } from "./tableTypes";

type DataTableProps<T> = {
    mode?: "client" | "server";
    data: T[];
    columns: ColumnDef<T>[];
    rowKey: (row: T) => string;
    dateFilterAccessor?: keyof T;
    loading?: boolean;

    query: TableQuery;
    onQueryChange: (next: TableQuery | ((prev: TableQuery) => TableQuery)) => void;

    totalCount?: number;

    selectable?: boolean;
    selectedRowIds?: Set<string>;
    onSelectedRowIdsChange?: (next: Set<string>) => void;

    showRowActions?: boolean;
    renderRowActions?: (row: T) => React.ReactNode;
};

function safeString(value: unknown) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}

function getAccessorValue<T>(row: T, accessor: keyof T) {
    return (row as Record<string, unknown>)[String(accessor)];
}

function getColumnValue<T>(row: T, column: ColumnDef<T>) {
    if (!column.accessor) return "";
    if (typeof column.accessor === "function") return column.accessor(row);
    return getAccessorValue(row, column.accessor);
}

function matchesAdvancedFilter<T>(row: T, columns: ColumnDef<T>[], rule: AdvancedFilterRule) {
    const column = columns.find((entry) => entry.key === rule.columnKey);
    if (!column?.accessor) return true;

    const rawValue = safeString(getColumnValue(row, column)).toLowerCase();
    const filterValue = rule.value.trim().toLowerCase();

    if (!filterValue) return true;

    switch (rule.operator) {
        case "equals":
            return rawValue === filterValue;
        case "startsWith":
            return rawValue.startsWith(filterValue);
        case "endsWith":
            return rawValue.endsWith(filterValue);
        case "notEquals":
            return rawValue !== filterValue;
        case "contains":
        default:
            return rawValue.includes(filterValue);
    }
}

export default function DataTable<T>({
    mode = "client",
    data,
    columns,
    rowKey,
    dateFilterAccessor,
    loading = false,
    query,
    onQueryChange,
    totalCount,
    selectable = true,
    selectedRowIds,
    onSelectedRowIdsChange,
    showRowActions,
    renderRowActions
}: DataTableProps<T>) {
    const advancedFilters = useMemo(
        () => (query.advancedFilters ?? []).filter((rule) => rule.columnKey && rule.value.trim()),
        [query.advancedFilters]
    );

    const clientFiltered = useMemo(() => {
        if (mode !== "client") return data;

        let next = [...data];

        if (query.search.trim()) {
            const needle = query.search.toLowerCase();
            next = next.filter((row) => {
                const haystack = columns
                    .map((col) => {
                        if (col.cell) return safeString(col.cell(row));
                        if (col.accessor) return safeString(getColumnValue(row, col));
                        return "";
                    })
                    .join(" ")
                    .toLowerCase();
                return haystack.includes(needle);
            });
        }

        if (advancedFilters.length > 0) {
            next = next.filter((row) =>
                advancedFilters.every((rule) => matchesAdvancedFilter(row, columns, rule))
            );
        }

        if (dateFilterAccessor && (query.dateFrom || query.dateTo)) {
            next = next.filter((row) => {
                const rowDate = safeString(getAccessorValue(row, dateFilterAccessor));
                if (!rowDate) return false;

                const matchesFrom = !query.dateFrom || rowDate >= query.dateFrom;
                const matchesTo = !query.dateTo || rowDate <= query.dateTo;

                return matchesFrom && matchesTo;
            });
        }

        return next;
    }, [advancedFilters, columns, data, dateFilterAccessor, mode, query.dateFrom, query.dateTo, query.search]);

    const effectiveTotal = mode === "server" ? (totalCount ?? data.length) : clientFiltered.length;
    const totalPages = Math.max(1, Math.ceil(effectiveTotal / query.pageSize));
    const hasActionColumn = Boolean(showRowActions && renderRowActions);
    const skeletonRows = Math.max(3, Math.min(query.pageSize, 6));

    useEffect(() => {
        if (query.page > totalPages) {
            onQueryChange({ ...query, page: totalPages });
        }
    }, [onQueryChange, query, totalPages]);

    const clientProcessed = useMemo(() => {
        if (mode !== "client") return data;

        let next = [...clientFiltered];

        if (query.search.trim()) {
            const needle = query.search.toLowerCase();
            next = next.filter((row) => {
                const haystack = columns
                    .map((col) => {
                        if (col.cell) return safeString(col.cell(row));
                        if (col.accessor) return safeString(getColumnValue(row, col));
                        return "";
                    })
                    .join(" ")
                    .toLowerCase();
                return haystack.includes(needle);
            });
        }

        if (advancedFilters.length > 0) {
            next = next.filter((row) =>
                advancedFilters.every((rule) => matchesAdvancedFilter(row, columns, rule))
            );
        }

        if (dateFilterAccessor && (query.dateFrom || query.dateTo)) {
            next = next.filter((row) => {
                const rowDate = safeString(getAccessorValue(row, dateFilterAccessor));
                if (!rowDate) return false;

                const matchesFrom = !query.dateFrom || rowDate >= query.dateFrom;
                const matchesTo = !query.dateTo || rowDate <= query.dateTo;

                return matchesFrom && matchesTo;
            });
        }

        if (query.sortKey) {
            const sortCol = columns.find((c) => c.key === query.sortKey);
            if (sortCol) {
                next.sort((a, b) => {
                    const av = sortCol.cell
                        ? safeString(sortCol.cell(a))
                        : sortCol.accessor
                            ? safeString(getColumnValue(a, sortCol))
                            : "";
                    const bv = sortCol.cell
                        ? safeString(sortCol.cell(b))
                        : sortCol.accessor
                            ? safeString(getColumnValue(b, sortCol))
                            : "";
                    const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });
                    return query.sortDir === "desc" ? -cmp : cmp;
                });
            }
        }

        const start = (query.page - 1) * query.pageSize;
        const end = start + query.pageSize;
        return next.slice(start, end);
    }, [advancedFilters, columns, data, dateFilterAccessor, mode, query.dateFrom, query.dateTo, query.page, query.pageSize, query.search, query.sortDir, query.sortKey]);

    const pageRows = mode === "client" ? clientProcessed : data;
    const pageRowIds = useMemo(() => pageRows.map(rowKey), [pageRows, rowKey]);
    const isAllSelectedOnPage =
        selectable && selectedRowIds && pageRowIds.length > 0 && pageRowIds.every((id) => selectedRowIds.has(id));

    const setPage = (page: number) => {
        const nextPage = Math.min(Math.max(1, page), totalPages);
        onQueryChange({ ...query, page: nextPage });
    };

    const toggleSort = (col: ColumnDef<T>) => {
        if (!col.sortable) return;
        const isSame = query.sortKey === col.key;
        const nextDir = isSame ? (query.sortDir === "asc" ? "desc" : "asc") : "asc";
        onQueryChange({ ...query, sortKey: col.key, sortDir: nextDir, page: 1 });
    };

    const toggleAllOnPage = () => {
        if (!selectable || !selectedRowIds || !onSelectedRowIdsChange) return;
        const next = new Set(selectedRowIds);
        if (isAllSelectedOnPage) pageRowIds.forEach((id) => next.delete(id));
        else pageRowIds.forEach((id) => next.add(id));
        onSelectedRowIdsChange(next);
    };

    const toggleRow = (id: string) => {
        if (!selectable || !selectedRowIds || !onSelectedRowIdsChange) return;
        const next = new Set(selectedRowIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        onSelectedRowIdsChange(next);
    };

    return (
        <section className="w-full border dark:bg-gray-900 dark:text-white bg-white border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="hide-scrollbar h-[55vh] w-full overflow-auto">
                <table className="min-w-full border-collapse table-auto ">
                    <thead className="bg-gray-100 dark:bg-gray-900 sticky top-0 z-20">
                        <tr>
                            {selectable && (
                                <th className="w-12 min-w-12 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(isAllSelectedOnPage)}
                                        onChange={toggleAllOnPage}
                                    />
                                </th>
                            )}
                            {columns.map((col) => {
                                const isSorted = query.sortKey === col.key;
                                return (
                                    <th
                                        key={col.key}
                                        className={[
                                            "px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-left align-middle select-none text-sm font-semibold tracking-wide whitespace-nowrap bg-gray-100 dark:bg-gray-900",
                                            col.widthClassName ?? "",
                                            col.sortable ? "cursor-pointer" : ""
                                        ].join(" ")}
                                        onClick={() => toggleSort(col)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="dark:text-white">{col.header}</span>
                                            {col.sortable && (
                                                <span className="opacity-70">
                                                    {isSorted ? (
                                                        query.sortDir === "desc" ? (
                                                            <ChevronDown size={14} />
                                                        ) : (
                                                            <ChevronUp size={14} />
                                                        )
                                                    ) : (
                                                        <ChevronUp size={14} className="opacity-40" />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                );
                            })}
                            {hasActionColumn && (
                                <th
                                    className={[
                                        "min-w-50 px-4 py-3 border-b border-gray-200 dark:border-gray-700",
                                        "text-right align-middle text-sm font-semibold tracking-wide whitespace-nowrap",
                                        "sticky right-0 z-30 bg-gray-100 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.35)]"
                                    ].join(" ")}
                                >
                                    <span className="dark:text-white">Actions</span>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && pageRows.length === 0 && Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                            <tr key={`skeleton-${rowIndex}`} className="animate-pulse">
                                {selectable && (
                                    <td className="w-12 min-w-12 px-4 py-3 border-b border-gray-100 dark:border-gray-800 align-middle">
                                        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
                                    </td>
                                )}
                                {columns.map((col) => (
                                    <td
                                        key={`${col.key}-skeleton-${rowIndex}`}
                                        className={[
                                            "px-4 py-3 border-b border-gray-100 dark:border-gray-800 align-middle",
                                            col.widthClassName ?? ""
                                        ].join(" ")}
                                    >
                                        <div
                                            className={[
                                                "h-4 rounded bg-gray-200 dark:bg-gray-700",
                                                col.key === "id" ? "w-20" : col.key === "status" ? "w-24" : "w-36"
                                            ].join(" ")}
                                        />
                                    </td>
                                ))}
                                {hasActionColumn && (
                                    <td
                                        className={[
                                            "min-w-50 px-4 py-3 border-b border-gray-100 dark:border-gray-800 align-middle",
                                            "sticky right-0 z-10 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.35)]"
                                        ].join(" ")}
                                    >
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="h-10 w-14 rounded-md bg-gray-200 dark:bg-gray-700" />
                                            <div className="h-10 w-14 rounded-md bg-gray-200 dark:bg-gray-700" />
                                            <div className="h-10 w-14 rounded-md bg-gray-200 dark:bg-gray-700" />
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {pageRows.map((row) => {
                            const id = rowKey(row);
                            const checked = selectable && selectedRowIds ? selectedRowIds.has(id) : false;
                            return (
                                <tr key={id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    {selectable && (
                                        <td className="w-12 min-w-12 px-4 py-3 border-b border-gray-100 dark:border-gray-800 align-middle">
                                            <input type="checkbox" checked={checked} onChange={() => toggleRow(id)} />
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={[
                                                "px-4 py-3 border-b border-gray-100 dark:border-gray-800 dark:text-white text-xs align-middle",
                                                col.widthClassName ?? ""
                                            ].join(" ")}
                                        >
                                            {col.cell
                                                ? col.cell(row)
                                                : col.accessor
                                                    ? safeString(getColumnValue(row, col))
                                                    : ""}
                                        </td>
                                    ))}
                                    {hasActionColumn && (
                                        <td
                                            className={[
                                                "min-w-50 px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-right whitespace-nowrap align-middle",
                                                "sticky right-0 z-10 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.35)]"
                                            ].join(" ")}
                                        >
                                            <div className="flex items-center justify-end gap-2">
                                                {renderRowActions ? renderRowActions(row) : null}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                        {!loading && pageRows.length === 0 && (
                            <tr>
                                <td
                                    className="h-72 p-4 align-middle text-center text-gray-500 dark:text-gray-400"
                                    colSpan={columns.length + (selectable ? 1 : 0) + (hasActionColumn ? 1 : 0)}
                                >
                                    No results
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    Page <span className="font-semibold">{query.page}</span> of <span className="font-semibold">{totalPages}</span>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 outline-none transition-colors focus:border-yellow-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        value={query.pageSize}
                        onChange={(e) => onQueryChange({ ...query, pageSize: Number(e.target.value), page: 1 })}
                    >
                        {[10, 20, 50, 100].map((n) => (
                            <option key={n} value={n} className="bg-white text-gray-700 dark:bg-gray-800 dark:text-white">
                                {n}/page
                            </option>
                        ))}
                    </select>
                    <button
                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 transition-colors hover:border-yellow-500 hover:text-yellow-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-yellow-500 dark:hover:text-yellow-400"
                        onClick={() => setPage(query.page - 1)}
                        disabled={query.page <= 1}
                    >
                        Prev
                    </button>
                    <button
                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 transition-colors hover:border-yellow-500 hover:text-yellow-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-yellow-500 dark:hover:text-yellow-400"
                        onClick={() => setPage(query.page + 1)}
                        disabled={query.page >= totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        </section>
    );
}
