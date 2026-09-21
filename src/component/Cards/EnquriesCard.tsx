import type { enquiryData } from "../../utils/BookingCardProps";
import SkeletonBlock from "../Skeleton/SkeletonBlock";
import useInitialLoading from "../../hooks/useInitialLoading";


export default function EnquriesCard({ data, title, loading = false, skeletonCount = 6 }: enquiryData) {
    const initialLoading = useInitialLoading();
    const showSkeleton = loading || initialLoading;

    return (
        <main className="bg-white dark:bg-gray-900 p-4 rounded-lg dark:text-white" aria-busy={showSkeleton}>
            <section className="mb-2">
                {showSkeleton ? <SkeletonBlock className="h-6 w-36" /> : <p className="text-lg font-semibold">{title}</p>}
            </section>
            <section className="h-110 space-y-1 overflow-y-auto hide-scrollbar">
                {
                    showSkeleton && Array.from({ length: skeletonCount }).map((_, index) => (
                        <div
                            key={`enquiry-skeleton-${index}`}
                            className="border-b border-gray-300 dark:border-gray-600 p-3 rounded-md"
                        >
                            <div className="flex items-center justify-between gap-4 mb-3">
                                <SkeletonBlock className="h-4 w-28" />
                                <SkeletonBlock className="h-4 w-24" />
                            </div>
                            <SkeletonBlock className="h-4 w-full mb-2" />
                            <SkeletonBlock className="h-4 w-2/3" />
                        </div>
                    ))
                }
                {
                    !showSkeleton && data.map((value) => (
                        <div
                            key={value.id}
                            className="border-b border-gray-300 dark:border-gray-600 p-3 rounded-md 
                            hover:bg-gray-100 dark:hover:bg-gray-800 
                            transition-all duration-200 cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <p className="font-medium">{value.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                                    {value.mobile}
                                </p>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                {value.message}
                            </p>

                        </div>
                    ))
                }
            </section>
        </main>
    )
}   
