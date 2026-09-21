import { ArrowLeft, CalendarDays, ChartBarStacked, Clock, GraduationCap, Image, IndianRupee, Save, Text, TextAlignCenterIcon } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import AllInputFields from "../../../component/AllInputFields/AllInputFields";
import BreadCrump from "../../../component/BreadCrump/BreadCrump";
import Button from "../../../component/Buttons/Button";
import { createCourse, updateCourse, updateCourseStatus, type CourseRow, type CourseScheduleItem } from "../../../service/courseApi";

type AddCourseFormData = {
    courseName: string;
    courseCode: string;
    courseCategory: string;
    coursePrice: string;
    courseDuration: string;
    courseDescription: string;
    instructor: string;
    maxStudents: string;
    courseHighlights: string;   // one per line
    courseLearnContent: string; // one per line
    courseSchedule: string;     // one per line: DayNumber|DayLabel|Topic|Content1;Content2
    courseStatus: string;
};

type SelectedImage = { file: File; previewUrl: string };

export default function AddCourse() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const location = useLocation();
    const isEdit = Boolean(courseId);
    const selectedCourse = (location.state as CourseRow | undefined) ?? null;
    const imageInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<AddCourseFormData>({
        courseName: "",
        courseCode: "",
        courseCategory: "",
        coursePrice: "",
        courseDuration: "",
        courseDescription: "",
        instructor: "",
        maxStudents: "30",
        courseHighlights: "",
        courseLearnContent: "",
        courseSchedule: "",
        courseStatus: ""
    });
    const [courseImage, setCourseImage] = useState<SelectedImage | null>(null);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (courseImage) URL.revokeObjectURL(courseImage.previewUrl);
        };
    }, [courseImage]);

    const handleOnchange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (e.target instanceof HTMLInputElement && e.target.type === "file") {
            if (name === "courseImage") {
                const file = e.target.files?.[0];
                if (courseImage) URL.revokeObjectURL(courseImage.previewUrl);
                setCourseImage(file ? { file, previewUrl: URL.createObjectURL(file) } : null);
            } else if (name === "media") {
                setMediaFiles(e.target.files ? Array.from(e.target.files) : []);
            }
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const parseSchedule = (text: string): CourseScheduleItem[] => {
        return text
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
                const parts = line.split("|").map((p) => p.trim());
                const [dayNumberStr, day, topic, contentStr] = parts;
                return {
                    dayNumber: Number(dayNumberStr) || 0,
                    day: day ?? "",
                    topic: topic ?? "",
                    content: contentStr ? contentStr.split(";").map((c) => c.trim()).filter(Boolean) : [],
                };
            });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const schedule = parseSchedule(formData.courseSchedule);

        const payload = {
            courseName: formData.courseName,
            courseCode: formData.courseCode,
            courseDescription: formData.courseDescription,
            coursePrice: Number(formData.coursePrice),
            courseCategory: formData.courseCategory,
            courseDuration: formData.courseDuration,
            courseSchedule: schedule,
            courseHighlights: formData.courseHighlights.split("\n").map((s) => s.trim()).filter(Boolean),
            courseLearnContent: formData.courseLearnContent.split("\n").map((s) => s.trim()).filter(Boolean),
            instructor: formData.instructor || undefined,
            maxStudents: formData.maxStudents ? Number(formData.maxStudents) : undefined,
            courseStatus: formData.courseStatus
        };

        try {
            const result = isEdit && selectedCourse
                ? await updateCourse(selectedCourse.id, payload, courseImage?.file, mediaFiles)
                : await createCourse(payload, courseImage?.file, mediaFiles);

            if (isEdit && selectedCourse) {
                await updateCourseStatus(
                    selectedCourse.id,
                    formData.courseStatus
                );
            }

            if (result.success === false) {
                setError(result.message || "Failed to save course");
                setSubmitting(false);
                return;
            }

            navigate(-1);
        } catch (err) {
            console.error(err);
            setError("Failed to save course. Please check the fields and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const breadCrumpOptions = [
        { id: 1, label: "Courses", onClick: () => navigate(-1) },
        { id: 2, label: isEdit ? "Edit Course" : "Add New Course" }
    ];

    useEffect(() => {
        if (!isEdit || !selectedCourse) return;

        setFormData({
            courseName: selectedCourse.courseName,
            courseCode: selectedCourse.courseCode,
            courseCategory: selectedCourse.courseCategory,
            coursePrice: String(selectedCourse.coursePrice),
            courseDuration: selectedCourse.courseDuration,
            courseDescription: selectedCourse.courseDescription,
            instructor: selectedCourse.instructor ?? "",
            maxStudents: String(selectedCourse.maxStudents ?? 30),
            courseHighlights: (selectedCourse.courseHighlights ?? []).join("\n"),
            courseLearnContent: (selectedCourse.courseLearnContent ?? []).join("\n"),
            courseSchedule: (selectedCourse.courseSchedule ?? [])
                .map((s) => `${s.dayNumber}|${s.day}|${s.topic}|${s.content.join(";")}`)
                .join("\n"),
            courseStatus: selectedCourse.courseStatus
        });
    }, [isEdit, selectedCourse]);

    const formInput = [
        { id: 1, label: "Course Name", labelFor: "courseName", placeholder: "Enter the course name", name: "courseName", required: true, type: "text", isDropDown: false, icon: GraduationCap, onChange: handleOnchange, value: formData.courseName },
        { id: 2, label: "Course Code", labelFor: "courseCode", placeholder: "e.g. CRS-PILOT-01", name: "courseCode", required: true, type: "text", isDropDown: false, icon: GraduationCap, onChange: handleOnchange, value: formData.courseCode },
        {
            id: 3, label: "Category", labelFor: "courseCategory", placeholder: "Select the course category", name: "courseCategory", required: true, type: "text", isDropDown: true, icon: ChartBarStacked,
            options: [
                { label: "Pilot Training", value: "Pilot Training" },
                { label: "Survey", value: "Survey" },
                { label: "Maintenance", value: "Maintenance" },
                { label: "Agriculture", value: "Agriculture" },
                { label: "Photography", value: "Photography" },
                { label: "Inspection", value: "Inspection" }
            ],
            onChange: handleOnchange, value: formData.courseCategory
        },
        { id: 4, label: "Duration", labelFor: "courseDuration", placeholder: "e.g. 4 Weeks", name: "courseDuration", required: true, type: "text", isDropDown: false, icon: Clock, onChange: handleOnchange, value: formData.courseDuration },
        { id: 5, label: "Price", labelFor: "coursePrice", placeholder: "Enter the price of the course", name: "coursePrice", required: true, type: "number", isDropDown: false, icon: IndianRupee, onChange: handleOnchange, value: formData.coursePrice },
        { id: 6, label: "Max Students", labelFor: "maxStudents", placeholder: "Enter max student capacity", name: "maxStudents", required: false, type: "number", isDropDown: false, icon: GraduationCap, onChange: handleOnchange, value: formData.maxStudents },
        { id: 7, label: "Instructor", labelFor: "instructor", placeholder: "Enter instructor name", name: "instructor", required: false, type: "text", isDropDown: false, icon: GraduationCap, onChange: handleOnchange, value: formData.instructor },
        { id: 8, label: "Description", labelFor: "courseDescription", placeholder: "Enter the description of course", name: "courseDescription", required: true, type: "textarea", isDropDown: false, icon: Text, onChange: handleOnchange, value: formData.courseDescription },
        { id: 9, label: "Highlights (one per line)", labelFor: "courseHighlights", placeholder: "e.g. Hands-on flying\nCertification", name: "courseHighlights", required: true, type: "textarea", isDropDown: false, icon: Text, onChange: handleOnchange, value: formData.courseHighlights },
        { id: 10, label: "What you'll learn (one per line)", labelFor: "courseLearnContent", placeholder: "e.g. Basic controls\nSafety rules", name: "courseLearnContent", required: true, type: "textarea", isDropDown: false, icon: Text, onChange: handleOnchange, value: formData.courseLearnContent },
        {
            id: 11, label: "Day-wise Schedule", labelFor: "courseSchedule",
            placeholder: "One day per line: DayNumber|Day Label|Topic|Content1;Content2\ne.g. 1|Day 1|Introduction|Overview;Safety basics",
            name: "courseSchedule", required: true, type: "textarea", isDropDown: false, icon: TextAlignCenterIcon, onChange: handleOnchange, value: formData.courseSchedule
        },
        {
            id: 12, label: "Status", labelFor: "courseStatus", placeholder: "Select the course status", name: "courseStatus", required: true, type: "text", isDropDown: true, icon: ChartBarStacked,
            options: [
                { label: "ACTIVE", value: "ACTIVE" },
                { label: "INACTIVE", value: "INACTIVE" },
                { label: "COMING SOON", value: "COMING_SOON" },
                { label: "COMPLETED", value: "COMPLETED" },
                { label: "ARCHIVED", value: "ARCHIVED" },
            ],
            onChange: handleOnchange, value: formData.courseStatus
        },
        { id: 13, label: "Course Image", labelFor: "courseImage", placeholder: "Upload the course image", name: "courseImage", required: !isEdit, type: "file", isDropDown: false, icon: Image, onChange: handleOnchange, value: "", accept: "image/*" },
        { id: 14, label: "Media (videos/extra images)", labelFor: "media", placeholder: "Upload media files", name: "media", required: false, type: "file", isDropDown: false, icon: Image, onChange: handleOnchange, value: "", multiple: true, accept: "image/*,video/*" },
    ];

    return (
        <main className="space-y-4">
            <section className="flex items-start space-x-4">
                <ArrowLeft className="hover:cursor-pointer dark:text-white" onClick={() => navigate(-1)} />
                <BreadCrump title={isEdit ? "Edit Course" : "Add New Course"} breadCrumpActive options={breadCrumpOptions} />
            </section>
            <section>
                <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-gray-300 bg-white p-4 dark:bg-gray-900 dark:border-gray-700">
                    <header className="text-lg font-semibold dark:text-white">{isEdit ? "Edit Course" : "Add New Course"}</header>
                    {error && <p className="text-red-500">{error}</p>}
                    <section className="space-y-4 rounded-md border border-gray-300 dark:border-gray-700 p-4 shadow-xl">
                        {formInput.map((value) => (
                            <div key={value.id}>
                                <AllInputFields
                                    name={value.name}
                                    value={value.value}
                                    icon={value.icon}
                                    label={value.label}
                                    labelFor={value.labelFor}
                                    placeholder={value.placeholder}
                                    isDropDown={value.isDropDown}
                                    required={value.required}
                                    type={value.type}
                                    multiple={value.multiple}
                                    accept={value.accept}
                                    options={value.options}
                                    inputRef={value.name === "courseImage" ? imageInputRef : undefined}
                                    onChange={value.onChange}
                                />
                            </div>
                        ))}

                        {courseImage && (
                            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                                <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-200">Selected image</p>
                                <img src={courseImage.previewUrl} alt="preview" className="h-40 w-full rounded-lg object-cover sm:w-80" />
                            </div>
                        )}
                        {isEdit && !courseImage && selectedCourse?.courseImage && (
                            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                                <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-200">Current image</p>
                                <img src={selectedCourse.courseImage} alt={selectedCourse.courseName} className="h-40 w-full rounded-lg object-cover sm:w-80" />
                            </div>
                        )}
                    </section>
                    <section className="flex item-end justify-end">
                        <Button buttonText={submitting ? "Saving..." : isEdit ? "Update" : "Create"} varient="primary" icon={Save} type="submit" />
                    </section>
                </form>
            </section>
        </main>
    );
}