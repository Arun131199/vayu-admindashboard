import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import BreadCrump from "../../../component/BreadCrump/BreadCrump";
import AllInputFields from "../../../component/AllInputFields/AllInputFields";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "../../../component/Buttons/Button";
import ConfirmationPopup from "../../../component/Popup/ConfirmationPopup";
import {
    createProject,
    updateProject,
    getProjectById,
    type ProjectCategory,
    type ProjectStatus,
    type MilestoneStatus,
} from "../../../service/projectApi";

const categoryOptions = [
    { label: "Agriculture", value: "AGRICULTURE" },
    { label: "Surveying", value: "SURVEYING" },
    { label: "Photography", value: "PHOTOGRAPHY" },
    { label: "Inspection", value: "INSPECTION" },
    { label: "Training", value: "TRAINING" },
    { label: "Research", value: "RESEARCH" },
];

const statusOptions = [
    { label: "Planning", value: "PLANNING" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Completed", value: "COMPLETED" },
    { label: "On Hold", value: "ON_HOLD" },
    { label: "Cancelled", value: "CANCELLED" },
];

const milestoneStatusOptions = [
    { label: "Pending", value: "PENDING" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Completed", value: "COMPLETED" },
];

type MilestoneForm = {
    title: string;
    status: MilestoneStatus;
    date: string;
};

export default function AddClient() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const state = location?.state;

    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        project_name: "",
        client_name: "",
        category: "",
        status: "PLANNING",
        budget: "",
        progress: "0",
        team_members: "",
        start_date: "",
        end_date: "",
        description: "",
        deliverables: "",
        company: "",
        contactPerson: "",
        phone: "",
        email: ""
    });

    const [milestones, setMilestones] = useState<MilestoneForm[]>([]);

    const [openConformation, setOpenConfirmation] = useState(false);
    const [openSuccess, setOpenSuccess] = useState(false);
    const [openError, setOpenError] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");

    const hydrate = (p: any) => {
        setFormData({
            project_name: p?.projectName || "",
            client_name: p?.client?.company || "",
            category: p?.category || "",
            status: p?.status || "PLANNING",
            budget: p?.budget != null ? String(p.budget) : "",
            progress: p?.progress != null ? String(p.progress) : "0",
            team_members: (p?.teamMembers || []).map((m: any) => m.name).join(", "),
            start_date: p?.startDate || "",
            end_date: p?.endDate || "",
            description: p?.description || "",
            deliverables: (p?.deliverables || []).join(", "),
            company: p?.client?.company || "",
            contactPerson: p?.client?.contactPerson || "",
            phone: p?.client?.phone || "",
            email: p?.client?.email || ""
        });
        setMilestones(
            (p?.milestones || []).map((m: any) => ({
                title: m.title || "",
                status: m.status || "PENDING",
                date: m.date || "",
            }))
        );
    };

    useEffect(() => {
        if (!isEditMode || !id) return;
        if (state) {
            hydrate(state);
        } else {
            getProjectById(Number(id)).then((p) => {
                if (p) hydrate(p);
            });
        }
    }, [isEditMode, id]);

    const addMilestoneRow = () => {
        setMilestones([...milestones, { title: "", status: "PENDING", date: "" }]);
    };

    const removeMilestoneRow = (index: number) => {
        setMilestones(milestones.filter((_, i) => i !== index));
    };

    const updateMilestoneRow = (index: number, field: keyof MilestoneForm, value: string) => {
        setMilestones(
            milestones.map((m, i) => (i === index ? { ...m, [field]: value } : m))
        );
    };

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData.project_name.trim()) newErrors.project_name = "Project name is required";
        if (!formData.category.trim()) newErrors.category = "Category is required";
        if (!formData.budget.trim() || isNaN(Number(formData.budget))) newErrors.budget = "Valid budget is required";
        if (!formData.start_date.trim()) newErrors.start_date = "Start date is required";
        if (!formData.end_date.trim()) newErrors.end_date = "End date is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.company.trim()) newErrors.company = "Company is required";
        if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact person is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }
        if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
        if (formData.progress.trim() !== "" && (Number(formData.progress) < 0 || Number(formData.progress) > 100)) {
            newErrors.progress = "Progress must be between 0 and 100";
        }
        if (formData.start_date.trim() && formData.end_date.trim() && formData.end_date < formData.start_date) {
            newErrors.end_date = "End date cannot be before start date";
        }
        if (milestones.some((m) => !m.title.trim())) {
            newErrors.milestones = "Every milestone needs a title (or remove the empty row)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        setApiError("");
        if (!validateForm()) {
            setOpenError(true);
            return;
        }

        const payload = {
            projectName: formData.project_name,
            description: formData.description,
            location: formData.client_name || formData.company,
            category: formData.category as ProjectCategory,
            status: formData.status as ProjectStatus,
            budget: Number(formData.budget),
            startDate: formData.start_date,
            endDate: formData.end_date,
            progress: Number(formData.progress) || 0,
            client: {
                company: formData.company,
                contactPerson: formData.contactPerson,
                phone: formData.phone,
                email: formData.email,
            },
            deliverables: formData.deliverables
                ? formData.deliverables.split(",").map((d) => d.trim()).filter(Boolean)
                : [],
            teamMembers: formData.team_members
                ? formData.team_members.split(",").map((name) => ({ name: name.trim(), role: "Team Member" })).filter((m) => m.name)
                : [],
            milestones: milestones
                .filter((m) => m.title.trim())
                .map((m) => ({
                    title: m.title.trim(),
                    status: m.status,
                    date: m.date || "",
                })),
        };

        setSubmitting(true);
        try {
            if (isEditMode && id) {
                await updateProject(Number(id), payload);
            } else {
                await createProject(payload);
            }
            setOpenSuccess(true);
        } catch (err: any) {
            setApiError(err?.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="space-y-4">
            <section className="flex items-start gap-4">
                <ArrowLeft className="cursor-pointer dark:text-white" onClick={() => navigate(-1)} />
                <BreadCrump
                    title={isEditMode ? "Edit Project" : "Add New Project"}
                    subtitles={isEditMode ? "Update project details" : "Create a new project"}
                />
            </section>
            <section className="bg-white  dark:bg-gray-900 rounded-lg p-4 shadow-xl space-y-4">
                {apiError && <p className="text-red-500 text-sm">{apiError}</p>}
                <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <AllInputFields
                            label="Project Name"
                            labelFor="project_name"
                            name="project_name"
                            value={formData.project_name}
                            onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                            placeholder="e.g, Agricultural Survey Project"
                            required={true}
                            error={errors.project_name}
                        />
                        <AllInputFields
                            label="Location"
                            labelFor="location"
                            name="location"
                            value={formData.client_name}
                            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                            placeholder="e.g, Coimbatore, Tamil Nadu"
                            required={false}
                        />
                        <AllInputFields
                            label="Category"
                            labelFor="category"
                            name="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            isDropDown={true}
                            options={categoryOptions}
                            required={true}
                            error={errors.category}
                        />
                        <AllInputFields
                            label="Status"
                            labelFor="status"
                            name="status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            isDropDown={true}
                            options={statusOptions}
                            required={true}
                        />
                        <AllInputFields
                            label="Budget"
                            labelFor="budget"
                            name="budget"
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                            value={formData.budget}
                            placeholder="e.g., 245000"
                            required={true}
                            type="number"
                            error={errors.budget}
                        />
                        <AllInputFields
                            label="Progress (%)"
                            labelFor="progress"
                            name="progress"
                            onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                            value={formData.progress}
                            placeholder="0"
                            type="number"
                            error={errors.progress}
                        />
                        <AllInputFields
                            label="Team Members"
                            labelFor="team_members"
                            name="team_members"
                            onChange={(e) => setFormData({ ...formData, team_members: e.target.value })}
                            value={formData.team_members}
                            placeholder="e.g., Arun, John, Jane"
                            type="text"
                        />
                        <AllInputFields
                            label="Start Date"
                            labelFor="start_date"
                            name="start_date"
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            value={formData.start_date}
                            required={true}
                            type="date"
                            error={errors.start_date}
                        />
                        <AllInputFields
                            label="End Date"
                            labelFor="end_date"
                            name="end_date"
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            value={formData.end_date}
                            required={true}
                            type="date"
                            error={errors.end_date}
                        />
                    </div>
                    <div>
                        <AllInputFields
                            label="Description"
                            labelFor="description"
                            name="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter project description here"
                            required={true}
                            type="textarea"
                            error={errors.description}
                        />
                        <AllInputFields
                            label="Deliverables"
                            labelFor="deliverables"
                            name="deliverables"
                            value={formData.deliverables}
                            onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                            placeholder="eg., Crop health analysis report, 3D terrain modeling"
                            type="textarea"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-lg font-semibold dark:text-white">Milestones</p>
                            <Button
                                buttonText="Add Milestone"
                                icon={Plus}
                                varient="secondary"
                                onClick={addMilestoneRow}
                            />
                        </div>
                        {errors.milestones && <p className="text-red-500 text-sm">{errors.milestones}</p>}
                        {milestones.length === 0 && (
                            <p className="text-gray-500 text-sm">No milestones added yet. Click "Add Milestone" to add one.</p>
                        )}
                        <div className="space-y-3">
                            {milestones.map((m, index) => (
                                <div key={index} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 items-end border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                    <AllInputFields
                                        label="Title"
                                        labelFor={`milestone_title_${index}`}
                                        name={`milestone_title_${index}`}
                                        value={m.title}
                                        onChange={(e) => updateMilestoneRow(index, "title", e.target.value)}
                                        placeholder="e.g., Initial Site Survey"
                                    />
                                    <AllInputFields
                                        label="Status"
                                        labelFor={`milestone_status_${index}`}
                                        name={`milestone_status_${index}`}
                                        value={m.status}
                                        onChange={(e) => updateMilestoneRow(index, "status", e.target.value)}
                                        isDropDown={true}
                                        options={milestoneStatusOptions}
                                    />
                                    <AllInputFields
                                        label="Date"
                                        labelFor={`milestone_date_${index}`}
                                        name={`milestone_date_${index}`}
                                        value={m.date}
                                        onChange={(e) => updateMilestoneRow(index, "date", e.target.value)}
                                        type="date"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeMilestoneRow(index)}
                                        className="mb-2 text-red-500 hover:text-red-700 p-2"
                                        title="Remove milestone"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-lg font-semibold dark:text-white">Contact Info</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <AllInputFields
                                label="Company"
                                labelFor="company"
                                name="company"
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                value={formData.company}
                                placeholder="Enter the client company name"
                                required={true}
                                type="text"
                                error={errors.company}
                            />
                            <AllInputFields
                                label="Contact Person"
                                labelFor="contactPerson"
                                name="contactPerson"
                                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                value={formData.contactPerson}
                                placeholder="Enter the contact person name"
                                required={true}
                                type="text"
                                error={errors.contactPerson}
                            />
                            <AllInputFields
                                label="Email"
                                labelFor="email"
                                name="email"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                value={formData.email}
                                placeholder="Enter the contact person email"
                                required={true}
                                type="text"
                                error={errors.email}
                            />
                            <AllInputFields
                                label="Phone Number"
                                labelFor="phone"
                                name="phone"
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                value={formData.phone}
                                placeholder="Enter the contact person phone number"
                                required={true}
                                type="text"
                                error={errors.phone}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 justify-end">
                        <Button
                            buttonText="Cancel"
                            onClick={() => setOpenConfirmation(true)}
                        />
                        <Button
                            buttonText={submitting ? "Saving..." : (isEditMode ? "Update" : "Create")}
                            onClick={handleSubmit}
                        />
                    </div>
                </form>
            </section>
            {
                openConformation && (
                    <ConfirmationPopup
                        open={openConformation}
                        message="Are you sure want to go back without saving?"
                        title="Confirmation"
                        onConfirm={() => {
                            setOpenConfirmation(false);
                            navigate(-1)
                        }}
                        onClose={() => setOpenConfirmation(false)}
                    />
                )
            }
            {
                openSuccess && (
                    <ConfirmationPopup
                        open={openSuccess}
                        message={isEditMode ? "Project updated successfully" : "Project added successfully"}
                        title="Success"
                        type="success"
                        onConfirm={() => {
                            setOpenSuccess(false)
                            navigate(-1)
                        }}
                        onClose={() => setOpenSuccess(false)}
                    />
                )
            }
            {
                openError && (
                    <ConfirmationPopup
                        open={openError}
                        message="Please fill in all required fields correctly"
                        title="Validation Error"
                        type="danger"
                        onConfirm={() => {
                            setOpenError(false)
                        }}
                        onClose={() => setOpenError(false)}
                    />
                )
            }
        </main>
    )
}