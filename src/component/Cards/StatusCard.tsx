import { TrendingDown, TrendingUp } from "lucide-react";
import type { StatusCardProps } from "../../utils/StatusCardProps";
import SkeletonBlock from "../Skeleton/SkeletonBlock";
import useInitialLoading from "../../hooks/useInitialLoading";

export default function StatusCard({ data, gridcount = 3, loading = false, skeletonCount }: StatusCardProps) {
    const initialLoading = useInitialLoading();
    const showSkeleton = loading || initialLoading;

    const gridCols: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        5: "grid-cols-5",
        6: "grid-cols-6",
    }
    const placeholders = Array.from({ length: skeletonCount ?? (data.length || gridcount) });

    if (showSkeleton) {
        return (
            <main aria-busy="true">
                <div className={`grid ${gridCols[gridcount]} items-center gap-5`}>
                    {placeholders.map((_, index) => (
                        <div
                            key={`status-card-skeleton-${index}`}
                            className="rounded-md dark:bg-gray-900 bg-white shadow-xl p-4"
                        >
                            <div className="flex justify-between items-center gap-4">
                                <div className="flex-1 space-y-3">
                                    <SkeletonBlock className="h-4 w-28" />
                                    <SkeletonBlock className="h-5 w-16" />
                                    <SkeletonBlock className="h-4 w-20" />
                                </div>
                                <SkeletonBlock className="h-10 w-10 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        );
    }

    return (
        <main>
            <div className={`grid ${gridCols[gridcount]} items-center gap-5`}>
                {data.map((value) => {
                    const Icon = value.icon;

                    return (
                        <div
                            key={value.id}
                            className=" rounded-md dark:bg-gray-900 bg-white shadow-xl p-4 
                            hover:scale-105 transition-transform ease-in duration-200
                            hover:cursor-pointer
                            "
                        >
                            <div className="flex justify-between items-center">

                                <div>
                                    <p className="font-semibold dark:text-white">{value.title}</p>
                                    <p className="text-yellow-600 font-semibold">
                                        {value.value}
                                    </p>

                                    {value.growth && (
                                        <p
                                            className={`flex items-center gap-1 ${String(value.growth).includes("+")
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                                }`}
                                        >
                                            {String(value.growth).includes("+") ? (
                                                <TrendingUp size={16} />
                                            ) : (
                                                <TrendingDown size={16} />
                                            )}
                                            <span>{value.growth}</span>
                                        </p>
                                    )}
                                </div>

                                {Icon && (
                                    <div className="p-2 rounded-lg shadow-xl bg-gradient-to-r from-yellow-600 to-yellow-500 text-white">
                                        <Icon size={24} />
                                    </div>
                                )}

                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
