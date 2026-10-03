import { useEffect, useRef, useState } from "react";
import {
    Search,
    X,
    Package,
    GraduationCap,
    UserRound,
    ShoppingCart,
    CalendarDays,
    Wrench,
    Plane,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllProducts, type ProductRow, } from "../../service/productApi";
import { getAllCourses, type CourseRow, } from "../../service/courseApi";
import { getAllStudents, type StudentRow, } from "../../service/studentApi";
import { getAllOrders, type OrderRow, } from "../../service/orderApi";
import { getAllAppointments, type AppointmentRow, } from "../../service/appointmentApi";
import { getAllServiceEnrollments, type ServiceEnrollmentRow, } from "../../service/serviceEnrollmentApi";
import { getAllRpcEnquiries, type RpcEnquiryRow, } from "../../service/rpcApi";
type Result = {
    id: string;
    title: string;
    subtitle: string;
    type: string;
    path: string;
    icon: typeof Search;
};

export default function GlobalSearch() {
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Result[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const cacheRef = useRef<Result[] | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const term = query.trim().toLowerCase();

        if (term.length < 2) {
            setResults([]);
            return;
        }
        const timer = window.setTimeout(async () => {
            setOpen(true);
            if (!cacheRef.current) {
                setLoading(true);

                const settled = await Promise.allSettled([
                    getAllProducts(),
                    getAllCourses(),
                    getAllStudents(),
                    getAllOrders(),
                    getAllAppointments(),
                    getAllServiceEnrollments(),
                    getAllRpcEnquiries(),
                ]);

                const [
                    products,
                    courses,
                    students,
                    orders,
                    appointments,
                    services,
                    rpc,
                ] = settled;

                const all: Result[] = [];

                // Products
                if (products.status === "fulfilled") {
                    (products.value as ProductRow[]).forEach((product) => {
                        all.push({
                            id: `product-${product.id}`,
                            title: product.productName,
                            subtitle: `${product.productId} • ₹${product.price.toLocaleString(
                                "en-IN"
                            )}`,
                            type: "Product",
                            path: `/admin-dashboard/products/edit-product/${product.id}`,
                            icon: Package,
                        });
                    });
                }

                // Courses
                if (courses.status === "fulfilled") {
                    (courses.value as CourseRow[]).forEach((course) => {
                        all.push({
                            id: `course-${course.id}`,
                            title: course.courseName,
                            subtitle: `${course.courseCode} • Course`,
                            type: "Course",
                            path: `/admin-dashboard/courses/${course.id}`,
                            icon: GraduationCap,
                        });
                    });
                }

                // Students
                if (students.status === "fulfilled") {
                    (students.value as StudentRow[]).forEach((student) => {
                        all.push({
                            id: `student-${student.id}`,
                            title: student.fullName,
                            subtitle: `${student.studentId} • ${student.courseName}`,
                            type: "Student",
                            path: `/admin-dashboard/students/view-student/${student.id}`,
                            icon: UserRound,
                        });
                    });
                }

                // Orders
                if (orders.status === "fulfilled") {
                    (orders.value as OrderRow[]).forEach((order) => {
                        all.push({
                            id: `order-${order.id}`,
                            title: order.orderId,
                            subtitle: `${order.customerName} • ₹${order.totalAmount.toLocaleString(
                                "en-IN"
                            )}`,
                            type: "Order",
                            path: `/admin-dashboard/booking_enquiry?view=products`,
                            icon: ShoppingCart,
                        });
                    });
                }

                // Appointments
                if (appointments.status === "fulfilled") {
                    (appointments.value as AppointmentRow[]).forEach((appointment) => {
                        all.push({
                            id: `appointment-${appointment.id}`,
                            title: appointment.fullName,
                            subtitle: `${appointment.appointmentId} • ${appointment.service}`,
                            type: "Appointment",
                            path: `/admin-dashboard/booking_enquiry?view=appointments`,
                            icon: CalendarDays,
                        });
                    });
                }

                // Service bookings
                if (services.status === "fulfilled") {
                    (services.value as ServiceEnrollmentRow[]).forEach((service) => {
                        all.push({
                            id: `service-${service.id}`,
                            title: service.fullName,
                            subtitle: `${service.serviceEnrollmentId} • ${service.serviceName}`,
                            type: "Service Booking",
                            path: `/admin-dashboard/booking_enquiry?view=services`,
                            icon: Wrench,
                        });
                    });
                }

                // RPC
                if (rpc.status === "fulfilled") {
                    (rpc.value as RpcEnquiryRow[]).forEach((item: RpcEnquiryRow) => {
                        all.push({
                            id: `rpc-${item.id}`,
                            title: item.username,
                            subtitle: `${item.enrollmentId} • RPC`,
                            type: "RPC",
                            path: `/admin-dashboard/booking_enquiry?view=rpc`,
                            icon: Plane,
                        });
                    });
                }

                cacheRef.current = all;
                setLoading(false);
            }

            const filtered = (cacheRef.current ?? [])
                .filter((result) =>
                    `${result.title} ${result.subtitle} ${result.type}`
                        .toLowerCase()
                        .includes(term)
                )
                .slice(0, 12);

            setResults(filtered);
        }, 250);

        return () => window.clearTimeout(timer);
    }, [query]);

    const handleResultClick = (path: string) => {
        setOpen(false);
        setQuery("");
        navigate(path);
    };

    return (
        <div
            ref={wrapperRef}
            className="relative hidden w-full max-w-xl lg:block"
        >
            {/* Search Input */}
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 transition focus-within:border-yellow-400 focus-within:bg-white dark:border-gray-700 dark:bg-gray-800/70 dark:focus-within:bg-gray-800">
                <Search
                    size={17}
                    className="shrink-0 text-gray-400"
                />

                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={() => {
                        if (query.trim().length >= 2) {
                            setOpen(true);
                        }
                    }}
                    placeholder="Search customers, orders, courses, products..."
                    className="ml-2 min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none dark:text-gray-100"
                />

                {query && (
                    <button
                        onClick={() => {
                            setQuery("");
                            setResults([]);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Results */}
            {open && (
                <div className="absolute left-0 right-0 top-full z-60 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
                    <div className="max-h-120 overflow-y-auto p-2">
                        {loading ? (
                            <div className="p-8 text-center text-sm text-gray-500">
                                Searching...
                            </div>
                        ) : results.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-500">
                                No results found.
                            </div>
                        ) : (
                            results.map((result) => {
                                const Icon = result.icon;

                                return (
                                    <button
                                        key={result.id}
                                        onClick={() => handleResultClick(result.path)}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <div className="rounded-lg bg-yellow-100 p-2 text-yellow-700 dark:bg-yellow-900/30">
                                            <Icon size={17} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                {result.title}
                                            </p>

                                            <p className="truncate text-xs text-gray-500">
                                                {result.subtitle}
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-500 dark:bg-gray-800">
                                            {result.type}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <div className="border-t px-3 py-2 text-[10px] text-gray-400 dark:border-gray-800">
                        Search uses the dashboard's existing business APIs.
                    </div>
                </div>
            )}
        </div>
    );
}