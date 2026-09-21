import { useNavigate, useLocation } from "react-router-dom";
import BreadCrump from "../../component/BreadCrump/BreadCrump";
import { ArrowLeft } from "lucide-react";
import AllInputFields from "../../component/AllInputFields/AllInputFields";
import ConfirmationPopup from "../../component/Popup/ConfirmationPopup";
import { useState } from "react";
import { updateOrderStatus, type OrderRow, type OrderStatus } from "../../service/orderApi";
import { updateServiceEnrollmentStatus, type ServiceEnrollmentRow } from "../../service/serviceEnrollmentApi";
import { updateRpcStatus, type RpcEnquiryRow } from "../../service/rpcApi";
import type { EnrollmentStatus } from "../../service/serviceEnrollmentApi";
import { updateCourseEnrollmentStatus, updateCourseProgress, type CourseEnrollmentRow } from "../../service/courseEnrollmentApi";
import { updateAppointmentStatus, type AppointmentRow } from "../../service/appointmentApi";
import { updateReplacementStatus, type OrderReplacementRow, type ReplacementStatus } from "../../service/replacementApi";
import { toast } from "sonner";

type BookingData = OrderRow | ServiceEnrollmentRow | CourseEnrollmentRow | RpcEnquiryRow | AppointmentRow | OrderReplacementRow;
type BookingType = "product" | "service" | "course" | "rpc" | "appointment" | "replacement";

const orderStatusOptions = [
    { label: "Pending", value: "PENDING" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
    { label: "Returned", value: "RETURNED" },
    { label: "Refunded", value: "REFUNDED" },
];

const enrollmentStatusOptions = [
    { label: "Pending", value: "PENDING" },
    { label: "Under Review", value: "UNDER_REVIEW" },
    { label: "Payment Pending", value: "PAYMENT_PENDING" },
    { label: "Payment Approved", value: "PAYMENT_APPROVED" },
    { label: "Enrolled", value: "ENROLLED" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Rejected", value: "REJECTED" },
    { label: "Dropped", value: "DROPPED" },
];

const appointmentStatusOptions = [
    { label: "Pending", value: "PENDING" },
    { label: "Contacted", value: "CONTACTED" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
];

const replacementStatusOptions = [
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
    { label: "Completed", value: "COMPLETED" },
];

export default function EditBookingEnquiry() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const type = state?.type as BookingType | undefined;
    const data = state?.data as BookingData | undefined;
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<string>((data as any)?.orderStatus ?? (data as any)?.status ?? "");
    const [remarks, setRemarks] = useState("");
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");

    const breadCrumpOption = [
        { id: 1, label: "Bookings & Enquiries", onClick: () => navigate(-1) },
        { id: 2, label: "Update Status" }
    ];

    const [progressPercent, setProgressPercent] = useState<number>(
        type === "course" ? (data as CourseEnrollmentRow)?.progressPercent ?? 0 : 0
    );

    if (!type || !data) {
        return (
            <main className="space-y-4">
                <section className="flex space-x-4 items-center">
                    <ArrowLeft className="dark:text-white cursor-pointer" onClick={() => navigate(-1)} />
                    <BreadCrump title="Update Status" subtitles="Data not found" options={breadCrumpOption} breadCrumpActive={true} />
                </section>
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No data available to edit</p>
                    <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                        Go Back
                    </button>
                </div>
            </main>
        );
    }

    const displayName = (data as any).customerName ?? (data as any).fullName ?? (data as any).username;
    const displayId = (data as any).orderId ?? (data as any).serviceEnrollmentId ?? (data as any).enrollmentId;
    const statusOptions =
        type === "product"
            ? orderStatusOptions
            : type === "appointment"
                ? appointmentStatusOptions
                : type === "replacement"
                    ? replacementStatusOptions
                    : enrollmentStatusOptions;

    const handleSave = () => {
        if (!status) return;
        setOpenConfirmation(true);
    };

    const handleConfirmSave = async () => {
        if (submitting || loading) return;

        setApiError("");
        setSubmitting(true);
        setLoading(true);

        try {
            if (type === "product") {
                await updateOrderStatus((data as OrderRow).id, status as OrderStatus);
                toast.success("The Status has been updated successfully")
            } else if (type === "service") {
                await updateServiceEnrollmentStatus((data as ServiceEnrollmentRow).id, status as EnrollmentStatus, remarks || undefined);
                toast.success("The Status has been updated successfully")
            } else if (type === "course") {
                await updateCourseEnrollmentStatus((data as CourseEnrollmentRow).id, status as EnrollmentStatus, remarks || undefined);
                const c = data as CourseEnrollmentRow;
                if (progressPercent !== c.progressPercent) {
                    await updateCourseProgress(c.userId, c.courseDbId, progressPercent);
                }
                toast.success("The Status has been updated successfully")
            } else if (type === "appointment") {
                await updateAppointmentStatus((data as AppointmentRow).id, status as "PENDING" | "CONTACTED" | "COMPLETED" | "CANCELLED", remarks || undefined);
                toast.success("The Status has been updated successfully")
            }
            else if (type === "replacement") {
                await updateReplacementStatus((data as OrderReplacementRow).id, status as ReplacementStatus, remarks || undefined);
                toast.success("The Status has been updated successfully")
            }
            else {
                await updateRpcStatus((data as RpcEnquiryRow).id, status as EnrollmentStatus, remarks || undefined);
                toast.success("The Status has been updated successfully")
            }

            window.dispatchEvent(new Event("booking-updated"));
            setOpenConfirmation(false);
            navigate(-1);
        } catch (err: any) {
            const message = err?.response?.data?.message || "Failed to update status. Please try again.";
            setApiError(message);
            setOpenConfirmation(false);
            toast.error(message);
        } finally {
            setSubmitting(false);
            setLoading(false);
        }
    };

    return (
        <main className="space-y-4">
            <section className="flex space-x-4 items-center">
                <ArrowLeft className="dark:text-white cursor-pointer" onClick={() => navigate(-1)} />
                <BreadCrump title="Update Status" subtitles={`${displayId} — ${displayName}`} options={breadCrumpOption} breadCrumpActive={true} />
            </section>

            <section className="border dark:border-gray-700 shadow-xl rounded-md p-6 border-gray-300 bg-white dark:bg-gray-900">
                {apiError && <p className="text-red-500 text-sm mb-4">{apiError}</p>}
                <form className="space-y-6">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Booking/Enquiry ID</label>
                        <input
                            type="text"
                            value={displayId}
                            disabled
                            className="mt-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AllInputFields
                            label="Status"
                            labelFor="status"
                            name="status"
                            required={true}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            isDropDown={true}
                            options={statusOptions}
                        />
                    </div>

                    {type === "course" && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Progress ({progressPercent}%)
                            </label>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={5}
                                value={progressPercent}
                                onChange={(e) => setProgressPercent(Number(e.target.value))}
                                className="w-full accent-yellow-500"
                            />
                        </div>
                    )}

                    {type !== "product" && (
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Remarks (optional)</label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Add a note about this status change"
                                rows={4}
                                className="mt-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600"
                            />
                        </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={submitting}
                            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                        >
                            {submitting ? "Saving..." : "Save Status"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </section>

            <ConfirmationPopup
                open={openConfirmation}
                type="warning"
                title="Confirm Status Change"
                message={`Are you sure you want to change the status to "${status}"?`}
                confirmButtonText="Save"
                closeButtonText="Cancel"
                onConfirm={handleConfirmSave}
                onClose={() => setOpenConfirmation(false)}
                showCancelButton={true}
                showCloseButton={true}
                loading={loading}
            />
        </main>
    );
}