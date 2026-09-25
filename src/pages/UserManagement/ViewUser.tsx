import { useParams, useNavigate, useLocation } from "react-router-dom";
import BreadCrump from "../../component/BreadCrump/BreadCrump";
import { ArrowLeft, ChevronDown, PencilIcon, Shield, Trash2 } from "lucide-react";
import Button from "../../component/Buttons/Button";
import { useState, useEffect } from "react";
import ConfirmationPopup from "../../component/Popup/ConfirmationPopup";
import { getCompanyUserById, deleteCompanyUser, type CompanyUserRow } from "../../service/companyUserApi";
import type { userData } from "./UserManagement";
import { toast } from "sonner";
import axios from "axios";
import SkeletonBlock from "../../component/Skeleton/SkeletonBlock";
import LoginHistoryTable from "../../component/UserManagement/LoginHistoryTable";


export default function ViewUser() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();

    const [userRow, setUserRow] = useState<CompanyUserRow | null>(location?.state ?? null);
    const [loading, setLoading] = useState(!location?.state);
    const [confirmation, setConfirmation] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isOpen, setOpen] = useState<boolean>(false)

    const breadcrumpOptions = [
        {
            id: 1,
            label: "Users",
            onClick: () => navigate(-1),
        },
        {
            id: 2,
            label: "Roles",
        },
    ];
    const userData: userData | null = userRow ? {
        id: String(userRow.id),
        name: userRow.name,
        email: userRow.email,
        role: userRow.roleName,
        status: userRow.active ? "Active" : "Inactive",
        isOnline: userRow.isOnline,   // NEW
        permissions: userRow.permissions.map((p) => ({
            id: p.module,
            module: p.module,
            canImport: String(p.canImport),
            canExport: String(p.canExport),
            canCreate: String(p.canCreate),
            canRead: String(p.canRead),
            canDelete: String(p.canDelete),
        })),
    } : null;


    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await deleteCompanyUser(Number(userData?.id));
            setDeleting(false);
            setConfirmation(false);
            if (res?.success) {
                toast.success(`${userData?.name} has been deleted successfully`)
                setTimeout(() => {
                    navigate(-1);
                }, 2000)
            } else {
                toast.error(res?.message || "Failed to delete user");
            }
        } catch (error: unknown) {
            setDeleting(false);
            setConfirmation(false);
            const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
            toast.error(message || "Failed to delete user");
        }
    }

    const handleEdit = () => {
        if (!userData) return;
        navigate(`../user_management/edit_user/${userData.id}`, { state: userData });
    };

    useEffect(() => {
        const loadUser = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getCompanyUserById(Number(id));
                setUserRow(data);
            } catch (err) {
                console.error("Failed to load user", err);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [id]);

    if (loading) {
        return (
            <main className="space-y-4">
                <div className="flex items-center gap-4">
                    <ArrowLeft size={20} className="cursor-pointer" onClick={() => navigate(-1)} />
                    <BreadCrump title="User Management" subtitles="Loading..." />
                </div>
                <section
                    aria-busy="true"
                    className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 rounded-lg shadow-xl space-y-6"
                >
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                        <SkeletonBlock className="h-6 w-32" />
                        <div className="flex items-center gap-4">
                            <SkeletonBlock className="h-10 w-20 rounded-lg" />
                            <SkeletonBlock className="h-10 w-24 rounded-lg" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={`user-detail-skeleton-${index}`} className="space-y-2">
                                <SkeletonBlock className="h-4 w-20" />
                                <SkeletonBlock className="h-5 w-40" />
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 border-t border-gray-200 dark:border-gray-800 pt-4">
                        <SkeletonBlock className="h-4 w-14" />
                        <SkeletonBlock className="h-7 w-20 rounded-full" />
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-4">
                        <SkeletonBlock className="h-5 w-40" />
                        <div className="space-y-3">
                            {Array.from({ length: 2 }).map((_, index) => (
                                <div key={`permission-skeleton-${index}`} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800">
                                    <SkeletonBlock className="mb-4 h-5 w-32" />
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                        {Array.from({ length: 6 }).map((_, permissionIndex) => (
                                            <SkeletonBlock key={`permission-item-skeleton-${index}-${permissionIndex}`} className="h-4 w-24" />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="space-y-4">
            <section>
                <div className="flex items-center gap-4">
                    <ArrowLeft size={20} className="cursor-pointer" onClick={() => navigate(-1)} />
                    <BreadCrump
                        title="User Management"
                        options={breadcrumpOptions}
                        breadCrumpActive
                    />
                </div>
            </section>

            <section className="border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 p-6 rounded-lg shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                    <p className="font-semibold text-lg dark:text-white">View User</p>
                    <div className="flex items-center gap-4">
                        <Button
                            buttonText="Edit"
                            icon={PencilIcon}
                            onClick={handleEdit}
                        />
                        <Button
                            buttonText={deleting ? "Deleting..." : "Delete"}
                            icon={Trash2}
                            onClick={() => setConfirmation(true)}
                        />
                    </div>
                </div>

                {/* User Basic Information */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name and ID */}
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                User ID
                            </p>
                            <p className="text-md font-semibold dark:text-white">
                                {userData?.id}
                            </p>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Email
                            </p>
                            <p className="text-md font-semibold dark:text-white">
                                {userData?.email}
                            </p>
                        </div>

                        {/* Name */}
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Full Name
                            </p>
                            <p className="text-md font-semibold dark:text-white">
                                {userData?.name}
                            </p>
                        </div>

                        {/* Role */}
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Role
                            </p>
                            <p className="flex items-center gap-2 text-md font-semibold dark:text-white">
                                <span className="text-green-500">
                                    <Shield size={16} />
                                </span>
                                {userData?.role}
                            </p>
                        </div>
                    </div>
                    {/* Status */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Status
                        </p>
                        <span
                            className={`px-4 py-1 rounded-full text-sm font-semibold ${userData?.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                        >
                            {userData?.status}
                        </span>

                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Login Status
                        </p>
                        <span className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${userData?.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                            <span className={`text-sm font-semibold ${userData?.isOnline ? "text-green-600" : "text-gray-500"}`}>
                                {userData?.isOnline ? "Online" : "Offline"}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Permissions Section */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-4">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen(!isOpen)}>
                        <p className="font-semibold text-md dark:text-white">
                            Module Permissions
                        </p>
                        <button onClick={() => setOpen(!isOpen)}>
                            <ChevronDown className={`${isOpen ? "rotate-180 transition-transform duration-100" : ""} cursor-pointer`} />
                        </button>
                    </div>

                    {
                        isOpen ? (
                            <div className="space-y-3">
                                {userData?.permissions && userData.permissions.length > 0 ? (
                                    userData.permissions.map((permission) => (
                                        <div
                                            key={permission.id}
                                            className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                                        >
                                            <p className="font-medium text-md dark:text-white mb-3">
                                                {permission.module}
                                            </p>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${permission.canImport === "true"
                                                            ? "bg-green-500"
                                                            : "bg-red-500"
                                                            }`}
                                                    ></div>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Import:{" "}
                                                        <span className="font-semibold dark:text-white">
                                                            {permission.canImport === "true" ? "Yes" : "No"}
                                                        </span>
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${permission.canExport === "Yes"
                                                            ? "bg-green-500"
                                                            : "bg-red-500"
                                                            }`}
                                                    ></div>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Export:{" "}
                                                        <span className="font-semibold dark:text-white">
                                                            {permission.canExport}
                                                        </span>
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${permission.canCreate === "Yes"
                                                            ? "bg-green-500"
                                                            : "bg-red-500"
                                                            }`}
                                                    ></div>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Create:{" "}
                                                        <span className="font-semibold dark:text-white">
                                                            {permission.canCreate}
                                                        </span>
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${permission.canRead === "Yes"
                                                            ? "bg-green-500"
                                                            : "bg-red-500"
                                                            }`}
                                                    ></div>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Read:{" "}
                                                        <span className="font-semibold dark:text-white">
                                                            {permission.canRead}
                                                        </span>
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${permission.canDelete === "Yes"
                                                            ? "bg-green-500"
                                                            : "bg-red-500"
                                                            }`}
                                                    ></div>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Delete:{" "}
                                                        <span className="font-semibold dark:text-white">
                                                            {permission.canDelete}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        No permissions assigned
                                    </p>
                                )}
                            </div>
                        ) : null
                    }
                </div>
            </section>
            {id && <LoginHistoryTable userId={Number(id)} />}

            {/* Delete Confirmation Popup */}
            {confirmation && (
                <ConfirmationPopup
                    open={confirmation}
                    title="Delete User"
                    message="Are you sure you want to delete this user?"
                    onConfirm={handleDelete}
                    onClose={() => setConfirmation(false)}
                />
            )}
        </main>
    );
}
