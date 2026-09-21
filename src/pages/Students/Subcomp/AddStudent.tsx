import { ArrowLeft, AtSign, Phone } from "lucide-react";
import BreadCrump from "../../../component/BreadCrump/BreadCrump";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AllInputFields from "../../../component/AllInputFields/AllInputFields";
import { useEffect, useState } from "react";
import Button from "../../../component/Buttons/Button";
import ConfirmationPopup from "../../../component/Popup/ConfirmationPopup";
import { createStudent, updateStudent, getStudentById, getAllCourses, type CourseRow, updateStudentProgress } from "../../../service/studentApi";
import { toast } from "sonner";

type studentDataProps = {
    name: string;
    email: string;
    phone_number: string;
    courseId: string;
    enrollmentDate: string;
    status: string;
    progress: string;
    emergencyContact: string;
    address: string;
    note: string;
}

const statusOptions = [
    { label: "Enrolled", value: "ENROLLED" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Dropped", value: "DROPPED" },
];

export default function AddStudent() {
    const navigate = useNavigate();
    const { id } = useParams();

    const isEdit = Boolean(id);

    const location = useLocation();
    const state = location?.state;

    const normalizePhone = (value?: string) => (value || "").replace(/\D/g, "").slice(-10);

    const [courses, setCourses] = useState<CourseRow[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");

    const [studentData, setStudentData] = useState<studentDataProps>({
        name: "",
        email: "",
        phone_number: "",
        courseId: "",
        enrollmentDate: "",
        status: "ENROLLED",
        progress: "0",
        emergencyContact: "",
        address: "",
        note: ""
    });

    const [error, setError] = useState({
        name: "",
        email: "",
        phone_number: "",
        courseId: "",
        emergencyContact: "",
        address: "",
    })
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [openSuccess, setOpenSuccess] = useState(false);

    useEffect(() => {
        getAllCourses().then(setCourses).catch((e) => console.error("Failed to load courses", e));
    }, []);

    useEffect(() => {
        if (!isEdit || !id) return;

        // if navigated with row state (from view/table), hydrate immediately
        if (state) {
            hydrateFromRow(state);
        } else {
            // direct URL visit — fetch fresh
            getStudentById(Number(id)).then((s) => {
                if (s) hydrateFromRow(s);
            });
        }
    }, [isEdit, id]);

    const hydrateFromRow = (row: any) => {
        setStudentData({
            name: row?.fullName || row?.name || "",
            email: row?.email || "",
            phone_number: normalizePhone(row?.mobile || row?.phone_number),
            courseId: row?.courseId ? String(row.courseId) : "",
            enrollmentDate: row?.enrolledAt ? row.enrolledAt.split("T")[0] : (row?.enrollment_date || ""),
            status: row?.status || "ENROLLED",
            progress: String(row?.progressPercent ?? row?.progress ?? "0"),
            address: row?.address || "",
            note: row?.notes || row?.note || "",
            emergencyContact: normalizePhone(row?.emergencyContact || row?.emergency_contact)
        });
    };

    const validateForm = () => {
        let newErrors = {
            name: "", email: "", phone_number: "", courseId: "", emergencyContact: "", address: "",
        }
        let validation = true;

        if (!studentData.name.trim()) { newErrors.name = "Full name is required"; validation = false; }

        if (!studentData.email.trim()) {
            newErrors.email = "Email is required"; validation = false;
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(studentData.email)) {
            newErrors.email = "Invalid email address"; validation = false;
        }

        if (!studentData.phone_number.trim()) {
            newErrors.phone_number = "Phone number is required"; validation = false;
        } else if (!/^[6-9][0-9]{9}$/.test(studentData.phone_number)) {
            newErrors.phone_number = "Enter a valid 10-digit mobile number (starts with 6-9)"; validation = false;
        }

        if (!studentData.courseId) { newErrors.courseId = "Please select a course"; validation = false; }

        if (!studentData.emergencyContact.trim()) {
            newErrors.emergencyContact = "Emergency contact is required"; validation = false;
        } else if (!/^[6-9][0-9]{9}$/.test(studentData.emergencyContact)) {
            newErrors.emergencyContact = "Enter a valid 10-digit number (starts with 6-9)"; validation = false;
        }

        if (!studentData.address.trim()) { newErrors.address = "Address is required"; validation = false; }

        setError(newErrors);
        return validation;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError("");

        if (!validateForm()) return;

        const payload = {
            fullName: studentData.name,
            email: studentData.email,
            mobile: studentData.phone_number,
            emergencyContact: studentData.emergencyContact,
            address: studentData.address,
            notes: studentData.note,
            courseId: Number(studentData.courseId),
            status: studentData.status as "ENROLLED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED",
        };

        setSubmitting(true);
        try {
            if (isEdit && id) {
                await updateStudent(Number(id), payload);
                await updateStudentProgress(Number(id), Number(studentData.progress));
                toast.success("Student updated successfully");
            } else {
                await createStudent(payload);
                toast.success("Student created successfully");
            }
            setOpenSuccess(true);
        } catch (err: any) {
            setApiError(err?.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="space-y-4">
            <section className="flex items-start space-x-4 ">
                <ArrowLeft className="cursor-pointer dark:text-white" onClick={() => navigate(-1)} />
                <BreadCrump
                    title={isEdit ? "Edit Student" : "Add New Student"}
                    subtitles={isEdit ? "Update student information" : "Enroll a new student"}
                />
            </section>
            <section className="border border-gray-300 shadow-xl bg-white rounded-md dark:border-gray-700 
            p-4 dark:bg-gray-900">
                <div>
                    <h2 className="text-lg font-semibold mb-4 dark:text-white">{isEdit ? "Edit" : "Add"} Student Information</h2>
                    {apiError && <p className="text-red-500 text-sm mb-2">{apiError}</p>}
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        <AllInputFields
                            label="Full Name"
                            labelFor="name"
                            name="name"
                            placeholder="Enter the full name (ex. John Doe)"
                            value={studentData.name}
                            onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                            required={true}
                            type="text"
                            error={error.name}
                        />
                        <AllInputFields
                            label="Email Address"
                            labelFor="email"
                            name="email"
                            placeholder="Enter the email of the student"
                            value={studentData.email}
                            onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                            required={true}
                            type="email"
                            icon={AtSign}
                            error={error.email}
                        />
                        <AllInputFields
                            label="Phone Number"
                            labelFor="mobile"
                            name="mobile"
                            placeholder="10-digit mobile number"
                            value={studentData.phone_number}
                            onChange={(e) => setStudentData({ ...studentData, phone_number: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                            required={true}
                            type="text"
                            icon={Phone}
                            error={error.phone_number}
                        />
                        <AllInputFields
                            label="Course"
                            labelFor="courseId"
                            name="courseId"
                            placeholder="Select the course"
                            value={studentData.courseId}
                            isDropDown={true}
                            options={courses.map((c) => ({ label: c.courseName, value: String(c.id) }))}
                            onChange={(e) => setStudentData({ ...studentData, courseId: e.target.value })}
                            required={true}
                            error={error.courseId}
                        />
                        <AllInputFields
                            label="Status"
                            labelFor="status"
                            name="status"
                            value={studentData.status}
                            required={true}
                            isDropDown={true}
                            options={statusOptions}
                            onChange={(e) => setStudentData({ ...studentData, status: e.target.value })}
                        />
                        <AllInputFields
                            label="Course Progress (%)"
                            labelFor="progress"
                            name="progress"
                            value={studentData.progress}
                            onChange={(e) => setStudentData({ ...studentData, progress: e.target.value })}
                            type="number"
                        />
                        <AllInputFields
                            label="Emergency Contact"
                            labelFor="emergencyContact"
                            name="emergencyContact"
                            value={studentData.emergencyContact}
                            onChange={(e) => setStudentData({ ...studentData, emergencyContact: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                            required={true}
                            type="text"
                            placeholder="10-digit family member mobile number"
                            error={error.emergencyContact}
                        />
                    </div>
                    <div className="space-y-4">
                        <AllInputFields
                            label="Address"
                            labelFor="address"
                            name="address"
                            type="textarea"
                            value={studentData.address}
                            placeholder="Enter your full address"
                            onChange={(e) => setStudentData({ ...studentData, address: e.target.value })}
                            required={true}
                            error={error.address}
                        />
                        <AllInputFields
                            label="Notes"
                            labelFor="notes"
                            name="notes"
                            type="textarea"
                            placeholder="Additional notes about the student"
                            value={studentData.note}
                            onChange={(e) => setStudentData({ ...studentData, note: e.target.value })}
                            required={false}
                        />
                    </div>
                    <div className="flex items-center justify-end gap-4">
                        <Button
                            buttonText="Cancel"
                            varient="secondary"
                            onClick={() => setOpenConfirmation(true)}
                        />
                        <Button
                            buttonText={submitting ? "Saving..." : (isEdit ? "Update Student" : "Enroll Student")}
                            varient="primary"
                            type="submit"
                        />
                    </div>
                </form>
            </section>
            {
                openConfirmation && (
                    <ConfirmationPopup
                        title="Discard Changes?"
                        message="Are you sure you want to discard the changes? All the entered information will be lost."
                        onConfirm={() => navigate(-1)}
                        onClose={() => setOpenConfirmation(false)}
                        open={openConfirmation}
                        type="warning"
                    />
                )
            }
            {
                openSuccess && (
                    <ConfirmationPopup
                        open={openSuccess}
                        title={isEdit ? "Student Updated Successfully" : "Student Enrolled Successfully"}
                        message={isEdit ? "The student information has been updated successfully." : "The student has been enrolled successfully."}
                        onClose={() => setOpenSuccess(false)}
                        type="success"
                        onConfirm={() => navigate(-1)}
                    />
                )
            }
        </main>
    )
}