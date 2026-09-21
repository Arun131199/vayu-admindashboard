import {
    ArrowLeft,
    Mail,
    Phone,
    BookOpen,
    Calendar,
    MapPin,
    ShieldAlert,
    StickyNote
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import BreadCrump from "../../../component/BreadCrump/BreadCrump";
import Button from "../../../component/Buttons/Button";

const statusLabel: Record<string, string> = {
    ENROLLED: "Enrolled",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    DROPPED: "Dropped",
};

export default function ViewStudent() {
    const location = useLocation();
    const student = location?.state;

    const navigate = useNavigate();

    const breadCrumpOption = [
        { id: 1, label: "Students", onClick: () => navigate(-1) },
        { id: 2, label: "View Student" }
    ];

    const details = [
        { label: "Email Address", value: student?.email, icon: Mail },
        { label: "Phone Number", value: student?.mobile, icon: Phone },
        { label: "Course", value: student?.courseName, icon: BookOpen },
        { label: "Enrollment Date", value: student?.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString() : "-", icon: Calendar },
        { label: "Emergency Contact", value: student?.emergencyContact, icon: ShieldAlert },
        { label: "Address", value: student?.address, icon: MapPin },
        { label: "Notes", value: student?.notes || "No Notes Added", icon: StickyNote }
    ];

    return (
        <main className="space-y-4">
            <section className="flex items-center gap-3">
                <ArrowLeft className="cursor-pointer dark:text-white" onClick={() => navigate(-1)} />
                <BreadCrump options={breadCrumpOption} breadCrumpActive={true} />
            </section>

            <section className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-yellow-500 text-white flex items-center justify-center text-2xl font-bold">
                            {student?.fullName?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold dark:text-white">{student?.fullName}</h2>
                            <p className="text-gray-500 dark:text-gray-400">Student Profile — {student?.studentId}</p>
                        </div>
                    </div>
                    <div>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium
                            ${student?.status === "COMPLETED" ? "bg-green-100 text-green-700"
                                : student?.status === "DROPPED" ? "bg-red-100 text-red-700"
                                    : student?.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700"
                                        : "bg-blue-100 text-blue-700"}`}>
                            {statusLabel[student?.status] ?? student?.status}
                        </span>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {details.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <Icon size={18} className="text-yellow-500" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                                </div>
                                <p className="font-medium dark:text-white wrap-break-words">{item.value}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-4">
                    <Button buttonText="Back" varient="secondary" onClick={() => navigate(-1)} />
                    <Button
                        buttonText="Edit Student"
                        varient="primary"
                        onClick={() => navigate(`../edit-student/${student?.id}`, { state: student })}
                    />
                </div>
            </section>
        </main>
    );
}