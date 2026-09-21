import { Calendar1, Columns3Cog, Download, ListFilterPlus, RefreshCcw, Search, Trash, Upload } from "lucide-react";
import type { ExportFormat, tableAction } from "../../../utils/tableDataProps";
import UniverselButton from "./UniverselButton";
import CustomButton from "./CustomButton";

export default function TableAction(
    {
        features,
        filterPopover,
        filterContainerRef,
        onDateFilter,
        onDelete,
        onExportClick: _onExportClick,
        onExportFormat,
        onFilter,
        onRefresh,
        onColumnSettings,
        onImportClick,
        onCustomAction,
        searchValue,
        setSearchValue
    }: tableAction
) {
    const option = [
        {
            id: 1,
            label: "Archive"
        },
        {
            id: 2,
            label: "Show Archive"
        }
    ]
    const exportOptions = [
        { id: "pdf" satisfies ExportFormat, label: "Export PDF" },
        { id: "excel" satisfies ExportFormat, label: "Export Excel" },
        { id: "csv" satisfies ExportFormat, label: "Export CSV" }
    ];
    return (
        <main className="flex items-center justify-between gap-3 flex-wrap">
            <section className="flex items-center space-x-4">
                {features.showSearch && (
                    <div className="border border-gray-300 dark:border-gray-700 px-4 flex items-center py-1 rounded-md shadow-xl dark:text-white bg-white dark:bg-transparent gap-2">
                        <Search size={18} />
                        <input
                            type="text"
                            name="search"
                            id="search"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search..."
                            className="focus:outline-none bg-transparent"
                        />
                    </div>
                )}

                {features.showAdvaceFilter && (
                    <div className="relative" ref={filterContainerRef}>
                        <UniverselButton
                            label="Filter"
                            icon={ListFilterPlus}
                            onClick={onFilter}
                        />
                        {filterPopover}
                    </div>
                )}

                {features.showColumnSettings && (
                    <UniverselButton
                        icon={Columns3Cog}
                        onClick={onColumnSettings}
                        label="Columns"
                    />
                )}

                {features.showRefresh && (
                    <UniverselButton
                        icon={RefreshCcw}
                        onClick={onRefresh}
                        label="Refresh"
                    />
                )}

                {
                    features.showDelete && (
                        <UniverselButton
                            icon={Trash}
                            onClick={onDelete}
                            label="Delete"
                        />
                    )
                }

                {
                    features.showCustomButton && (
                        <CustomButton
                            label="Action"
                            isDropDown={true}
                            options={option}
                            onOptionSelect={(selected) => onCustomAction?.(selected.id)}
                        />
                    )
                }

            </section>
            <section className="flex items-center space-x-4">
                {
                    features.showExport && (
                        <div className="flex items-center gap-2">
                            <CustomButton
                                icon={Upload}
                                isDropDown={true}
                                options={exportOptions}
                                onOptionSelect={(opt) => onExportFormat?.(opt.id as ExportFormat)}
                            />
                        </div>
                    )
                }
                {
                    features.showImport && (
                        <UniverselButton
                            icon={Download}
                            onClick={onImportClick}
                            label="Import"
                        />
                    )
                }

                {
                    features.showDateFilter && (
                        <UniverselButton
                            icon={Calendar1}
                            onClick={onDateFilter}
                            label="Date Range"
                        />
                    )
                }

            </section>
        </main>
    );
}
