import type { CourseRow } from "../../service/courseApi";
import { Eye, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SkeletonBlock from "../Skeleton/SkeletonBlock";
import useInitialLoading from "../../hooks/useInitialLoading";

type GridCardprops = {
    data: CourseRow[];
    loading?: boolean;
    skeletonCount?: number;
    onClickEdit?: (course: CourseRow) => void;
};

export default function GridCard({ data, loading = false, skeletonCount = 6, onClickEdit }: GridCardprops) {
    const navigate = useNavigate();
    const initialLoading = useInitialLoading();
    const showSkeleton = loading || initialLoading;

    if (showSkeleton) {
        return (
            <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
                {Array.from({ length: skeletonCount }).map((_, index) => (
                    <div
                        key={`grid-card-skeleton-${index}`}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
                    >
                        <SkeletonBlock className="h-44 w-full rounded-none" />
                        <div className="p-4 space-y-3">
                            <SkeletonBlock className="h-5 w-3/4" />
                            <SkeletonBlock className="h-4 w-1/2" />
                            <div className="flex justify-between gap-4">
                                <SkeletonBlock className="h-4 w-20" />
                                <SkeletonBlock className="h-4 w-20" />
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <SkeletonBlock className="h-5 w-24" />
                                <SkeletonBlock className="h-9 w-20 rounded-lg" />
                            </div>
                        </div>
                    </div>
                ))}
            </main>
        );
    }

    return (
        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((course) => (
                <div
                    key={course.id}
                    className="group bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                    <div className="relative overflow-hidden">
                        <img
                            src={course.courseImage}
                            alt={course.courseName}
                            className="w-full h-44 object-cover transform group-hover:scale-105 transition duration-300"
                        />
                        <span
                            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${course.courseStatus === "ACTIVE"
                                    ? "bg-green-200 text-green-700"
                                    : course.courseStatus === "COMING_SOON"
                                        ? "bg-yellow-200 text-yellow-700"
                                        : "bg-red-200 text-red-700"
                                }`}
                        >
                            {course.courseStatus}
                        </span>
                    </div>

                    <div className="p-4 space-y-3">
                        <h2 className="text-lg font-semibold dark:text-white line-clamp-1">
                            {course.courseName}
                        </h2>

                        <p className="text-sm text-gray-500">{course.courseCategory}</p>

                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                            <span>⏱ {course.courseDuration}</span>
                            <span>👥 {course.enrolledCount}/{course.maxStudents}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-yellow-500 font-bold text-md">
                                ₹{course.coursePrice}
                            </span>

                            <div className="flex items-center gap-2">
                                {onClickEdit && (
                                    <button
                                        onClick={() => onClickEdit(course)}
                                        className="flex items-center gap-1 text-sm border border-yellow-600 text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-50 transition cursor-pointer dark:text-yellow-400"
                                    >
                                        <Pencil size={16} />
                                        Edit
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate(`/admin-dashboard/courses/${course.id}`)}
                                    className="flex items-center gap-1 text-sm bg-yellow-600 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-700 transition cursor-pointer"
                                >
                                    <Eye size={16} />
                                    View
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </main>
    );
}