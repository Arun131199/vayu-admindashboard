import type { bookingCardData } from "../../utils/BookingCardProps";
import SkeletonBlock from "../Skeleton/SkeletonBlock";
import useInitialLoading from "../../hooks/useInitialLoading";

export default function BookingCards({ data, title, loading = false, skeletonCount = 6 }: bookingCardData) {
    const initialLoading = useInitialLoading();
    const showSkeleton = loading || initialLoading;

    return (
        <main className="bg-white dark:bg-gray-900  p-4 rounded-lg shadow-xl dark:text-white" aria-busy={showSkeleton}>
            <section className="pb-3">
                {showSkeleton ? <SkeletonBlock className="h-6 w-36" /> : <p className="text-lg font-semibold dark:white">{title}</p>}
            </section>
            <section className="h-110 overflow-hidden">
                <div className="h-full overflow-y-auto hide-scrollbar">
                    <table className="w-full border-collapse cursor-pointer">
                        <thead className="bg-gray-100 dark:bg-gray-900 sticky top-0">
                            <tr>
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Service</th>
                                <th className="p-3 text-left">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {showSkeleton && Array.from({ length: skeletonCount }).map((_, index) => (
                                <tr key={`booking-skeleton-${index}`} className="border-b dark:border-gray-600 border-gray-300">
                                    <td className="p-3">
                                        <SkeletonBlock className="h-4 w-32 mb-2" />
                                        <SkeletonBlock className="h-3 w-20" />
                                    </td>
                                    <td className="p-3">
                                        <SkeletonBlock className="h-4 w-28" />
                                    </td>
                                    <td className="p-3">
                                        <SkeletonBlock className="h-6 w-24 rounded-full" />
                                    </td>
                                </tr>
                            ))}
                            {!showSkeleton && data.map((value) => (
                                <tr key={value.id} className="border-b dark:border-gray-600 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="p-3">
                                        <p className="font-semibold">{value.name}</p>
                                        <p className="text-sm text-gray-500 font-semibold">
                                            {value.createdAt}
                                        </p>
                                    </td>

                                    <td className="p-3">{value.service}</td>

                                    <td className="p-3">
                                        <p
                                            className={`inline-block px-5  text-center ${value.status === "confirmed"
                                                    ? "bg-green-600 text-white rounded-full"
                                                    : value.status === "pending"
                                                        ? "bg-amber-700 text-white rounded-full"
                                                        : "bg-red-600 text-white rounded-full"
                                                }`}
                                        >
                                            {value.status}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    )
}
