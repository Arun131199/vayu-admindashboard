import { ArrowLeft, Building, Calendar, Calendar1, IndianRupee, UsersRound } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import BreadCrump from "../../../component/BreadCrump/BreadCrump";
import { getProjectById, type ProjectRow } from "../../../service/projectApi";

const statusBadgeClass: Record<string, string> = {
    COMPLETED: "bg-green-200 text-green-600",
    IN_PROGRESS: "bg-blue-100 text-blue-600",
    CANCELLED: "bg-red-100 text-red-600",
    ON_HOLD: "bg-orange-100 text-orange-600",
    PLANNING: "bg-yellow-100 text-yellow-600",
};

const statusTextClass: Record<string, string> = {
    COMPLETED: "text-green-600",
    IN_PROGRESS: "text-blue-600",
    CANCELLED: "text-red-600",
    ON_HOLD: "text-orange-600",
    PLANNING: "text-yellow-600",
};

const statusBarClass: Record<string, string> = {
    COMPLETED: "bg-green-500",
    IN_PROGRESS: "bg-blue-500",
    CANCELLED: "bg-red-500",
    ON_HOLD: "bg-orange-500",
    PLANNING: "bg-yellow-500",
};

export default function ViewProject() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const stateProject = location?.state as ProjectRow | undefined;

    const [project, setProject] = useState<ProjectRow | undefined>(stateProject);
    const [loading, setLoading] = useState(!stateProject);

    useEffect(() => {
        if (stateProject || !id) return;
        setLoading(true);
        getProjectById(Number(id))
            .then((p) => setProject(p ?? undefined))
            .finally(() => setLoading(false));
    }, [id, stateProject]);

    if (loading) {
        return <main className="p-6 text-gray-500">Loading project...</main>;
    }

    if (!project) {
        return <main className="p-6 text-gray-500">Project not found.</main>;
    }

    return (
        <main className="space-y-4">
            <section className="flex items-start gap-4">
                <ArrowLeft className="cursor-pointer dark:text-white" onClick={() => navigate(-1)} />
                <BreadCrump
                    title="Projects & Clients"
                    subtitles="Manage your client projects and relationships"
                />
            </section>
            <section className="border border-gray-300 dark:border-gray-700 bg-white shadow-xl
             dark:bg-gray-900 rounded-xl p-6">
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-4">
                        <span className={`px-4 py-1 rounded-lg text-md ${statusBadgeClass[project.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {project.status}
                        </span>
                        <p className="text-gray-500 text-md">
                            {project.category}
                        </p>
                    </div>
                    <div className="text-right">
                        <h2 className={`text-lg font-bold ${statusTextClass[project.status] ?? "text-gray-600"}`}>
                            {project.progress}%
                        </h2>
                        <p className="text-gray-500">
                            Complete
                        </p>
                    </div>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${statusBarClass[project.status] ?? "bg-gray-500"}`}
                        style={{ width: `${project.progress}%` }}
                    />
                </div>
            </section>
            <section className="grid grid-cols-2 gap-4">
                <section className="space-y-4">
                    <div className="border border-gray-300 dark:border-gray-700 shadow-xl p-4
                bg-white dark:bg-gray-900 rounded-xl space-y-4">
                        <div>
                            <p className="text-lg font-semibold dark:text-white">Project Details</p>
                        </div>

                        <div className="border-b border-gray-300 dark:border-gray-700 pb-4">
                            <span className="text-md text-gray-600">Description</span>
                            <p className="indent-3 dark:text-white">{project.description}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                <span className="text-gray-500">
                                    <Calendar />
                                </span>
                                <p className="flex flex-col">
                                    <span className="text-gray-500">Start Date</span>
                                    <span className="dark:text-white">{project.startDate}</span>
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <span className="text-gray-500">
                                    <Calendar1 />
                                </span>
                                <p className="flex flex-col">
                                    <span className="text-gray-500">End Date</span>
                                    <span className="dark:text-white">{project.endDate}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-start gap-4">
                            <span className="text-gray-500"><IndianRupee /></span>
                            <p className="flex flex-col ">
                                <span className="text-gray-500">Budget</span>
                                <span className={`${statusTextClass[project.status] ?? "text-gray-600"} text-lg font-semibold`}>
                                    ₹{project.budget?.toLocaleString("en-IN")}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="border border-gray-300 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl ">
                        <div>
                            <p className="text-lg font-semibold dark:text-white">Deliverables</p>
                            <div className="px-8 py-1">
                                {
                                    (project.deliverables || []).map((value, index) => (
                                        <div key={index}>
                                            <li className="py-1 list-disc marker:text-yellow-500">
                                                <p className="dark:text-white">{value}</p>
                                            </li>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-xl space-y-4">
                        <p className="text-lg font-semibold dark:text-white">Project Milestones</p>
                        <div>
                            {
                                (project.milestones || []).map((value, index) => (
                                    <div key={index} className="flex items-start justify-between space-y-4">
                                        <div className="flex items-center justify-center gap-4">
                                            <div className={`${value.status === "COMPLETED" ? "bg-green-500 "
                                                : value.status === "IN_PROGRESS" ? "bg-blue-500 "
                                                    : "bg-gray-500 "} rounded-full h-4 w-4`}></div>
                                            <div>
                                                <p className="text-md font-semibold dark:text-white">{value.title}</p>
                                                <p className="text-gray-500">{value.date}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className={`px-6 py-0.5 shadow-xl rounded-full font-semibold ${value.status === "COMPLETED" ? "bg-green-200 text-green-600"
                                                : value.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-600"
                                                    : "text-gray-700 bg-gray-400"}`}>{value.status}</p>
                                        </div>
                                    </div>
                                ))
                            }
                            {(!project.milestones || project.milestones.length === 0) && (
                                <p className="text-gray-500 text-sm">No milestones added yet.</p>
                            )}
                        </div>
                    </div>
                </section>
                <section className="space-y-4">
                    <div className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-xl space-y-4">
                        <div>
                            <p className="text-lg font-semibold dark:text-white">Client Information</p>
                        </div>
                        <div className="space-y-4 border-b pb-4 border-gray-300 dark:border-gray-700">
                            <div className="flex item-start gap-4">
                                <span className="text-gray-500"><Building /></span>
                                <p className="flex flex-col">
                                    <span className="text-gray-500 dark:text-white">Company</span>
                                    <span className="font-semibold dark:text-white">{project.client?.company}</span>
                                </p>
                            </div>
                            <div className="flex item-start gap-4">
                                <span className="text-gray-500"><UsersRound /></span>
                                <p className="flex flex-col">
                                    <span className="text-gray-500 dark:text-white">Contact Person</span>
                                    <span className="font-semibold dark:text-white">{project.client?.contactPerson}</span>
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-500 dark:text-white">{project.client?.email}</p>
                            <p className="text-gray-500 dark:text-white">{project.client?.phone}</p>
                        </div>
                    </div>
                    <div className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-xl space-y-4">
                        <p className="font-semibold text-lg dark:text-white">Team Members</p>
                        <div className="">
                            {
                                (project.teamMembers || []).map((value, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300"
                                    >
                                        <div
                                            className="flex items-center justify-center
                    min-w-12 h-12 rounded-full
                    bg-gradient-to-br from-yellow-400 to-orange-500
                    text-white font-bold text-sm shadow-lg"
                                        >
                                            {value?.initials || value?.name?.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800 dark:text-white text-md">
                                                {value?.name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {value?.role}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            }
                            {(!project.teamMembers || project.teamMembers.length === 0) && (
                                <p className="text-gray-500 text-sm">No team members added yet.</p>
                            )}
                        </div>
                    </div>
                </section>
            </section>
        </main>
    )
}