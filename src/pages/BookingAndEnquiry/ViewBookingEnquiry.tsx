import { useNavigate, useParams, useLocation } from "react-router-dom";
import BreadCrump from "../../component/BreadCrump/BreadCrump";
import { ArrowLeft, Mail, Phone, Calendar, User, MessageSquare, MapPin, Package, GraduationCap, IdCard, RefreshCw, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { getOrderById, type OrderRow } from "../../service/orderApi";
import { getServiceEnrollmentById, type ServiceEnrollmentRow } from "../../service/serviceEnrollmentApi";
import { getCourseEnrollmentById, type CourseEnrollmentRow } from "../../service/courseEnrollmentApi";
import { getRpcById, type RpcEnquiryRow } from "../../service/rpcApi";
import { type OrderReplacementRow } from "../../service/replacementApi";
import { getAppointmentById, type AppointmentRow } from "../../service/appointmentApi";
import { type LeadType } from "../../service/leadApi";

// RPC uses its own dedicated assign/remarks flow (separate backend endpoints)
import RpcAssignLeadModal from "../../component/RpcLead/AssignLeadModal";
import RpcRemarksPanel from "../../component/RpcLead/RemarksPanel";

// Product/Service/Course/Appointment/Replacement use the generic lead-assignment flow
import GenericAssignLeadModal from "../../component/LeadAssignment/AssignLeadModal";
import GenericRemarksPanel from "../../component/LeadAssignment/RemarksPanel";

type BookingType = "product" | "service" | "course" | "rpc" | "appointment" | "replacement";
type BookingData = OrderRow | ServiceEnrollmentRow | CourseEnrollmentRow | RpcEnquiryRow | AppointmentRow | OrderReplacementRow;

const genericLeadTypeMap: Partial<Record<BookingType, LeadType>> = {
    product: "PRODUCT",
    service: "SERVICE",
    course: "COURSE",
    appointment: "APPOINTMENT",
    replacement: "REPLACEMENT",
};

const statusColor: Record<string, string> = {
    DELIVERED: "bg-green-100 text-green-700",
    COMPLETED: "bg-green-100 text-green-700",
    ENROLLED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    RETURNED: "bg-red-100 text-red-700",
    REFUNDED: "bg-red-100 text-red-700",
    REJECTED: "bg-red-100 text-red-700",
    DROPPED: "bg-red-100 text-red-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
    PAYMENT_PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    PAYMENT_APPROVED: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-cyan-100 text-cyan-700",
    OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-700",
};

const typeLabel: Record<BookingType, string> = {
    product: "Product Booking",
    service: "Service Booking",
    course: "Course Enrollment",
    rpc: "RPC Enquiry",
    appointment: "Appointment",
    replacement: "Replacement Request",
};

const typeIcon: Record<BookingType, any> = {
    product: Package,
    service: MessageSquare,
    course: GraduationCap,
    rpc: IdCard,
    appointment: Calendar,
    replacement: RefreshCw,
};
export default function ViewBookingEnquiry() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { state } = useLocation();
    const type = state?.type as BookingType | undefined;
    const initialData = state?.data as BookingData | undefined;

    const [data, setData] = useState<BookingData | undefined>(initialData);
    const [loading, setLoading] = useState(true);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [currentAssigneeId, setCurrentAssigneeId] = useState<number | null>(null);

    const fetchLatest = async () => {
        if (!type || !id) return;
        setLoading(true);
        try {
            let fresh: BookingData | null = null;
            if (type === "product") fresh = await getOrderById(Number(id));
            else if (type === "service") fresh = await getServiceEnrollmentById(Number(id));
            else if (type === "course") fresh = await getCourseEnrollmentById(Number(id));
            else if (type === "appointment") fresh = await getAppointmentById(Number(id));
            else if (type === "replacement") fresh = null; // no single-get API yet, use nav state as-is
            else fresh = await getRpcById(Number(id));

            if (fresh) setData(fresh);
        } catch (err) {
            console.error("Failed to fetch latest booking data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatest();
    }, [id, type]);

    // For RPC, current assignee comes straight from the entity itself
    useEffect(() => {
        if (type === "rpc" && data) {
            setCurrentAssigneeId((data as RpcEnquiryRow).assignedTo?.id ?? null);
        }
    }, [type, data]);

    const breadCrumpOption = [
        { id: 1, label: "Bookings & Enquiries", onClick: () => navigate(-1) },
        { id: 2, label: "View Details" }
    ];

    if (!type || (!data && !loading)) {
        return (
            <main className="space-y-4">
                <section className="flex space-x-4 items-center">
                    <ArrowLeft className="dark:text-white cursor-pointer" onClick={() => navigate(-1)} />
                    <BreadCrump title="View Booking/Enquiry" subtitles="Details not found" options={breadCrumpOption} breadCrumpActive={true} />
                </section>
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No data available</p>
                    <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                        Go Back
                    </button>
                </div>
            </main>
        );
    }

    if (loading || !data) {
        return <main className="p-6 text-gray-500">Loading...</main>;
    }

    const TypeIcon = typeIcon[type];
    const status = (data as any).status ?? (data as any).orderStatus;
    const rpcData = type === "rpc" ? (data as RpcEnquiryRow) : null;
    const genericLeadType = genericLeadTypeMap[type];
    const entityId = (data as any).id as number;

    const renderFields = () => {
        if (type === "product") {
            const o = data as OrderRow;
            return (
                <>
                    <Field icon={User} label="Customer" value={o.customerName} />
                    <Field icon={Mail} label="Email" value={o.customerEmail} link={`mailto:${o.customerEmail}`} />
                    <Field icon={Phone} label="Phone" value={o.customerMobile} link={`tel:${o.customerMobile}`} />
                    <Field icon={MapPin} label="Address" value={`${o.address}, ${o.city}, ${o.state} - ${o.postalCode}`} />
                    <Field icon={Calendar} label="Ordered On" value={o.orderedAt ? new Date(o.orderedAt).toLocaleString("en-IN") : "-"} />
                    <Field icon={Package} label="Amount" value={`₹${o.totalAmount?.toLocaleString("en-IN")}`} />
                    <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Items</label>
                        <div className="mt-2 space-y-2">
                            {(o.items || []).map((item, idx) => (
                                <div key={idx} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-900 dark:text-white">{item.productName} × {item.quantity}</span>
                                    <span className="text-gray-500">₹{item.price?.toLocaleString("en-IN")}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {o.specialInstructions && (
                        <div className="md:col-span-2">
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Special Instructions</label>
                            <p className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                                {o.specialInstructions}
                            </p>
                        </div>
                    )}
                </>
            );
        }

        if (type === "service") {
            const s = data as ServiceEnrollmentRow;
            return (
                <>
                    <Field icon={User} label="Full Name" value={s.fullName} />
                    <Field icon={Mail} label="Email" value={s.email} link={`mailto:${s.email}`} />
                    <Field icon={Phone} label="Phone" value={s.mobileNumber} link={`tel:${s.mobileNumber}`} />
                    <Field icon={MessageSquare} label="Service" value={s.serviceName} />
                    <Field icon={Calendar} label="Booking Date" value={s.bookingDate} />
                    <Field icon={Calendar} label="Slot Time" value={s.slotTime} />
                    <Field icon={MapPin} label="Address" value={s.address} />
                    {s.additionalNotes && (
                        <div className="md:col-span-2">
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Message</label>
                            <p className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                                {s.additionalNotes}
                            </p>
                        </div>
                    )}
                </>
            );
        }

        if (type === "course") {
            const c = data as CourseEnrollmentRow;
            return (
                <>
                    <Field icon={User} label="Full Name" value={c.fullName} />
                    <Field icon={Mail} label="Email" value={c.email} link={`mailto:${c.email}`} />
                    <Field icon={Phone} label="Phone" value={c.mobile} link={`tel:${c.mobile}`} />
                    <Field icon={GraduationCap} label="Course" value={c.courseName} />
                    <Field icon={Calendar} label="Enrolled On" value={c.enrolledAt ? new Date(c.enrolledAt).toLocaleString("en-IN") : "-"} />
                    <Field icon={Calendar} label="Progress" value={`${c.progressPercent}%`} />
                    {c.completedAt && <Field icon={Calendar} label="Completed On" value={new Date(c.completedAt).toLocaleString("en-IN")} />}
                    {c.certificateUrl && (
                        <Field icon={Package} label="Certificate" value="Download" link={c.certificateUrl} />
                    )}
                </>
            );
        }

        if (type === "appointment") {
            const a = data as AppointmentRow;
            return (
                <>
                    <Field icon={User} label="Full Name" value={a.fullName} />
                    <Field icon={Mail} label="Email" value={a.email} link={`mailto:${a.email}`} />
                    <Field icon={Phone} label="Phone" value={a.mobile} link={`tel:${a.mobile}`} />
                    <Field icon={Calendar} label="Service" value={a.service} />
                    <Field icon={MapPin} label="Address" value={a.address} />
                    <Field icon={Calendar} label="Appointment" value={`${a.appointmentDate} at ${a.appointmentTime}`} />
                    {a.adminNotes && (
                        <div className="md:col-span-2">
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Admin Notes</label>
                            <p className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                                {a.adminNotes}
                            </p>
                        </div>
                    )}
                </>
            );
        }

        if (type === "replacement") {
            const r = data as OrderReplacementRow;
            return (
                <>
                    <Field icon={Package} label="Order ID" value={r.orderId} />
                    <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Reason</label>
                        <p className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                            {r.reason}
                        </p>
                    </div>
                    {r.images && r.images.length > 0 && (
                        <div className="md:col-span-2">
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Photos</label>
                            <div className="mt-2 flex gap-3 flex-wrap">
                                {r.images.map((img, i) => (
                                    <img key={i} src={img} alt={`Evidence ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                                ))}
                            </div>
                        </div>
                    )}
                    <Field icon={Calendar} label="Submitted On" value={r.createdAt ? new Date(r.createdAt).toLocaleString("en-IN") : "-"} />
                    {r.adminNotes && (
                        <div className="md:col-span-2">
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Admin Notes</label>
                            <p className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                                {r.adminNotes}
                            </p>
                        </div>
                    )}
                </>
            );
        }

        const r = data as RpcEnquiryRow;
        return (
            <>
                <Field icon={User} label="Full Name" value={r.username} />
                <Field icon={Mail} label="Email" value={r.email} link={`mailto:${r.email}`} />
                <Field icon={Phone} label="Phone" value={r.mobile} link={`tel:${r.mobile}`} />
                <Field icon={User} label="Age / Gender" value={`${r.age} / ${r.gender}`} />
                <Field icon={MapPin} label="Address" value={`${r.address}, ${r.city}, ${r.state} - ${r.postalCode}, ${r.country}`} />
                <Field icon={Calendar} label="Submitted On" value={r.createdAt ? new Date(r.createdAt).toLocaleString("en-IN") : "-"} />
                <Field
                    icon={UserCheck}
                    label="Assigned To"
                    value={r.assignedTo ? `${r.assignedTo.name} (${r.assignedTo.email})` : "Unassigned"}
                />
                {r.adminNotes && (
                    <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Admin Notes</label>
                        <p className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                            {r.adminNotes}
                        </p>
                    </div>
                )}
            </>
        );

    };

    return (
        <main className="space-y-4">
            <section className="flex space-x-4 items-center">
                <ArrowLeft className="dark:text-white cursor-pointer" onClick={() => navigate(-1)} />
                <BreadCrump title="View Booking/Enquiry" subtitles={typeLabel[type]} options={breadCrumpOption} breadCrumpActive={true} />
            </section>

            <section className="border dark:border-gray-700 shadow-xl rounded-md p-6 border-gray-300 bg-white dark:bg-gray-900 space-y-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <TypeIcon size={28} className="text-yellow-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {(data as any).orderId || (data as any).serviceEnrollmentId || (data as any).enrollmentId || (data as any).appointmentId}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">{typeLabel[type]}</p>
                        </div>
                    </div>
                    <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${statusColor[status] ?? "bg-gray-100 text-gray-700"}`}>
                        {status}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-b border-gray-200 dark:border-gray-700 py-6">
                    {renderFields()}
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex-wrap">
                    <button
                        onClick={() => navigate(`../edit-booking/${id}`, { state: { type, data } })}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        Update Status
                    </button>
                    <button
                        onClick={() => setAssignModalOpen(true)}
                        className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium flex items-center gap-2"
                    >
                        <UserCheck size={18} />
                        {currentAssigneeId ? "Reassign Lead" : "Assign Lead"}
                    </button>
                    <button onClick={() => navigate(-1)} className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium">
                        Go Back
                    </button>
                </div>
            </section>

            {/* Remarks history — RPC uses its dedicated flow, others use the generic one */}
            {type === "rpc" && rpcData && <RpcRemarksPanel rpcId={rpcData.id} />}
            {type !== "rpc" && genericLeadType && <GenericRemarksPanel leadType={genericLeadType} entityId={entityId} />}

            {/* Assign modal — RPC uses its dedicated flow, others use the generic one */}
            {type === "rpc" && rpcData && (
                <RpcAssignLeadModal
                    open={assignModalOpen}
                    rpcId={rpcData.id}
                    currentAssigneeId={rpcData.assignedTo?.id ?? null}
                    onClose={() => setAssignModalOpen(false)}
                    onAssigned={fetchLatest}
                />
            )}
            {type !== "rpc" && genericLeadType && (
                <GenericAssignLeadModal
                    open={assignModalOpen}
                    leadType={genericLeadType}
                    entityId={entityId}
                    currentAssigneeId={currentAssigneeId}
                    onClose={() => setAssignModalOpen(false)}
                    onAssigned={fetchLatest}
                />
            )}
        </main>
    );
}

function Field({ icon: Icon, label, value, link }: { icon: any; label: string; value: string; link?: string }) {
    return (
        <div className="flex items-start gap-4">
            <Icon size={20} className="text-yellow-500 mt-1 shrink-0" />
            <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{label}</label>
                {link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="block text-blue-600 dark:text-blue-400 hover:underline">{value}</a>
                ) : (
                    <p className="text-gray-900 dark:text-white font-medium">{value}</p>
                )}
            </div>
        </div>
    );
}