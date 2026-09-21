import SkeletonBlock from "../Skeleton/SkeletonBlock";

type TableSkeletonProps = {
    rows?: number;
    columns?: number;
    showActions?: boolean;
};

export default function TableSkeleton({ rows = 6, columns = 6, showActions = true }: TableSkeletonProps) {
    return (
        <section
            className="w-full border dark:bg-gray-900 dark:text-white bg-white border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            aria-busy="true"
        >
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                <SkeletonBlock className="h-10 w-72 max-w-full rounded-lg" />
                <div className="flex items-center gap-2">
                    <SkeletonBlock className="h-10 w-24 rounded-lg" />
                    <SkeletonBlock className="h-10 w-24 rounded-lg" />
                    <SkeletonBlock className="h-10 w-24 rounded-lg" />
                </div>
            </div>
            <div className="hide-scrollbar h-[55vh] w-full overflow-auto">
                <table className="min-w-full border-collapse table-auto">
                    <thead className="bg-gray-100 dark:bg-gray-900">
                        <tr>
                            <th className="w-12 min-w-12 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                <SkeletonBlock className="h-4 w-4" />
                            </th>
                            {Array.from({ length: columns }).map((_, index) => (
                                <th key={`table-header-skeleton-${index}`} className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <SkeletonBlock className="h-4 w-24" />
                                </th>
                            ))}
                            {showActions && (
                                <th className="min-w-50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <SkeletonBlock className="ml-auto h-4 w-20" />
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr key={`table-row-skeleton-${rowIndex}`}>
                                <td className="w-12 min-w-12 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                    <SkeletonBlock className="h-4 w-4" />
                                </td>
                                {Array.from({ length: columns }).map((__, colIndex) => (
                                    <td key={`table-cell-skeleton-${rowIndex}-${colIndex}`} className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                        <SkeletonBlock className={colIndex % 3 === 0 ? "h-4 w-32" : "h-4 w-24"} />
                                    </td>
                                ))}
                                {showActions && (
                                    <td className="min-w-50 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center justify-end gap-2">
                                            <SkeletonBlock className="h-10 w-14 rounded-md" />
                                            <SkeletonBlock className="h-10 w-14 rounded-md" />
                                            <SkeletonBlock className="h-10 w-14 rounded-md" />
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <SkeletonBlock className="h-4 w-24" />
                <div className="flex items-center gap-2">
                    <SkeletonBlock className="h-8 w-20 rounded-md" />
                    <SkeletonBlock className="h-8 w-16 rounded-md" />
                    <SkeletonBlock className="h-8 w-16 rounded-md" />
                </div>
            </div>
        </section>
    );
}
