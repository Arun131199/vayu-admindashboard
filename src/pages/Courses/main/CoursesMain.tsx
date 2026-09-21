import { BookmarkCheck, Calculator, ChartBarStacked, Plus, Toolbox } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BreadCrump from "../../../component/BreadCrump/BreadCrump";
import Button from "../../../component/Buttons/Button";
import Table from "../../../component/Table/Table";
import type { ColumnDef, TableQuery } from "../../../component/Table/tableTypes";
import { defaultTableActionFeatures, type TableActionFeatures } from "../../../utils/tableDataProps";
import ToggleButton from "../../../component/Buttons/ToggleButton";
import GridCard from "../../../component/Cards/GridCard";
import StatusCard from "../../../component/Cards/StatusCard";
import {
    getAllCourses,
    getArchivedCourses,
    deleteCourse,
    archiveCourse,
    restoreCourse,
    getCourseStats,
    importCourses,
    exportCourses,
    type CourseRow,
    type CourseStats,
} from "../../../service/courseApi";
import { useAuth } from "../../../context/AuthContext";

export default function CoursesMain() {
    const navigate = useNavigate();
    const { permissions } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const viewFormParams = searchParams.get("view") || "Grid View";
    const [chooseView, setChooseView] = useState(viewFormParams);
    const [dataMode, setDataMode] = useState<"live" | "archived">("live");

    const canWrite = permissions?.includes("COURSE_WRITE");
    const canUpdate = permissions?.includes("COURSE_UPDATE");
    const canDelete = permissions?.includes("COURSE_DELETE");

    const breadcrumpOptions = useMemo(() => [
        { id: 1, label: "Dashboard", onClick: () => navigate("/admin-dashboard/dashboard") },
        { id: 2, label: "Courses" }
    ], [navigate]);

    const [allCourses, setAllCourses] = useState<CourseRow[]>([]);
    const [rows, setRows] = useState<CourseRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [stats, setStats] = useState<CourseStats>({
        totalCourses: 0,
        activeCourses: 0,
        comingSoonCourses: 0,
        totalEnrollments: 0,
    });
    const [statsLoading, setStatsLoading] = useState(false);

    const statusData = useMemo(() => [
        { id: 1, title: "Total Courses", value: String(stats.totalCourses), icon: Calculator },
        { id: 2, title: "Active Courses", value: String(stats.activeCourses), icon: Toolbox },
        { id: 3, title: "Coming Soon", value: String(stats.comingSoonCourses), icon: BookmarkCheck },
        { id: 4, title: "Total Enrollments", value: String(stats.totalEnrollments), icon: ChartBarStacked }
    ], [stats]);

    const loadStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const data = await getCourseStats();
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    const loadCourses = useCallback(async (mode: "live" | "archived") => {
        setLoading(true);
        setError(null);
        try {
            const data = mode === "live" ? await getAllCourses() : await getArchivedCourses();
            setAllCourses(data);
        } catch (err) {
            console.error(err);
            setError(mode === "live" ? "Failed to load courses" : "Failed to load archived courses");
        } finally {
            setLoading(false);
            setHasLoadedOnce(true);
        }
    }, []);

    useEffect(() => {
        setHasLoadedOnce(false);
        loadCourses(dataMode);
        if (dataMode === "live") loadStats();
    }, [dataMode, loadCourses, loadStats]);

    const liveColumns = useMemo<ColumnDef<CourseRow>[]>(() => [
        { key: "courseId", header: "Course ID", sortable: true, accessor: "courseId", widthClassName: "w-32" },
        { key: "courseName", header: "Course Name", sortable: true, accessor: "courseName", widthClassName: "min-w-[220px]" },
        { key: "courseCategory", header: "Category", sortable: true, accessor: "courseCategory", widthClassName: "min-w-[160px]" },
        { key: "courseDuration", header: "Duration", sortable: true, accessor: "courseDuration" },
        {
            key: "coursePrice", header: "Price", sortable: true, accessor: "coursePrice",
            cell: (row) => <span>₹{row.coursePrice}</span>
        },
        {
            key: "enrolledCount", header: "Enrolled", sortable: true, accessor: "enrolledCount",
            cell: (row) => <span>{row.enrolledCount}/{row.maxStudents}</span>
        },
        {
            key: "courseStatus", header: "Status", sortable: true, accessor: "courseStatus", widthClassName: "w-36",
            cell: (row) => {
                const color = row.courseStatus === "ACTIVE"
                    ? "bg-green-300 text-green-700"
                    : row.courseStatus === "COMING_SOON"
                        ? "bg-yellow-200 text-yellow-700"
                        : "bg-red-200 text-red-700";
                return (
                    <span className={`inline-flex min-w-24 items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${color}`}>
                        {row.courseStatus}
                    </span>
                );
            }
        },
        { key: "createdAt", header: "Created At", sortable: true, accessor: "createdAt", widthClassName: "min-w-[160px]" }
    ], []);

    const archivedColumns = useMemo<ColumnDef<CourseRow>[]>(() => [
        { key: "courseId", header: "Course ID", sortable: true, accessor: "courseId", widthClassName: "w-32" },
        { key: "courseName", header: "Course Name", sortable: true, accessor: "courseName", widthClassName: "min-w-[220px]" },
        { key: "courseCategory", header: "Category", sortable: true, accessor: "courseCategory", widthClassName: "min-w-[160px]" },
        { key: "updatedAt", header: "Archived On", sortable: true, accessor: "createdAt", widthClassName: "min-w-[160px]" }
    ], []);

    const columns = dataMode === "live" ? liveColumns : archivedColumns;

    const tableActionFeatures: TableActionFeatures = useMemo(() => ({
        ...defaultTableActionFeatures,
        showDateFilter: dataMode === "live",
        showEdit: dataMode === "live" && canUpdate,
        showDelete: dataMode === "live" && canDelete,
        showCustomButton: dataMode === "live",
    }), [dataMode, canUpdate, canDelete]);

    const matchesQuery = useCallback((rowsToFilter: CourseRow[], query: TableQuery) => {
        let next = [...rowsToFilter];

        if (query.search.trim()) {
            const needle = query.search.toLowerCase();
            next = next.filter((row) =>
                Object.values(row).some((value) => String(value).toLowerCase().includes(needle))
            );
        }

        if (query.dateFrom || query.dateTo) {
            next = next.filter((row) => {
                const rowDate = row.createdAt?.slice(0, 10) ?? "";
                if (!rowDate) return false;
                const matchesFrom = !query.dateFrom || rowDate >= query.dateFrom;
                const matchesTo = !query.dateTo || rowDate <= query.dateTo;
                return matchesFrom && matchesTo;
            });
        }

        if (query.sortKey) {
            const dir = query.sortDir === "desc" ? -1 : 1;
            next.sort((a, b) => {
                const sortKey = query.sortKey as keyof CourseRow;
                const av = String(a[sortKey] ?? "");
                const bv = String(b[sortKey] ?? "");
                return av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" }) * dir;
            });
        }

        return next;
    }, []);

    const fetchCourses = useCallback((query: TableQuery) => {
        setLoading(true);
        try {
            const filtered = matchesQuery(allCourses, query);
            const totalCount = filtered.length;
            const start = (query.page - 1) * query.pageSize;
            const end = start + query.pageSize;
            setRows(filtered.slice(start, end));
            setTotal(totalCount);
        } finally {
            setLoading(false);
        }
    }, [allCourses, matchesQuery]);

    // Live view actions
    const handleDelete = useCallback(async (row: CourseRow) => {
        await deleteCourse(row.id);
        await loadCourses("live");
        await loadStats();
    }, [loadCourses, loadStats]);

    const handleArchiveSelected = useCallback(async (selectedRows: CourseRow[]) => {
        for (const row of selectedRows) {
            await archiveCourse(row.id);
        }
        await loadCourses("live");
        await loadStats();
    }, [loadCourses, loadStats]);

    const handleImportFile = useCallback(async (file: File) => {
        await importCourses(file);
        await loadCourses("live");
        await loadStats();
    }, [loadCourses, loadStats]);

    const handleExportFile = useCallback(async (format: string, selectedIds: string[]) => {
        const exportType = format.toUpperCase() as "EXCEL" | "PDF" | "CSV";
        const courseIds = selectedIds.length > 0
            ? rows.filter((r) => selectedIds.includes(String(r.id))).map((r) => r.courseId)
            : undefined;
        await exportCourses(exportType, courseIds);
    }, [rows]);

    // Archived view actions
    const handleRestore = useCallback(async (row: CourseRow) => {
        if (!confirm(`Restore "${row.courseName}" back to live courses?`)) return;
        await restoreCourse(row.id);
        await loadCourses("archived");
    }, [loadCourses]);

    return (
        <main className="space-y-4">
            <section>
                <BreadCrump title="Courses" options={breadcrumpOptions} breadCrumpActive />
            </section>
            <section className="flex items-center justify-between">
                <div>
                    <p className="text-lg font-semibold dark:text-white">
                        {dataMode === "live" ? "Course Management" : "Archived Courses"}
                    </p>
                    <p className="text-md font-semibold text-gray-500 dark:text-gray-300">
                        {dataMode === "live"
                            ? "Manage training programs and enrollments"
                            : "Courses hidden from customers — restore anytime"}
                    </p>
                </div>
                {dataMode === "live" && canWrite && (
                    <Button buttonText="Add New Courses" icon={Plus} varient="primary" onClick={() => navigate("add-course")} />
                )}
                {dataMode === "archived" && (
                    <Button buttonText="Back to Courses" varient="secondary" onClick={() => setDataMode("live")} />
                )}
            </section>

            {error && <p className="text-red-500">{error}</p>}

            <section aria-label={`Courses ${chooseView}`} className="space-y-4">
                {dataMode === "live" && (
                    <ToggleButton
                        buttonTextOne="Grid View"
                        buttonTextTwo="Table View"
                        onChange={(value) => {
                            setChooseView(value);
                            setSearchParams({ view: value });
                        }}
                    />
                )}
                {dataMode === "live" && chooseView === "Grid View" ? (
                    <div className="space-y-5">
                        <div>
                            <StatusCard data={statusData} gridcount={4} loading={statsLoading} />
                        </div>
                        <GridCard
                            data={allCourses}
                            loading={loading && !hasLoadedOnce}
                            onClickEdit={canUpdate ? (course) => navigate(`edit-course/${course.id}`, { state: course }) : undefined}
                        />
                    </div>
                ) : dataMode === "live" ? (
                    <Table<CourseRow>
                        mode="server"
                        data={rows}
                        columns={columns}
                        rowKey={(row) => String(row.id)}
                        dateFilterAccessor="createdAt"
                        loading={loading && !hasLoadedOnce}
                        totalCount={total}
                        onServerQueryChange={fetchCourses}
                        tableActionFeatures={tableActionFeatures}
                        onViewRow={(row) => navigate(`/admin-dashboard/courses/${row.id}`)}
                        onEditRow={canUpdate ? (row) => navigate(`edit-course/${row.id}`, { state: row }) : undefined}
                        onDeleteRow={canDelete ? handleDelete : undefined}
                        onArchiveSelected={handleArchiveSelected}
                        onShowArchive={() => setDataMode("archived")}
                        onImportFile={handleImportFile}
                        onExportFile={handleExportFile}
                        onRefresh={() => { loadCourses("live"); loadStats(); }}
                        showRowActions={true}
                    />
                ) : (
                    <Table<CourseRow>
                        mode="server"
                        data={rows}
                        columns={columns}
                        rowKey={(row) => String(row.id)}
                        loading={loading && !hasLoadedOnce}
                        totalCount={total}
                        onServerQueryChange={fetchCourses}
                        tableActionFeatures={tableActionFeatures}
                        onRefresh={() => loadCourses("archived")}
                        showRowActions
                        renderRowActions={(row) => (
                            <div className="flex items-center gap-2">
                                {canUpdate && (
                                    <Button buttonText="Restore" varient="primary" onClick={() => handleRestore(row)} />
                                )}
                            </div>
                        )}
                    />
                )}
            </section>
        </main>
    );
}