import { Eye, Star } from "lucide-react";
import SkeletonBlock from "../Skeleton/SkeletonBlock";
import useInitialLoading from "../../hooks/useInitialLoading";


export interface GoogleReview {
    authorName: string;
    authorPhotoUrl: string;
    rating: number;
    text: string;
    relativeTime: string;
    publishTime: string;
}

interface TestimonialProps {
    data: GoogleReview[];
    enableView?: boolean;
    onClickView?: (row: GoogleReview) => void;
    loading?: boolean;
    skeletonCount?: number;
}

export default function TestimonialCard({
    data,
    enableView = false,
    onClickView,
    loading = false,
    skeletonCount = 6,
}: TestimonialProps) {
    const initialLoading = useInitialLoading();
    const showSkeleton = loading || initialLoading;

    if (showSkeleton) {
        return (
            <main aria-busy="true">
                <section className="grid grid-cols-3 gap-4">
                    {Array.from({ length: skeletonCount }).map((_, index) => (
                        <div
                            key={`testimonial-card-skeleton-${index}`}
                            className="border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl space-y-4"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <SkeletonBlock className="h-5 w-32" />
                                    <SkeletonBlock className="h-4 w-24" />
                                </div>
                                <SkeletonBlock className="h-6 w-20 rounded-full" />
                            </div>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, starIndex) => (
                                    <SkeletonBlock key={starIndex} className="h-4 w-4 rounded-sm" />
                                ))}
                            </div>
                            <div className="border-b border-gray-200 pb-4 dark:border-gray-800 space-y-2">
                                <SkeletonBlock className="h-4 w-full" />
                                <SkeletonBlock className="h-4 w-4/5" />
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <SkeletonBlock className="h-6 w-24 rounded-full" />
                                <div className="flex items-center gap-2">
                                    <SkeletonBlock className="h-5 w-5 rounded" />
                                    <SkeletonBlock className="h-5 w-5 rounded" />
                                    <SkeletonBlock className="h-5 w-5 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </main>
        );
    }

    return (
        <main>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {data.map((value) => (
                    <div
                        key={value.publishTime}
                        className="border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl space-y-4 hover:scale-[1.02] 
                        hover:shadow-2xl transition-transform ease-out duration-300"
                    >

                        {/* USER */}
                        <div className="flex items-center gap-3">

                            <img
                                src={value.authorPhotoUrl}
                                alt={value.authorName}
                                className="w-12 h-12 rounded-full object-cover"
                            />

                            <div>
                                <p className="dark:text-white font-semibold">
                                    {value.authorName}
                                </p>

                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {value.relativeTime}
                                </p>
                            </div>

                        </div>

                        {/* RATING */}
                        <div className="flex items-center gap-1">

                            {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                    key={index}
                                    className={`w-4 h-4 ${index < value.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                                />
                            ))}

                            <span className="ml-2 text-sm font-medium dark:text-white">
                                {value.rating}.0
                            </span>

                        </div>

                        {/* REVIEW */}
                        <div className="border-b border-gray-200 dark:border-gray-800 pb-4">

                            <p className="dark:text-white">
                                {value.text.length > 120
                                    ? value.text.slice(0, 120) + "..."
                                    : value.text}
                            </p>

                        </div>

                        {/* FOOTER */}
                        <div className="flex items-center justify-between">

                            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                <p className="text-xs font-semibold">
                                    Google Review
                                </p>
                            </div>

                            {enableView && (
                                <button
                                    type="button"
                                    onClick={() => onClickView?.(value)}
                                    className="text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                                >
                                    <Eye size={18} />
                                </button>
                            )}

                        </div>

                    </div>
                ))}

            </section>
        </main>
    );
}
