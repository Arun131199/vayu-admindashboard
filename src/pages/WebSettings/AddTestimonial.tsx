import { ArrowLeft } from "lucide-react";
import BreadCrump from "../../component/BreadCrump/BreadCrump";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AllInputFields from "../../component/AllInputFields/AllInputFields";
import { useState, useEffect } from "react";
import Button from "../../component/Buttons/Button";
import ConfirmationPopup from "../../component/Popup/ConfirmationPopup";

import { createTestimonial, updateTestimonial } from "../../service/testimonialApi";
import { toast } from "sonner";

export default function AddTestimonial() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customer_name: "",
        role: "",
        company: "",
        rating: "",
        status: "Published",
        photo_url: "",
        testimonial: "",
        isFeatures: false
    })

    const [confirmation, setConfirmation] = useState(false)
    const [success, setSuccess] = useState(false);

    const { id } = useParams();
    const isEdited = Boolean(id);
    const location = useLocation();
    const state = location?.state;

    const handleSubmit = async () => {
        if (!formData.customer_name.trim() || !formData.testimonial.trim() || !formData.rating) {
            toast.error("Please fill in all required fields");
            return;
        }

        const payload = {
            authorName: formData.customer_name,
            authorPhotoUrl: formData.photo_url || undefined,
            rating: Number(formData.rating),
            text: formData.testimonial,
            isVisible: formData.status !== "Draft",
        };

        try {
            const res = isEdited
                ? await updateTestimonial(Number(id), payload)
                : await createTestimonial(payload);

            if (res?.success) {
                setSuccess(true);
            } else {
                toast.error(res?.message || "Failed to save testimonial");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to save testimonial");
        }
    };

    useEffect(() => {
        if (isEdited && state) {
            setFormData({
                customer_name: state.authorName || state.customer_name || "",
                role: state.role || "",
                company: state.company || "",
                rating: String(state.rating || ""),
                status: state.status || (state.isVisible ? "Published" : "Draft"),
                photo_url: state.authorPhotoUrl || state.photo_url || "",
                testimonial: state.text || state.testimonial || "",
                isFeatures: state.isFeatured || false
            });
        }
    }, [isEdited, state]);
    return (
        <main className="space-y-4">
            <section className="flex items-start gap-4">
                <ArrowLeft className="cursor-pointer dark:text-white" onClick={() => navigate(-1)} />
                <BreadCrump
                    title={isEdited ? "Edit Testimonial" : "Add New Testimonial"}
                    subtitles={isEdited ? "Update customer testimonial details" : "Create a new customer testimonial"}
                />
            </section>
            <section className="border border-gray-200 dark:border-gray-800 rounded-lg bg-white p-4 shadow-xl dark:bg-gray-900 space-y-4">
                <p className="dark:text-white font-semibold text-lg">Testimonial Information</p>
                <form action="" className="space-y-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
                        <AllInputFields
                            label="Customer Name"
                            labelFor="customer_name"
                            name="customer_name"
                            type="text"
                            value={formData.customer_name}
                            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                            placeholder="e.g, Rajesh Sharma"
                            required={true}
                        />
                        <AllInputFields
                            label="Role/Title"
                            labelFor="role"
                            name="role"
                            type="text"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            placeholder="e.g, CEO"
                            required={true}
                        />
                        <AllInputFields
                            label="Company/Organization"
                            labelFor="company"
                            name="company"
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            placeholder="e.g, Vayuratha Private Limited"
                            required={true}
                        />
                        <AllInputFields
                            label="Rating"
                            labelFor="rating"
                            name="rating"
                            value={formData.rating}
                            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                            placeholder="e.g, Vayuratha Private Limited"
                            required={true}
                            isDropDown={true}
                            options={[
                                { label: "5 Star", value: "5" },
                                { label: "4 Star", value: "4" },
                                { label: "3 Star", value: "3" },
                                { label: "2 Star", value: "2" },
                                { label: "1 Star", value: "1" }
                            ]}
                        />
                        <AllInputFields
                            label="Status"
                            labelFor="status"
                            name="status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            required={true}
                            isDropDown={isEdited}
                            options={isEdited ? [
                                { label: "Published", value: "Published" },
                                { label: "Pending", value: "Pending" },
                                { label: "Draft", value: "Draft" }
                            ] : undefined}
                            type={isEdited ? "select" : "text"}
                        />
                        <AllInputFields
                            label="Avatar/Profile Picture URL"
                            labelFor="photo_url"
                            name="photo_url"
                            type="text"
                            value={formData.photo_url}
                            onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                            placeholder="https://... (optional)"
                            required={false}
                        />
                    </div>
                    <div>
                        <AllInputFields
                            label="Testimonial"
                            labelFor="testimonial"
                            name="testimonial"
                            type="textarea"
                            value={formData.testimonial}
                            onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                            required={true}
                            placeholder="Enter the customer's Testimonial. . . . ."
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="checkbox"
                            className="w-5 h-5 cursor-pointer accent-yellow-500"
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    isFeatures: e.target.checked
                                })
                            }
                            checked={formData.isFeatures}
                            id="isFeatures"
                        />
                        <label htmlFor="isFeatures" className="font-semibold">Featured Testimonial</label>
                    </div>
                    <div className="flex items-center justify-end gap-4">
                        <Button
                            buttonText="Cancle"
                            onClick={() => setConfirmation(true)}
                        />
                        <Button
                            buttonText={isEdited ? "Update" : "Create"}
                            onClick={handleSubmit}
                        />
                    </div>
                </form>
            </section>

            {
                confirmation && (
                    <ConfirmationPopup
                        open={confirmation}
                        type="warning"
                        title={isEdited ? "Update Testimonial" : "Create Testimonial"}
                        message={isEdited ? "Are you sure want to go back without updating this testimonial?" : "Are you sure want to go back with creating this testimonial?"}
                        onClose={() => setConfirmation(false)}
                        onConfirm={() => {
                            setConfirmation(false)
                            navigate(-1)
                        }}
                    />
                )
            }
            {
                success && (
                    <ConfirmationPopup
                        open={success}
                        type="success"
                        title={isEdited ? "Update Testimonial" : "Create Testimonial"}
                        message={isEdited ? "The Testimonial has been updated successfully." : "The Testimonial has been created successfully."}
                        onClose={() => setSuccess(false)}
                        onConfirm={() => {
                            setSuccess(false)
                            navigate(-1)
                        }}
                    />
                )
            }
        </main>
    )
}