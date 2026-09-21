import { ArrowLeft, CalendarDays, Clock3, IndianRupee, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import BreadCrump from "../../../component/BreadCrump/BreadCrump";
import { getCourseById, type CourseRow } from "../../../service/courseApi";

export default function CourseDetails() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const location = useLocation();

    const [course, setCourse] = useState<CourseRow | null>((location.state as CourseRow) ?? null);
    const [loading, setLoading] = useState(!location.state);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (location.state || !courseId) return;
        (async () => {
            setLoading(true);
            try {
                const data = await getCourseById(Number(courseId));
                setCourse(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load course");
            } finally {
                setLoading(false);
            }
        })();
    }, [courseId, location.state]);

    if (loading) {
        return <p className="p-6 text-gray-500 dark:text-gray-300">Loading course...</p>;
    }

    if (error || !course) {
        return (
            <main className="space-y-4">
                <BreadCrump
                    breadCrumpActive
                    options={[
                        { id: 1, label: "Dashboard", onClick: () => navigate("/admin-dashboard/dashboard") },
                        { id: 2, label: "Courses", onClick: () => navigate("/admin-dashboard/courses") },
                        { id: 3, label: "Course Details" }
                    ]}
                />
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <p className="text-lg font-semibold dark:text-white">Course not found</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">{error || "The selected course could not be found."}</p>
                </section>
            </main>
        );
    }

    const summaryCards = [
        { id: 1, label: "Duration", value: course.courseDuration, icon: Clock3 },
        { id: 2, label: "Price", value: `₹${course.coursePrice}`, icon: IndianRupee },
        { id: 3, label: "Enrolled", value: `${course.enrolledCount}/${course.maxStudents}`, icon: Users },
        { id: 4, label: "Created At", value: course.createdAt?.slice(0, 10), icon: CalendarDays }
    ];

    const sortedSchedule = [...(course.courseSchedule ?? [])].sort((a, b) => a.dayNumber - b.dayNumber);

    return (
        <main className="space-y-6">
            <BreadCrump
                breadCrumpActive
                options={[
                    { id: 1, label: "Dashboard", onClick: () => navigate("/admin-dashboard/dashboard") },
                    { id: 2, label: "Courses", onClick: () => navigate("/admin-dashboard/courses") },
                    { id: 3, label: course.courseName }
                ]}
            />

            <section className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-400">{course.courseCategory}</p>
                    <h1 className="text-2xl font-semibold dark:text-white">{course.courseName}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{course.courseDescription}</p>
                    <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${course.courseStatus === "ACTIVE"
                            ? "bg-green-200 text-green-700"
                            : course.courseStatus === "COMING_SOON"
                                ? "bg-yellow-200 text-yellow-700"
                                : "bg-red-200 text-red-700"
                            }`}
                    >
                        {course.courseStatus}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-yellow-500 hover:text-yellow-600 dark:border-gray-700 dark:text-white dark:hover:border-yellow-400 dark:hover:text-yellow-400"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
            </section>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <img
                    src={course.courseImage}
                    alt={course.courseName}
                    className="h-64 w-full object-cover"
                />
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <article key={card.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <div className="mb-3 inline-flex rounded-full bg-yellow-100 p-3 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400">
                                <Icon size={18} />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-300">{card.label}</p>
                            <p className="mt-1 text-lg font-semibold dark:text-white">{card.value}</p>
                        </article>
                    );
                })}
            </section>

            {(course.courseHighlights?.length > 0 || course.courseLearnContent?.length > 0) && (
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {course.courseHighlights?.length > 0 && (
                        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <p className="mb-4 text-lg font-semibold dark:text-white">Highlights</p>
                            <ul className="space-y-2">
                                {course.courseHighlights.map((h, i) => (
                                    <li key={i} className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                        {h}
                                    </li>
                                ))}
                            </ul>
                        </article>
                    )}
                    {course.courseLearnContent?.length > 0 && (
                        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <p className="mb-4 text-lg font-semibold dark:text-white">What You'll Learn</p>
                            <ul className="space-y-2">
                                {course.courseLearnContent.map((c, i) => (
                                    <li key={i} className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        </article>
                    )}
                </section>
            )}

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-6">
                    <p className="text-xl font-semibold dark:text-white">Day-wise Schedule</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">What is taught on each day of the course.</p>
                </div>

                {sortedSchedule.length === 0 ? (
                    <p className="text-sm text-gray-400">No schedule added yet.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {sortedSchedule.map((day) => (
                            <article key={day.dayNumber} className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-400">
                                    {day.day || `Day ${day.dayNumber}`}
                                </p>
                                {day.topic && (
                                    <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-200">{day.topic}</p>
                                )}
                                <div className="mt-4 space-y-2">
                                    {day.content?.map((item, i) => (
                                        <div key={i} className="rounded-lg bg-white px-3 py-2 text-sm text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-200">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {course.courseMedia?.length > 0 && (
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <p className="mb-4 text-lg font-semibold dark:text-white">Media</p>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {course.courseMedia.map((url, i) => (
                            <img key={i} src={url} alt={`media-${i}`} className="h-32 w-full rounded-lg object-cover" />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}