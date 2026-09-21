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
import { getAllRpcEnquiries, type RpcEnquiryRow } from "../../../service/rpcApi";
import { getAllAppointments, type AppointmentRow } from "./../../../service/appointmentApi";
import { getAllReplacements, type OrderReplacementRow } from "../../../service/replacementApi";

type TabKey = "products" | "services" | "courses" | "rpc" | "appointments" | "replacements";

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

export default function BookingMain() {
    const navigate = useNavigate();

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

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setOrders(await getAllOrders());
        } catch (err) {
            console.error(err);
            setError("Failed to load product bookings");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadServiceEnrollments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setServiceEnrollments(await getAllServiceEnrollments());
        } catch (err) {
            console.error(err);
            setError("Failed to load service bookings");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadCourseEnrollments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setCourseEnrollments(await getAllCourseEnrollments());
        } catch (err) {
            console.error(err);
            setError("Failed to load course enrollments");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadRpcEnquiries = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setRpcEnquiries(await getAllRpcEnquiries());
        } catch (err) {
            console.error(err);
            setError("Failed to load RPC enquiries");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllAppointments();
            setAppointments(data);
        } catch (err) {
            console.error("Failed to load appointments", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadReplacements = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllReplacements();
            setReplacements(data);
        } catch (err) {
            console.error("Failed to load replacements", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === "products") loadOrders();
        else if (activeTab === "services") loadServiceEnrollments();
        else if (activeTab === "courses") loadCourseEnrollments();
        else if (activeTab === "appointments") loadAppointments();
        else if (activeTab === "replacements") loadReplacements();
        else loadRpcEnquiries();
    }, [activeTab]);

    useEffect(() => {
        const handleBookingUpdated = () => {
            if (activeTab === "products") loadOrders();
            else if (activeTab === "services") loadServiceEnrollments();
            else if (activeTab === "courses") loadCourseEnrollments();
            else if (activeTab === "appointments") loadAppointments();
            else loadRpcEnquiries();
        };
        window.addEventListener("booking-updated", handleBookingUpdated);
        return () => window.removeEventListener("booking-updated", handleBookingUpdated);
    }, [activeTab, loadOrders, loadServiceEnrollments, loadCourseEnrollments, loadAppointments, loadRpcEnquiries]);

    const handleTabChange = (tab: TabKey) => {
        setActiveTab(tab);
        setSearchParams({ view: tab });
    };

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
    ], []);

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
        }
    ], []);

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
    ], []);

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

    const appointmentColumns: ColumnDef<AppointmentRow>[] = [
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
    ];

    const replacementColumns: ColumnDef<OrderReplacementRow>[] = [
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
    ];

    const handleRefersh = async () => {
        switch (activeTab) {
            case "products":
                const res = await loadOrders();
                return res;
            case "services":
                const ser = await loadServiceEnrollments();
                return ser;
            case "courses":
                const cour = await loadCourseEnrollments();
                return cour;
            case "appointments":
                const app = await loadAppointments();
                return app;
            case "replacements":
                const replace = await loadReplacements();
                return replace;
            case "rpc":
                const rpc = await loadRpcEnquiries();
                return rpc;
        }
    }

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
                    {activeTab === "products" && (
                        <Table
                            data={orders}
                            columns={orderColumns}
                            rowKey={(row) => String(row.id)}
                            mode="client"
                            dateFilterAccessor="orderedAt"
                            loading={loading}
                            tableActionFeatures={tableActionFeatures}
                            showRowActions={true}
                            onRefresh={() => handleRefersh()}
                            onViewRow={(row) => navigate(`../booking_enquiry/view-booking/${row.id}`, { state: { type: "product", data: row } })}

                        />
                    )}
                    {activeTab === "services" && (
                        <Table
                            data={serviceEnrollments}
                            columns={serviceColumns}
                            rowKey={(row) => String(row.id)}
                            mode="client"
                            dateFilterAccessor="bookingDate"
                            loading={loading}
                            tableActionFeatures={tableActionFeatures}
                            showRowActions={true}
                            onRefresh={() => handleRefersh()}
                            onViewRow={(row) => navigate(`../booking_enquiry/view-booking/${row.id}`, { state: { type: "service", data: row } })}
                        />
                    )}
                    {activeTab === "courses" && (
                        <Table
                            data={courseEnrollments}
                            columns={courseColumns}
                            rowKey={(row) => String(row.id)}
                            mode="client"
                            dateFilterAccessor="enrolledAt"
                            loading={loading}
                            tableActionFeatures={tableActionFeatures}
                            showRowActions={true}
                            onRefresh={() => handleRefersh()}
                            onViewRow={(row) => navigate(`../booking_enquiry/view-booking/${row.id}`, { state: { type: "course", data: row } })}
                        />
                    )}
                    {activeTab === "rpc" && (
                        <Table
                            data={rpcEnquiries}
                            columns={rpcColumns}
                            rowKey={(row) => String(row.id)}
                            mode="client"
                            dateFilterAccessor="createdAt"
                            loading={loading}
                            tableActionFeatures={tableActionFeatures}
                            showRowActions={true}
                            onRefresh={() => handleRefersh()}
                            onViewRow={(row) => navigate(`../booking_enquiry/view-booking/${row.id}`, { state: { type: "rpc", data: row } })}
                        />
                    )}
                    {activeTab === "appointments" && (
                        <Table
                            data={appointments}
                            columns={appointmentColumns}
                            rowKey={(row) => String(row.id)}
                            mode="client"
                            dateFilterAccessor="createdAt"
                            loading={loading}
                            tableActionFeatures={tableActionFeatures}
                            showRowActions={true}
                            onRefresh={() => handleRefersh()}
                            onViewRow={(row) => navigate(`../booking_enquiry/view-booking/${row.id}`, { state: { type: "appointment", data: row } })}
                        />
                    )}

                    {activeTab === "replacements" && (
                        <Table
                            data={replacements}
                            columns={replacementColumns}
                            rowKey={(row) => String(row.id)}
                            mode="client"
                            dateFilterAccessor="createdAt"
                            loading={loading}
                            tableActionFeatures={tableActionFeatures}
                            showRowActions={true}
                            onRefresh={() => handleRefersh()}
                            onViewRow={(row) => navigate(`../booking_enquiry/view-booking/${row.id}`, { state: { type: "replacement", data: row } })}
                        />
                    )}
                </section>
            </section>
        </main>
    );
}