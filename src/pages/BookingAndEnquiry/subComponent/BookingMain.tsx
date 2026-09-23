import { Calculator, CalendarRange, MessageCircleIcon, ShoppingBag, IdCard, type LucideIcon, Calendar, RefreshCw } from "lucide-react";
import StatusCard from "../../../component/Cards/StatusCard";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import Table from "../../../component/Table/Table";
import type { ColumnDef } from "../../../component/Table/tableTypes";
import { defaultTableActionFeatures, type TableActionFeatures } from "../../../utils/tableDataProps";
import { getAllOrders, type OrderRow } from "../../../service/orderApi";
import { getAllServiceEnrollments, type ServiceEnrollmentRow } from "../../../service/serviceEnrollmentApi";
import { getAllCourseEnrollments, type CourseEnrollmentRow } from "../../../service/courseEnrollmentApi";
import { exportRpcEnquiries, getAllRpcEnquiries, importRpcEnquiries, type RpcEnquiryRow } from "../../../service/rpcApi";
import { getAllAppointments, type AppointmentRow } from "./../../../service/appointmentApi";
import { getAllReplacements, type OrderReplacementRow } from "../../../service/replacementApi";
import { getAllLeadAssignments, type LeadAssignment, type LeadType } from "../../../service/leadApi";
import { useAuth } from "../../../context/AuthContext";
import { getMyAssignedLeads } from "../../../service/rpcApi";
import { getMyLeadIds } from "../../../service/leadApi";

import { exportOrders, importOrders } from "../../../service/orderApi";
import { exportServiceEnrollments, importServiceEnrollments, } from "../../../service/serviceEnrollmentApi";
import { exportCourseEnrollments, importCourseEnrollments } from "../../../service/courseEnrollmentApi";
import { archiveRecords, getArchivedIds, restoreRecord, type ArchiveLeadType } from "../../../service/archiveApi";
import { getArchivedCourseEnrollments, restoreCourseEnrollment } from "../../../service/courseEnrollmentApi";
import { toast } from "sonner";

type TabKey = "products" | "services" | "courses" | "rpc" | "appointments" | "replacements";

const tabToLeadType: Partial<Record<TabKey, LeadType>> = {
    products: "PRODUCT",
    services: "SERVICE",
    courses: "COURSE",
    appointments: "APPOINTMENT",
    replacements: "REPLACEMENT",
};

const orderStatusBadge: Record<string, string> = {
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    RETURNED: "bg-red-100 text-red-700",
    REFUNDED: "bg-red-100 text-red-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-cyan-100 text-cyan-700",
    OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-700",
};

const enrollmentStatusBadge: Record<string, string> = {
    ENROLLED: "bg-green-100 text-green-700",
    COMPLETED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
    PAYMENT_PENDING: "bg-yellow-100 text-yellow-700",
    PAYMENT_APPROVED: "bg-blue-100 text-blue-700",
    REJECTED: "bg-red-100 text-red-700",
    DROPPED: "bg-red-100 text-red-700",
};

function assignedToColumn<T extends { id: number }>(assignments: Record<number, LeadAssignment>): ColumnDef<T> {
    return {
        key: "assignedTo",
        header: "Assigned To",
        accessor: (row) => assignments[row.id]?.employeeName ?? "Unassigned",
        widthClassName: "min-w-[160px]",
        cell: (row) => {
            const a = assignments[row.id];
            return a ? (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-white">{a.employeeName}</span>
                    <span className="text-xs text-gray-500">{a.employeeEmail}</span>
                </div>
            ) : (
                <span className="inline-flex justify-center rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-500">
                    Unassigned
                </span>
            );
        },
    };
}

export default function BookingMain() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
    const tabFromUrl = (searchParams.get("view") as TabKey) ?? "products";
    const [activeTab, setActiveTab] = useState<TabKey>(tabFromUrl);

    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [serviceEnrollments, setServiceEnrollments] = useState<ServiceEnrollmentRow[]>([]);
    const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollmentRow[]>([]);
    const [rpcEnquiries, setRpcEnquiries] = useState<RpcEnquiryRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [replacements, setReplacements] = useState<OrderReplacementRow[]>([]);
    const [assignments, setAssignments] = useState<Record<number, LeadAssignment>>({});
    const [viewingArchived, setViewingArchived] = useState(false);
    const [archivedRows, setArchivedRows] = useState<any[]>([]);
    const [archivedLoading, setArchivedLoading] = useState(false);

    const [archivedIds, setArchivedIds] = useState<Set<number>>(new Set());

    const tabToArchiveType: Partial<Record<TabKey, ArchiveLeadType>> = {
        products: "PRODUCT",
        services: "SERVICE",
        courses: "COURSE",
        rpc: "RPC",
        appointments: "APPOINTMENT",
        replacements: "REPLACEMENT",
    };

    const loadAssignments = useCallback(async (tab: TabKey) => {
        const leadType = tabToLeadType[tab];
        if (!leadType) {
            setAssignments({});
            return;
        }
        try {
            const data = await getAllLeadAssignments(leadType);
            const map: Record<number, LeadAssignment> = {};
            data.forEach((a) => { map[a.entityId] = a; });
            setAssignments(map);
        } catch (err) {
            console.error("Failed to load assignments", err);
        }
    }, []);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const all = await getAllOrders();
            if (isAdmin) {
                setOrders(all);
            } else {
                const myIds = await getMyLeadIds("PRODUCT");
                setOrders(all.filter((o) => myIds.includes(o.id)));
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load product bookings");
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    const loadServiceEnrollments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const all = await getAllServiceEnrollments();
            if (isAdmin) {
                setServiceEnrollments(all);
            } else {
                const myIds = await getMyLeadIds("SERVICE");
                setServiceEnrollments(all.filter((s) => myIds.includes(s.id)));
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load service bookings");
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    const loadCourseEnrollments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const all = await getAllCourseEnrollments();
            if (isAdmin) {
                setCourseEnrollments(all);
            } else {
                const myIds = await getMyLeadIds("COURSE");
                setCourseEnrollments(all.filter((c) => myIds.includes(c.id)));
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load course enrollments");
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    const loadRpcEnquiries = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = isAdmin ? await getAllRpcEnquiries() : await getMyAssignedLeads();
            setRpcEnquiries(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load RPC enquiries");
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    const loadAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const all = await getAllAppointments();
            if (isAdmin) {
                setAppointments(all);
            } else {
                const myIds = await getMyLeadIds("APPOINTMENT");
                setAppointments(all.filter((a) => myIds.includes(a.id)));
            }
        } catch (err) {
            console.error("Failed to load appointments", err);
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    const loadReplacements = useCallback(async () => {
        setLoading(true);
        try {
            const all = await getAllReplacements();
            if (isAdmin) {
                setReplacements(all);
            } else {
                const myIds = await getMyLeadIds("REPLACEMENT");
                setReplacements(all.filter((r) => myIds.includes(r.id)));
            }
        } catch (err) {
            console.error("Failed to load replacements", err);
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    const loadArchivedIds = useCallback(async (tab: TabKey) => {
        const archiveType = tabToArchiveType[tab];
        if (!archiveType) { setArchivedIds(new Set()); return; }
        try {
            const ids = await getArchivedIds(archiveType);
            setArchivedIds(new Set(ids));
        } catch (err) {
            console.error("Failed to load archived ids", err);
        }
    }, []);

    useEffect(() => {
        if (activeTab === "products") loadOrders();
        else if (activeTab === "services") loadServiceEnrollments();
        else if (activeTab === "courses") loadCourseEnrollments();
        else if (activeTab === "appointments") loadAppointments();
        else if (activeTab === "replacements") loadReplacements();
        else loadRpcEnquiries();

        loadAssignments(activeTab);
        loadArchivedIds(activeTab);
    }, [activeTab, isAdmin]);

    useEffect(() => {
        const handleBookingUpdated = () => {
            if (activeTab === "products") loadOrders();
            else if (activeTab === "services") loadServiceEnrollments();
            else if (activeTab === "courses") loadCourseEnrollments();
            else if (activeTab === "appointments") loadAppointments();
            else loadRpcEnquiries();
            loadAssignments(activeTab);
        };
        window.addEventListener("booking-updated", handleBookingUpdated);
        return () => window.removeEventListener("booking-updated", handleBookingUpdated);
    }, [activeTab, loadOrders, loadServiceEnrollments, loadCourseEnrollments, loadAppointments, loadRpcEnquiries, loadAssignments]);


    const statusData = useMemo(() => {
        if (activeTab === "products") {
            const total = orders.length;
            const pending = orders.filter((o) => o.orderStatus === "PENDING").length;
            const delivered = orders.filter((o) => o.orderStatus === "DELIVERED").length;
            const rate = total > 0 ? Math.round((delivered / total) * 100) : 0;
            return [
                { id: 1, title: "Total Bookings", value: String(total), icon: Calculator },
                { id: 2, title: "Pending", value: String(pending), icon: CalendarRange },
                { id: 3, title: "Delivered", value: String(delivered), icon: MessageCircleIcon },
                { id: 4, title: "Delivery Rate", value: `${rate}%`, icon: ShoppingBag },
            ];
        }
        if (activeTab === "services") {
            const total = serviceEnrollments.length;
            const pending = serviceEnrollments.filter((s) => s.status === "PENDING" || s.status === "UNDER_REVIEW").length;
            const enrolled = serviceEnrollments.filter((s) => s.status === "ENROLLED" || s.status === "COMPLETED").length;
            const rate = total > 0 ? Math.round((enrolled / total) * 100) : 0;
            return [
                { id: 1, title: "Total Bookings", value: String(total), icon: Calculator },
                { id: 2, title: "Pending", value: String(pending), icon: CalendarRange },
                { id: 3, title: "Enrolled", value: String(enrolled), icon: MessageCircleIcon },
                { id: 4, title: "Conversion Rate", value: `${rate}%`, icon: ShoppingBag },
            ];
        }
        if (activeTab === "courses") {
            const total = courseEnrollments.length;
            const active = courseEnrollments.filter((c) => c.status === "ENROLLED").length;
            const completed = courseEnrollments.filter((c) => c.status === "COMPLETED").length;
            const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
            return [
                { id: 1, title: "Total Enrollments", value: String(total), icon: Calculator },
                { id: 2, title: "Active", value: String(active), icon: CalendarRange },
                { id: 3, title: "Completed", value: String(completed), icon: MessageCircleIcon },
                { id: 4, title: "Completion Rate", value: `${rate}%`, icon: ShoppingBag },
            ];
        }
        const total = rpcEnquiries.length;
        const pending = rpcEnquiries.filter((r) => r.status === "PENDING" || r.status === "UNDER_REVIEW").length;
        const approved = rpcEnquiries.filter((r) => r.status === "ENROLLED" || r.status === "COMPLETED").length;
        const rate = total > 0 ? Math.round((approved / total) * 100) : 0;
        return [
            { id: 1, title: "Total Enquiries", value: String(total), icon: Calculator },
            { id: 2, title: "Pending", value: String(pending), icon: CalendarRange },
            { id: 3, title: "Approved", value: String(approved), icon: MessageCircleIcon },
            { id: 4, title: "Conversion Rate", value: `${rate}%`, icon: ShoppingBag },
        ];
    }, [activeTab, orders, serviceEnrollments, courseEnrollments, rpcEnquiries]);

    const orderColumns = useMemo<ColumnDef<OrderRow>[]>(() => [
        { key: "orderId", header: "Order ID", sortable: true, accessor: "orderId", widthClassName: "w-32" },
        {
            key: "customer",
            header: "Contact Info",
            accessor: "customerName",
            widthClassName: "min-w-[220px]",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.customerName}</span>
                    <span className="text-sm text-gray-500">{row.customerEmail}</span>
                    <span className="text-sm text-gray-500">{row.customerMobile}</span>
                </div>
            )
        },
        {
            key: "items",
            header: "Items",
            accessor: (row) => `${row.items?.length ?? 0} item(s)`,
            widthClassName: "min-w-[140px]"
        },
        {
            key: "totalAmount",
            header: "Amount",
            sortable: true,
            accessor: (row) => `₹${row.totalAmount?.toLocaleString("en-IN")}`,
            widthClassName: "w-32"
        },
        { key: "orderedAt", header: "Date", sortable: true, accessor: (row) => row.orderedAt ? new Date(row.orderedAt).toLocaleDateString() : "-", widthClassName: "w-40" },
        {
            key: "orderStatus",
            header: "Status",
            sortable: true,
            accessor: "orderStatus",
            widthClassName: "w-36",
            cell: (row) => (
                <span className={`inline-flex min-w-20 justify-center rounded-full px-3 py-1 text-xs font-semibold ${orderStatusBadge[row.orderStatus] ?? "bg-gray-200 text-gray-700"}`}>
                    {row.orderStatus}
                </span>
            )
        },
        {
            key: "paymentId",
            header: "Payment ID",
            accessor: (row) => row.paymentId || "-",
            widthClassName: "w-40"
        },
        {
            key: "paymentStatus",
            header: "Payment Status",
            accessor: "paymentStatus",
            widthClassName: "w-32",
            cell: (row) => (
                <span className={`inline-flex min-w-20 justify-center rounded-full px-3 py-1 text-xs font-semibold ${row.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : row.paymentStatus === "FAILED" || row.paymentStatus === "REFUNDED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {row.paymentStatus}
                </span>
            )
        },
        assignedToColumn<OrderRow>(assignments),
    ], [assignments]);

    const serviceColumns = useMemo<ColumnDef<ServiceEnrollmentRow>[]>(() => [
        { key: "serviceEnrollmentId", header: "Booking ID", sortable: true, accessor: "serviceEnrollmentId", widthClassName: "w-32" },
        {
            key: "contact",
            header: "Contact Info",
            accessor: "fullName",
            widthClassName: "min-w-[220px]",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.fullName}</span>
                    <span className="text-sm text-gray-500">{row.email}</span>
                    <span className="text-sm text-gray-500">{row.mobileNumber}</span>
                </div>
            )
        },
        {
            key: "serviceName",
            header: "Service Interest",
            sortable: true,
            accessor: "serviceName",
            widthClassName: "min-w-[180px]",
            cell: (row) => (
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                    {row.serviceName}
                </span>
            )
        },
        { key: "bookingDate", header: "Booking Date", sortable: true, accessor: "bookingDate", widthClassName: "w-36" },
        { key: "slotTime", header: "Slot", accessor: "slotTime", widthClassName: "w-32" },
        {
            key: "additionalNotes",
            header: "Message",
            accessor: "additionalNotes",
            widthClassName: "min-w-[220px]",
            cell: (row) => <p className="truncate max-w-62.5">{row.additionalNotes}</p>
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            accessor: "status",
            widthClassName: "w-36",
            cell: (row) => (
                <span className={`inline-flex min-w-20 justify-center rounded-full px-3 py-1 text-xs font-semibold ${enrollmentStatusBadge[row.status] ?? "bg-gray-200 text-gray-700"}`}>
                    {row.status}
                </span>
            )
        },
        assignedToColumn<ServiceEnrollmentRow>(assignments),
    ], [assignments]);

    const courseColumns = useMemo<ColumnDef<CourseEnrollmentRow>[]>(() => [
        { key: "enrollmentId", header: "Enrollment ID", sortable: true, accessor: "enrollmentId", widthClassName: "w-32" },
        {
            key: "contact",
            header: "Contact Info",
            accessor: "fullName",
            widthClassName: "min-w-[220px]",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.fullName}</span>
                    <span className="text-sm text-gray-500">{row.email}</span>
                    <span className="text-sm text-gray-500">{row.mobile}</span>
                </div>
            )
        },
        { key: "courseName", header: "Course", sortable: true, accessor: "courseName", widthClassName: "min-w-[180px]" },
        {
            key: "progressPercent",
            header: "Progress",
            accessor: "progressPercent",
            widthClassName: "w-28",
            cell: (row) => (
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${row.progressPercent}%` }}></div>
                </div>
            )
        },
        { key: "enrolledAt", header: "Enrolled On", sortable: true, accessor: (row) => row.enrolledAt ? new Date(row.enrolledAt).toLocaleDateString() : "-", widthClassName: "w-40" },
        {
            key: "status",
            header: "Status",
            sortable: true,
            accessor: "status",
            widthClassName: "w-32",
            cell: (row) => (
                <span className={`inline-flex min-w-20 justify-center rounded-full px-3 py-1 text-xs font-semibold ${enrollmentStatusBadge[row.status] ?? "bg-gray-200 text-gray-700"}`}>
                    {row.status}
                </span>
            )
        },
        {
            key: "paymentId",
            header: "Payment ID",
            accessor: (row) => row.paymentId || "-",
            widthClassName: "w-40"
        },
        {
            key: "paymentStatus",
            header: "Payment Status",
            accessor: (row) => row.paymentStatus || "-",
            widthClassName: "w-32",
            cell: (row) => (
                <span className={`inline-flex min-w-20 justify-center rounded-full px-3 py-1 text-xs font-semibold ${row.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : row.paymentStatus === "FAILED" || row.paymentStatus === "REFUNDED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {row.paymentStatus || "N/A"}
                </span>
            )
        },
        assignedToColumn<CourseEnrollmentRow>(assignments),
    ], [assignments]);

    const rpcColumns = useMemo<ColumnDef<RpcEnquiryRow>[]>(() => [
        { key: "enrollmentId", header: "Enquiry ID", sortable: true, accessor: "enrollmentId", widthClassName: "w-32" },
        {
            key: "contact",
            header: "Contact Info",
            accessor: "username",
            widthClassName: "min-w-[220px]",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.username}</span>
                    <span className="text-sm text-gray-500">{row.email}</span>
                    <span className="text-sm text-gray-500">{row.mobile}</span>
                </div>
            )
        },
        {
            key: "location",
            header: "Location",
            accessor: (row) => `${row.city}, ${row.state}`,
            widthClassName: "min-w-[180px]"
        },
        { key: "age", header: "Age", accessor: "age", widthClassName: "w-20" },
        { key: "gender", header: "Gender", accessor: "gender", widthClassName: "w-24" },
        { key: "createdAt", header: "Date", sortable: true, accessor: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-", widthClassName: "w-40" },
        {
            key: "status",
            header: "Status",
            sortable: true,
            accessor: "status",
            widthClassName: "w-32",
            cell: (row) => (
                <span className={`inline-flex min-w-20 justify-center rounded-full px-3 py-1 text-xs font-semibold ${enrollmentStatusBadge[row.status] ?? "bg-gray-200 text-gray-700"}`}>
                    {row.status}
                </span>
            )
        },
        {
            key: "assignedTo",
            header: "Assigned To",
            sortable: true,
            accessor: (row) => row.assignedTo?.name ?? "Unassigned",
            widthClassName: "min-w-[160px]",
            cell: (row) => (
                row.assignedTo ? (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">{row.assignedTo.name}</span>
                        <span className="text-xs text-gray-500">{row.assignedTo.email}</span>
                    </div>
                ) : (
                    <span className="inline-flex justify-center rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-500">
                        Unassigned
                    </span>
                )
            )
        }
    ], []);

    const tableActionFeatures: TableActionFeatures = {
        ...defaultTableActionFeatures,
        showDateFilter: true,
        showEdit: false,
        showDelete: false,
    };

    const slideData: { id: number; value: TabKey; label: string; icon: LucideIcon }[] = [
        { id: 1, value: "products", label: "Product Bookings", icon: ShoppingBag },
        { id: 2, value: "services", label: "Service Bookings", icon: CalendarRange },
        { id: 3, value: "courses", label: "Course Enrollments", icon: MessageCircleIcon },
        { id: 4, value: "rpc", label: "RPC Enquiries", icon: IdCard },
        { id: 5, value: "appointments", label: "Appointments", icon: Calendar },
        { id: 6, value: "replacements", label: "Replacements", icon: RefreshCw },
    ];

    const appointmentColumns = useMemo<ColumnDef<AppointmentRow>[]>(() => [
        { key: "appointmentId", header: "Appointment ID", accessor: "appointmentId", widthClassName: "w-36" },
        { key: "fullName", header: "Name", accessor: "fullName", widthClassName: "w-40" },
        { key: "mobile", header: "Mobile", accessor: "mobile", widthClassName: "w-32" },
        { key: "email", header: "Email", accessor: "email", widthClassName: "w-48" },
        { key: "service", header: "Service", accessor: "service", widthClassName: "w-40" },
        { key: "appointmentDate", header: "Date", accessor: "appointmentDate", widthClassName: "w-28" },
        { key: "appointmentTime", header: "Time", accessor: "appointmentTime", widthClassName: "w-24" },
        {
            key: "status",
            header: "Status",
            accessor: "status",
            widthClassName: "w-32",
            cell: (row: AppointmentRow) => (
                <span className={`inline-flex min-w-20 justify-center rounded-full px-3 py-1 text-xs font-semibold ${row.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                    row.status === "CONTACTED" ? "bg-blue-100 text-blue-700" :
                        row.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                    }`}>
                    {row.status}
                </span>
            )
        },
        assignedToColumn<AppointmentRow>(assignments),
    ], [assignments]);

    const replacementColumns = useMemo<ColumnDef<OrderReplacementRow>[]>(() => [
        { key: "replacementId", header: "Request ID", accessor: "replacementId", widthClassName: "w-36" },
        { key: "orderId", header: "Order ID", accessor: "orderId", widthClassName: "w-32" },
        { key: "reason", header: "Reason", accessor: "reason", widthClassName: "w-64" },
        {
            key: "images",
            header: "Photos",
            accessor: "images",
            widthClassName: "w-24",
            cell: (row) => <span>{row.images?.length || 0} photo(s)</span>
        },
        {
            key: "status",
            header: "Status",
            accessor: "status",
            widthClassName: "w-32",
            cell: (row) => (
                <span className={`inline-flex min-w-20 justify-center rounded-full px-3 py-1 text-xs font-semibold ${row.status === "COMPLETED" || row.status === "APPROVED" ? "bg-green-100 text-green-700" :
                    row.status === "REJECTED" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                    }`}>
                    {row.status}
                </span>
            )
        },
        assignedToColumn<OrderReplacementRow>(assignments),
    ], [assignments]);

    const handleRefersh = async () => {
        switch (activeTab) {
            case "products":
                const res = await loadOrders();
                loadAssignments(activeTab);
                return res;
            case "services":
                const ser = await loadServiceEnrollments();
                loadAssignments(activeTab);
                return ser;
            case "courses":
                const cour = await loadCourseEnrollments();
                loadAssignments(activeTab);
                return cour;
            case "appointments":
                const app = await loadAppointments();
                loadAssignments(activeTab);
                return app;
            case "replacements":
                const replace = await loadReplacements();
                loadAssignments(activeTab);
                return replace;
            case "rpc":
                const rpc = await loadRpcEnquiries();
                return rpc;
        }
    }

    const handleShowArchive = async () => {
        setArchivedLoading(true);
        setViewingArchived(true);
        try {
            if (activeTab === "courses") {
                const data = await getArchivedCourseEnrollments();
                setArchivedRows(data);
                return;
            }

            const archiveType = tabToArchiveType[activeTab];
            if (!archiveType) { setArchivedRows([]); return; }

            const ids = await getArchivedIds(archiveType);
            setArchivedIds(new Set(ids));

            let all: any[] = [];
            if (activeTab === "products") all = await getAllOrders();
            else if (activeTab === "services") all = await getAllServiceEnrollments();
            else if (activeTab === "rpc") all = await getAllRpcEnquiries();
            else if (activeTab === "appointments") all = await getAllAppointments();
            else if (activeTab === "replacements") all = await getAllReplacements();

            setArchivedRows(all.filter((row) => ids.includes(row.id)));
        } catch (err) {
            toast.error("Failed to load archived records");
        } finally {
            setArchivedLoading(false);
        }
    };

    const handleBackToActive = () => {
        setViewingArchived(false);
        setArchivedRows([]);
    };

    const handleRestore = async (row: any) => {
        try {
            if (activeTab === "courses") {
                await restoreCourseEnrollment(row.id);
                await loadCourseEnrollments();
            } else {
                const archiveType = tabToArchiveType[activeTab];
                if (!archiveType) return;
                await restoreRecord(archiveType, row.id);
                await loadArchivedIds(activeTab);
                // refresh the active tab's data too
                if (activeTab === "products") await loadOrders();
                else if (activeTab === "services") await loadServiceEnrollments();
                else if (activeTab === "rpc") await loadRpcEnquiries();
                else if (activeTab === "appointments") await loadAppointments();
                else if (activeTab === "replacements") await loadReplacements();
            }
            // refresh the archived view itself
            await handleShowArchive();
        } catch (err) {
            console.error("Failed to restore record", err);
        }
    };

    const handleTabChange = (tab: TabKey) => {
        setActiveTab(tab);
        setSearchParams({ view: tab });
        setViewingArchived(false);
        setArchivedRows([]);
    };

    return (
        <main className="space-y-4">
            <section className="space-y-4">
                <div className="flex flex-col">
                    <p className="text-lg font-semibold dark:text-white">Bookings & Enrollments</p>
                    <p className="text-md font-semibold text-gray-600">Manage product orders, service bookings, course enrollments and RPC enquiries</p>
                </div>
                <StatusCard data={statusData} gridcount={4} />
            </section>
            <section className="space-y-4">
                <section className="flex space-x-4 border-b pb-2 border-gray-300 dark:border-gray-600">
                    {slideData.map((tab) => {
                        const isActive = activeTab === tab.value;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.value)}
                                className={`flex items-center space-x-2 pb-2 border-b-2 transition-all cursor-pointer
                                    ${isActive ? "border-yellow-500 text-yellow-600" : "border-transparent text-gray-500 hover:text-yellow-500"}`}
                            >
                                <tab.icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </section>

                {error && <p className="text-red-500">{error}</p>}

                <section>
                    {!viewingArchived && <>
                        {activeTab === "products" && (
                        <Table
                            data={orders.filter((o) => !archivedIds.has(o.id))}
                            columns={orderColumns}
                            rowKey={(row) => String(row.id)}
                            mode="client"
                            dateFilterAccessor="orderedAt"
                            loading={loading}
                            tableActionFeatures={tableActionFeatures}
                            showRowActions={true}
                            onRefresh={() => handleRefersh()}
                            onViewRow={(row) => navigate(`../booking_enquiry/view-booking/${row.id}`, { state: { type: "product", data: row } })}
                            onExportFile={async (format) => { await exportOrders(format.toUpperCase() as "EXCEL" | "PDF" | "CSV"); }}
                            onImportFile={async (file) => { await importOrders(file); await loadOrders(); }}
                            onArchiveSelected={async (rows) => {
                                await archiveRecords("PRODUCT", rows.map((r) => r.id));
                                await loadArchivedIds("products");
                            }}
                            onShowArchive={handleShowArchive}
                        />
                        )}
                        {activeTab === "services" && (
                        <Table
                            data={serviceEnrollments.filter((s) => !archivedIds.has(s.id))}
                            columns={serviceColumns}
                            rowKey={(row) => String(row.id)}
                            mode="client"
                            dateFilterAccessor="bookingDate"
                            loading={loading}
                            tableActionFeatures={tableActionFeatures}
                            showRowActions={true}
                            onRefresh={() => handleRefersh()}
                            onViewRow={(row) => navigate(`../booking_enquiry/view-booking/${row.id}`, { state: { type: "service", data: row } })}
                            onExportFile={async (format) => { await exportServiceEnrollments(format.toUpperCase() as "EXCEL" | "PDF" | "CSV"); }}
                            onImportFile={async (file) => { await importServiceEnrollments(file); await loadServiceEnrollments(); }}
                            onArchiveSelected={async (rows) => {
                                await archiveRecords("SERVICE", rows.map((r) => r.id));
                                await loadArchivedIds("services");
                            }}
                            onShowArchive={handleShowArchive}
                        />
                        )}
                        {activeTab === "courses" && (
                        <Table
                            data={courseEnrollments.filter((c) => !archivedIds.has(c.id))}
                            columns={courseColumns}
                            rowKey={(row) => String(row.id)}
                            mode="client"
                            dateFilterAccessor="enrolledAt"
                            loading={loading}
                            tableActionFeatures={tableActionFeatures}
                            showRowActions={true}
                            onRefresh={() => handleRefersh()}
                            onViewRow={(row) => navigate(`../booking_enquiry/view-booking/${row.id}`, { state: { type: "course", data: row } })}
                            onExportFile={async (format) => { await exportCourseEnrollments(format.toUpperCase() as "EXCEL" | "PDF" | "CSV"); }}
                            onImportFile={async (file) => { await importCourseEnrollments(file); await loadCourseEnrollments(); }}
                            onArchiveSelected={async (rows) => {
                                await archiveRecords("COURSE", rows.map((row) => row.id));
                                await loadArchivedIds("courses");
                            }}
                            onShowArchive={handleShowArchive}
                        />
                        )}
                        {activeTab === "rpc" && (
                        <Table
                            data={rpcEnquiries.filter((r) => !archivedIds.has(r.id))}
                            columns={rpcColumns}
                            rowKey={(row) => String(row.id)}
                            mode="client"
                            dateFilterAccessor="createdAt"
                            loading={loading}
                            tableActionFeatures={tableActionFeatures}
                            showRowActions={true}
                            onRefresh={() => handleRefersh()}
                            onViewRow={(row) => navigate(`../booking_enquiry/view-booking/${row.id}`, { state: { type: "rpc", data: row } })}
                            onExportFile={async (format) => {
                                await exportRpcEnquiries(format.toUpperCase() as "EXCEL" | "PDF" | "CSV");
                            }}
                            onImportFile={async (file) => {
                                await importRpcEnquiries(file);
                                await loadRpcEnquiries();
                            }}
                            onArchiveSelected={async (rows) => {
                                await archiveRecords("RPC", rows.map((r) => r.id));
                                await loadArchivedIds("rpc");
                            }}
                            onShowArchive={handleShowArchive}
                        />
                        )}
                        {activeTab === "appointments" && (
                        <Table
                            data={appointments.filter((a) => !archivedIds.has(a.id))}
                            columns={appointmentColumns}
                            rowKey={(row) => String(row.id)}
                            mode="client"
                            dateFilterAccessor="createdAt"
                            loading={loading}
                            tableActionFeatures={{ ...tableActionFeatures, showImport: false, showExport: false }}
                            showRowActions={true}
                            onRefresh={() => handleRefersh()}
                            onViewRow={(row) => navigate(`../booking_enquiry/view-booking/${row.id}`, { state: { type: "appointment", data: row } })}
                            onArchiveSelected={async (rows) => {
                                await archiveRecords("APPOINTMENT", rows.map((r) => r.id));
                                await loadArchivedIds("appointments");
                            }}
                            onShowArchive={handleShowArchive}
                        />
                        )}

                        {activeTab === "replacements" && (
                        <Table
                            data={replacements.filter((r) => !archivedIds.has(r.id))}
                            columns={replacementColumns}
                            rowKey={(row) => String(row.id)}
                            mode="client"
                            dateFilterAccessor="createdAt"
                            loading={loading}
                            tableActionFeatures={{ ...tableActionFeatures, showImport: false, showExport: false }}
                            showRowActions={true}
                            onRefresh={() => handleRefersh()}
                            onViewRow={(row) => navigate(`../booking_enquiry/view-booking/${row.id}`, { state: { type: "replacement", data: row } })}
                            onArchiveSelected={async (rows) => {
                                await archiveRecords("REPLACEMENT", rows.map((r) => r.id));
                                await loadArchivedIds("replacements");
                            }}
                            onShowArchive={handleShowArchive}
                        />
                        )}
                    </>}
                    {viewingArchived ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Archived {slideData.find((t) => t.value === activeTab)?.label}
                                </h2>
                                <button
                                    onClick={handleBackToActive}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                                >
                                    ← Back to Active
                                </button>
                            </div>
                            <Table<any>
                                data={archivedRows}
                                columns={
                                    activeTab === "products" ? orderColumns :
                                        activeTab === "services" ? serviceColumns :
                                            activeTab === "courses" ? courseColumns :
                                                activeTab === "rpc" ? rpcColumns :
                                                    activeTab === "appointments" ? appointmentColumns :
                                                        replacementColumns
                                }
                                rowKey={(row: any) => String(row.id)}
                                mode="client"
                                loading={archivedLoading}
                                tableActionFeatures={{ ...tableActionFeatures, showExport: false, showImport: false, showArchive: false }}
                                showRowActions={true}
                                renderRowActions={(row: any) => (
                                    <button
                                        onClick={() => handleRestore(row)}
                                        className="px-3 py-1 bg-green-500 text-white rounded-md text-xs font-medium hover:bg-green-600 transition-colors"
                                    >
                                        Restore
                                    </button>
                                )}
                                onRefresh={handleShowArchive}
                            />
                        </div>
                    ) : null}
                </section>
            </section>
        </main>
    );
}