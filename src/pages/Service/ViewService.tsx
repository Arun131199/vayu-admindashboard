import { ArrowLeft, CalendarDays, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import BreadCrump from "../../component/BreadCrump/BreadCrump";
import Button from "../../component/Buttons/Button";
import { getServiceById, type ServiceRow } from "./../../service/serviceApi";
import { useAuth } from "../../context/AuthContext";

export default function ViewService() {
    const navigate = useNavigate();
    const { serviceId } = useParams();
    const location = useLocation();
    const { permissions } = useAuth();
    const canUpdate = permissions?.includes("SERVICE_UPDATE");

    const [service, setService] = useState<ServiceRow | null>((location.state as ServiceRow) ?? null);
    const [loading, setLoading] = useState(!location.state);

    useEffect(() => {
        if (location.state || !serviceId) return;
        (async () => {
            setLoading(true);
            const data = await getServiceById(serviceId);
            setService(data);
            setLoading(false);
        })();
    }, [serviceId, location.state]);

    if (loading) {
        return <p>Loading service...</p>;
    }

    if (!service) {
        return (
            <main className="space-y-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 font-semibold text-gray-700 dark:text-white"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>
                <section className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-xl dark:border-gray-700 dark:bg-gray-900">
                    <p className="font-semibold text-gray-800 dark:text-white">Service not found</p>
                </section>
            </main>
        );
    }

    return (
        <main className="space-y-4">
            <section className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <ArrowLeft className="cursor-pointer dark:text-white" onClick={() => navigate(-1)} />
                    <BreadCrump
                        title="View Service"
                        subtitles="Review service details"
                    />
                </div>
                {canUpdate && (
                    <Button
                        buttonText="Edit Service"
                        icon={Pencil}
                        varient="primary"
                        onClick={() => navigate(`../edit-service/${service.id}`, { state: service })}
                    />
                )}
            </section>

            <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                {service.serviceImage && (
                    <img
                        src={service.serviceImage}
                        alt={service.serviceName}
                        className="h-72 w-full object-cover"
                    />
                )}
                <div className="space-y-6 p-5">
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{service.serviceName}</p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{service.serviceId}</p>
                    </div>

                    <p className="max-w-4xl text-gray-600 dark:text-gray-300">{service.aboutService}</p>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <p className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Use Cases</p>
                            <ul className="list-disc pl-4 text-gray-800 dark:text-white">
                                {service.useCases?.map((u, i) => <li key={i}>{u}</li>)}
                            </ul>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <p className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Traditional Specification</p>
                            <ul className="list-disc pl-4 text-gray-800 dark:text-white">
                                {service.traditionalSpecific?.map((u, i) => <li key={i}>{u}</li>)}
                            </ul>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <p className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Drone Specification</p>
                            <ul className="list-disc pl-4 text-gray-800 dark:text-white">
                                {service.droneSpecific?.map((u, i) => <li key={i}>{u}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <CalendarDays size={16} />
                        Created: {service.createdAt?.slice(0, 10)}
                    </div>
                </div>
            </section>
        </main>
    );
}