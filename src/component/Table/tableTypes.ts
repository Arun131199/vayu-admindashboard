import type React from "react";

export type SortDirection = "asc" | "desc";

export type FilterOperator = "contains" | "equals" | "startsWith" | "endsWith" | "notEquals";

export type AdvancedFilterRule = {
    id: string;
    columnKey: string;
    operator: FilterOperator;
    value: string;
};

export type TableQuery = {
    page: number;
    pageSize: number;
    search: string;
    columnFilters?: Record<string, string>;
    advancedFilters?: AdvancedFilterRule[];
    dateFrom?: string;
    dateTo?: string;
    sortKey?: string;
    sortDir?: SortDirection;
};

export type ColumnDef<T> = {
    key: string;
    header: string;
    sortable?: boolean;
    widthClassName?: string;
    accessor?: keyof T | ((row: T) => React.ReactNode);
    cell?: (row: T) => React.ReactNode;
};
