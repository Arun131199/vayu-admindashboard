import type { LucideIcon } from "lucide-react";
import type { Dispatch, ReactNode, RefObject, SetStateAction } from "react";

export interface features{
    showAdvaceFilter:boolean;
    showSearch:boolean;
    showRefresh:boolean;
    showExport:boolean;
    showImport:boolean;
    showCustomButton:boolean;
    showDateFilter:boolean;
    showArchive:boolean;
    showEdit:boolean;
    showView:boolean;
    showDelete:boolean;
    showColumnSettings:boolean;
}

export type TableActionFeatures = Partial<features>;

export const defaultTableActionFeatures: features = {
    showAdvaceFilter: true,
    showSearch: true,
    showRefresh: true,
    showExport: true,
    showImport: true,
    showCustomButton: true,
    showDateFilter: true,
    showArchive: true,
    showEdit: true,
    showView: true,
    showDelete: true,
    showColumnSettings: true
};

export interface tableAction{
    features:features;
    searchValue:string;
    setSearchValue: Dispatch<SetStateAction<string>>;
    filterPopover?: ReactNode;
    filterContainerRef?: RefObject<HTMLDivElement | null>;
    onRowCLick:()=>void
    onFilter:()=>void;
    onRefresh:()=>void;
    onColumnSettings: () => void;
    onArchiveData:()=>void;
    onDateFilter:()=>void;
    onImportClick:()=>void;
    onExportClick:()=>void;
    onExportFormat?: (format: ExportFormat) => void;
    onDelete:()=>void;
    onEdit:()=>void;
    onView:()=>void;
    onCustomAction?: (actionId: string | number) => void;
}

export interface tableProps{
    data:[];
    tableAction:tableAction;
}

export interface universelButtonProps{
    label?:string;
    icon:LucideIcon;
    onClick:()=>void;
}

export interface customButtonOption{
    id: string | number;
    label: string;
}

export type ExportFormat = "pdf" | "excel" | "csv";

export interface customButtonProps{
    isDropDown?:boolean;
    options?:customButtonOption[];
    label?:string;  
    icon?: LucideIcon;
    onOptionSelect?: (option: customButtonOption) => void;
}
