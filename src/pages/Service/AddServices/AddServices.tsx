import { ArrowLeft, GraduationCap, Image, SquareStack, Tag, Text } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AllInputFields from "../../../component/AllInputFields/AllInputFields";
import Button from "../../../component/Buttons/Button";
import { createService, updateService, type ServiceRow } from "../../../service/serviceApi";

type AddServiceFormData = {
    serviceName: string;
    serviceId: string;
    category: string;
    aboutService: string;
    useCases: string;
    traditionalSpecific: string;
    droneSpecific: string;
};

export default function AddServices() {
    const navigate = useNavigate();
    const { serviceId: routeServiceId } = useParams();
    const location = useLocation();
    const isEdit = Boolean(routeServiceId);
    const selectedService = (location.state as ServiceRow | undefined) ?? null;

    const [formData, setFormData] = useState<AddServiceFormData>({
        serviceName: "",
        serviceId: "",
        category: "",
        aboutService: "",
        useCases: "",
        traditionalSpecific: "",
        droneSpecific: "",
    });
    const [serviceImage, setServiceImage] = useState<File | null>(null);
    const [photos, setPhotos] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOnchange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const payload = {
            serviceName: formData.serviceName,
            serviceId: formData.serviceId,
            category: formData.category || undefined,
            aboutService: formData.aboutService,
            useCases: formData.useCases.split("\n").map((s) => s.trim()).filter(Boolean),
            traditionalSpecific: formData.traditionalSpecific.split("\n").map((s) => s.trim()).filter(Boolean),
            droneSpecific: formData.droneSpecific.split("\n").map((s) => s.trim()).filter(Boolean),
        };

        try {
            if (isEdit && selectedService) {
                await updateService(String(selectedService.id), payload, serviceImage, photos);
            } else {
                await createService(payload, serviceImage, photos);
            }
            navigate(-1);
        } catch (err) {
            console.error(err);
            setError("Failed to save service. Please check the fields and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (!isEdit || !selectedService) return;

        setFormData({
            serviceName: selectedService.serviceName,
            serviceId: selectedService.serviceId,
            category: selectedService.category ?? "",
            aboutService: selectedService.aboutService,
            useCases: (selectedService.useCases ?? []).join("\n"),
            traditionalSpecific: (selectedService.traditionalSpecific ?? []).join("\n"),
            droneSpecific: (selectedService.droneSpecific ?? []).join("\n"),
        });
    }, [isEdit, selectedService]);

    const fieldTypes = [
        {
            id: 1, label: "Service Name", labelFor: "serviceName", placeholder: "Enter the service name",
            name: "serviceName", required: true, type: "text", isDropDown: false, icon: GraduationCap,
            onChange: handleOnchange, value: formData.serviceName,
        },
        {
            id: 2, label: "Service ID", labelFor: "serviceId", placeholder: "Enter a unique service ID",
            name: "serviceId", required: true, type: "text", isDropDown: false, icon: SquareStack,
            onChange: handleOnchange, value: formData.serviceId,
        },
        {
            id: 3, label: "Category", labelFor: "category", placeholder: "e.g. Agriculture, Surveillance",
            name: "category", required: false, type: "text", isDropDown: false, icon: Tag,
            onChange: handleOnchange, value: formData.category,
        },
        {
            id: 4, label: "About Service", labelFor: "aboutService", placeholder: "Describe the service (10-2000 chars)",
            name: "aboutService", required: true, type: "textarea", isDropDown: false, icon: Text,
            onChange: handleOnchange, value: formData.aboutService,
        },
        {
            id: 5, label: "Use Cases (one per line)", labelFor: "useCases", placeholder: "e.g. Crop spraying\nSurveillance",
            name: "useCases", required: true, type: "textarea", isDropDown: false, icon: Text,
            onChange: handleOnchange, value: formData.useCases,
        },
        {
            id: 6, label: "Traditional Specification (one per line)", labelFor: "traditionalSpecific", placeholder: "e.g. Manual operation",
            name: "traditionalSpecific", required: true, type: "textarea", isDropDown: false, icon: Text,
            onChange: handleOnchange, value: formData.traditionalSpecific,
        },
        {
            id: 7, label: "Drone Specification (one per line)", labelFor: "droneSpecific", placeholder: "e.g. Autonomous flight",
            name: "droneSpecific", required: true, type: "textarea", isDropDown: false, icon: Text,
            onChange: handleOnchange, value: formData.droneSpecific,
        },
    ];

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") navigate(-1);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [navigate]);

    return (
        <main className="space-y-4">
            <section className="flex space-x-4">
                <button
                    type="button"
                    className="hover:scale-105 dark:text-white transition-transform duration-200 ease-in cursor-pointer"
                    onClick={() => navigate(-1)}
                ><ArrowLeft /></button>
                <p className="text-xl font-semibold dark:text-white">{isEdit ? "Edit Service" : "Add Services"}</p>
            </section>
            <form onSubmit={handleSubmit} className="bg-white shadow-xl space-y-4 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                {error && <p className="text-red-500">{error}</p>}
                <section className="grid grid-cols-2 gap-4">
                    {fieldTypes.map((value) => (
                        <div key={value.id} className={value.type === "textarea" ? "col-span-2" : ""}>
                            <AllInputFields
                                name={value.name}
                                label={value.label}
                                labelFor={value.labelFor}
                                placeholder={value.placeholder}
                                icon={value.icon}
                                type={value.type}
                                isDropDown={value.isDropDown}
                                onChange={value.onChange}
                                value={value.value}
                                required={value.required}
                            />
                        </div>
                    ))}
                </section>

                <section className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                            <Image size={16} className="mr-1 inline" /> Service Image
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => setServiceImage(e.target.files?.[0] ?? null)}
                            className="w-full text-sm dark:text-gray-300"
                        />
                        {isEdit && selectedService?.serviceImage && !serviceImage && (
                            <img src={selectedService.serviceImage} alt="current" className="mt-2 h-32 w-32 rounded-lg object-cover" />
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Photos (up to 10, images or videos)
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/webp,video/mp4,video/avi,video/mov,video/mkv"
                            onChange={(e) => setPhotos(e.target.files ? Array.from(e.target.files) : [])}
                            className="w-full text-sm dark:text-gray-300"
                        />
                    </div>
                </section>

                <section className="flex items-center justify-center">
                    <Button
                        buttonText={submitting ? "Saving..." : isEdit ? "Update Service" : "Submit"}
                        varient="primary"
                        type="submit"
                    />
                </section>
            </form>
        </main>
    );
}