import { ArrowLeft } from "lucide-react";
import BreadCrump from "../../../component/BreadCrump/BreadCrump";
import { useNavigate, useParams } from "react-router-dom";
import AllInputFields from "../../../component/AllInputFields/AllInputFields";
import { useState } from "react";
import { useEffect } from "react";
import { getCompanyUserById } from "../../../service/companyUserApi";
import api from "../../../service/api";

type UserPermission = {
    module: string;
    label: string;
    actions: Record<ModuleAction, boolean>;
};

type AddUserFormData = {
    id?: string;
    roleId?: number;
    name: string;
    email: string;
    role: string;
    password: string;
    confirm_pass: string;
    department: string;
    profile_img: File | null;
    status: string;
    phone_number: string;
    permissions: UserPermission[];
};

type ModuleAction = "READ" | "WRITE" | "UPDATE" | "DELETE" | "IMPORT" | "EXPORT" | "VIEW";

const moduleConfig: { key: string; label: string; actions: ModuleAction[] }[] = [
    { key: "PRODUCT", label: "Products", actions: ["READ", "WRITE", "UPDATE", "DELETE", "IMPORT", "EXPORT"] },
    { key: "ORDER", label: "Orders", actions: ["READ", "WRITE", "UPDATE", "DELETE", "IMPORT", "EXPORT"] },
    { key: "SERVICE", label: "Services", actions: ["READ", "WRITE", "UPDATE", "DELETE", "IMPORT", "EXPORT"] },
    { key: "SERVICE_ENROLLMENT", label: "Service Enrollments", actions: ["READ", "WRITE", "UPDATE", "DELETE", "IMPORT", "EXPORT"] },
    { key: "COURSE", label: "Courses", actions: ["READ", "WRITE", "UPDATE", "DELETE", "IMPORT", "EXPORT"] },
    { key: "COURSE_ENROLLMENT", label: "Course Enrollments", actions: ["READ", "WRITE", "UPDATE", "DELETE", "IMPORT", "EXPORT"] },
    { key: "RPC", label: "RPC Enquiries", actions: ["READ", "WRITE", "UPDATE", "DELETE", "IMPORT", "EXPORT"] },
    { key: "PROJECT", label: "Projects", actions: ["READ", "WRITE", "UPDATE", "DELETE", "IMPORT", "EXPORT"] },
    { key: "USER", label: "Mobile Users", actions: ["READ", "WRITE", "UPDATE", "DELETE"] },
    { key: "COMPANY_USER", label: "Company Users", actions: ["READ", "WRITE", "UPDATE", "DELETE"] },
    { key: "ROLE", label: "Roles", actions: ["READ", "WRITE", "UPDATE", "DELETE"] },
    { key: "STUDENT", label: "Students", actions: ["READ", "WRITE", "UPDATE", "DELETE"] },
    { key: "DASHBOARD", label: "Dashboard", actions: ["VIEW"] },
];

const allActionLabels: { key: ModuleAction; label: string }[] = [
    { key: "READ", label: "Read" },
    { key: "WRITE", label: "Write" },
    { key: "UPDATE", label: "Update" },
    { key: "DELETE", label: "Delete" },
    { key: "IMPORT", label: "Import" },
    { key: "EXPORT", label: "Export" },
    { key: "VIEW", label: "View" },
];


const buildPermissions = (existingPermissions: any[] = []): UserPermission[] =>
    moduleConfig.map((m) => {
        const existing = existingPermissions.find((item) => item.module === m.key);
        const actions = {} as Record<ModuleAction, boolean>;
        allActionLabels.forEach((a) => {
            if (!m.actions.includes(a.key)) {
                actions[a.key] = false;
                return;
            }
            if (a.key === "WRITE") actions[a.key] = Boolean(existing?.canCreate);
            else if (a.key === "READ") actions[a.key] = Boolean(existing?.canRead);
            else if (a.key === "DELETE") actions[a.key] = Boolean(existing?.canDelete);
            else if (a.key === "IMPORT") actions[a.key] = Boolean(existing?.canImport);
            else if (a.key === "EXPORT") actions[a.key] = Boolean(existing?.canExport);
            else actions[a.key] = false;
        });
        return { module: m.key, label: m.label, actions };
    });

export default function AddUser() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loadingUser, setLoadingUser] = useState(isEdit);
    const [roleOptions, setRoleOptions] = useState<{ label: string; value: string; id: number }[]>([]);
    const [userData, setUserData] = useState<AddUserFormData>({
        id: undefined,
        roleId: undefined,
        name: "",
        email: "",
        role: "",
        password: "",
        confirm_pass: "",
        department: "",
        profile_img: null as File | null,
        status: "",
        phone_number: "",
        permissions: buildPermissions([])
    })

    useEffect(() => {
        if (!isEdit || !id) return;

        const loadUser = async () => {
            setLoadingUser(true);
            try {
                const fetched = await getCompanyUserById(Number(id));
                if (fetched) {
                    setUserData({
                        id: String(fetched.id),
                        roleId: fetched.roleId,
                        name: fetched.name,
                        email: fetched.email,
                        role: fetched.roleName,
                        password: "",
                        confirm_pass: "",
                        department: "",
                        profile_img: null,
                        status: fetched.active ? "Active" : "Inactive",
                        phone_number: "",
                        permissions: buildPermissions(fetched.permissions),
                    });
                }
            } catch (err) {
                console.error("Failed to load user", err);
            } finally {
                setLoadingUser(false);
            }
        };
        loadUser();
    }, [id, isEdit]);


    const isEveryPermissionSelected = (permission: UserPermission, moduleActions: ModuleAction[]) => moduleActions.every((a) => permission.actions[a]);

    const handlePermissionChange = (module: string, action: ModuleAction, checked: boolean) => {
        setUserData((prev) => ({
            ...prev,
            permissions: prev.permissions.map((permission) =>
                permission.module === module
                    ? { ...permission, actions: { ...permission.actions, [action]: checked } }
                    : permission
            )
        }));
    };
    const handleAllPermissionChange = (module: string, checked: boolean) => {
        setUserData((prev) => ({
            ...prev,
            permissions: prev.permissions.map((permission) => {
                if (permission.module !== module) return permission;
                const newActions = { ...permission.actions };
                Object.keys(newActions).forEach((k) => { newActions[k as ModuleAction] = checked; });
                return { ...permission, actions: newActions };
            })
        }));
    };

    const handleSubmit = async () => {
        if (!userData.roleId) {
            alert("Please select a role");
            return;
        }

        const permissionArray: string[] = [];
        userData.permissions.forEach((perm) => {
            const config = moduleConfig.find((m) => m.key === perm.module)!;
            config.actions.forEach((action) => {
                if (perm.actions[action]) {
                    permissionArray.push(`${perm.module}_${action}`);
                }
            });
        });

        try {
            if (isEdit) {
                const userUpdateRes = await api.put(`admin/users/${id}`, {
                    name: userData.name,
                    roleId: userData.roleId,
                    active: userData.status === "Active",
                    permissions: permissionArray,
                });

                if (userUpdateRes.data?.success) {
                    navigate(-1);
                } else {
                    alert(userUpdateRes.data?.message || "Failed to update user");
                }
                return;
            }

            if (userData.password !== userData.confirm_pass) {
                alert("Passwords do not match");
                return;
            }

            const userRes = await api.post("admin/users", {
                name: userData.name,
                email: userData.email,
                password: userData.password,
                roleId: userData.roleId,
                permissions: permissionArray,
            });

            if (userRes.data?.success) {
                navigate(-1);
            } else {
                alert(userRes.data?.message || "Failed to create user");
            }
        } catch (err: any) {
            alert(err?.response?.data?.message || "Failed to update/create user");
        }
    };

    useEffect(() => {
        const loadRoles = async () => {
            try {
                const res = await api.get("admin/roles");
                if (res.data?.success) {
                    setRoleOptions(res.data.data.map((r: any) => ({ label: r.name, value: String(r.id), id: r.id })));
                }
            } catch (err) {
                console.error("Failed to load roles", err);
            }
        };
        loadRoles();
    }, []);

    if (loadingUser) {
        return (
            <main className="space-y-4">
                <p className="dark:text-white">Loading user...</p>
            </main>
        );
    }

    return (
        <main className="space-y-4">
            <section className="flex items-start gap-4">
                <ArrowLeft className="cursor-pointer dark:text-white" onClick={() => navigate(-1)} />
                <BreadCrump
                    title={isEdit ? "Edit User" : "Add New User"}
                    subtitles={isEdit ? "Update user account and permissions" : "Create a new user account"}
                />
            </section>
            <section className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 
            rounded-lg shadow-xl p-4 space-y-4">
                <p className="text-lg font-semibold dark:text-white">{isEdit ? "Edit User Information" : "User Information"}</p>
                <form action="" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <AllInputFields
                            label="Full Name"
                            labelFor="name"
                            name="name"
                            placeholder="e.g , Arun Kumar"
                            value={userData.name}
                            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                            required
                        />
                        <AllInputFields
                            label="Email"
                            labelFor="email"
                            name="email"
                            placeholder="e.g , user@gamil.com"
                            value={userData.email}
                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                            required
                            type="email"
                        />
                        <AllInputFields
                            label="Password"
                            labelFor="password"
                            name="password"
                            value={userData.password}
                            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                            required
                            type="password"
                            placeholder="Enter the User Password"
                        />
                        <AllInputFields
                            label="Confirm Password"
                            labelFor="confirm_pass"
                            name="confirm_pass"
                            value={userData.confirm_pass}
                            onChange={(e) => setUserData({ ...userData, confirm_pass: e.target.value })}
                            required
                            type="password"
                            placeholder="Confirm the User Password"
                        />
                        <AllInputFields
                            label="Phone Number"
                            labelFor="phone_number"
                            name="phone_number"
                            value={userData.phone_number}
                            onChange={(e) => setUserData({ ...userData, phone_number: e.target.value })}
                            required
                            type="text"
                            placeholder="e.g , +91 98745 63210"
                        />
                        <AllInputFields
                            label="Role"
                            labelFor="roleId"
                            name="roleId"
                            value={userData.roleId ? String(userData.roleId) : ""}
                            onChange={(e) => {
                                const selectedId = Number(e.target.value);
                                const selectedRole = roleOptions.find((r) => r.id === selectedId);
                                setUserData({ ...userData, roleId: selectedId, role: selectedRole?.label ?? "" });
                            }}
                            required
                            placeholder="Select role"
                            isDropDown={true}
                            options={roleOptions}
                        />
                        <AllInputFields
                            label="Department"
                            labelFor="department"
                            name="department"
                            value={userData.department}
                            onChange={(e) => setUserData({ ...userData, department: e.target.value })}
                            required
                            placeholder="Select department of the employee"
                            isDropDown={true}
                            options={[
                                { label: "Management", value: "management" },
                                { label: "Training", value: "training" },
                                { label: "Sales", value: "sales" },
                                { label: "Instructor", value: "instructor" },
                                { label: "Technical", value: "technical" },
                                { label: "Support", value: "support" },
                            ]}
                        />
                        <AllInputFields
                            label="Status"
                            labelFor="status"
                            name="status"
                            value={userData.status}
                            onChange={(e) => setUserData({ ...userData, status: e.target.value })}
                            required
                            placeholder="Select status of the employee"
                            isDropDown={true}
                            options={[
                                { label: "Active", value: "Active" },
                                { label: "Inactive", value: "Inactive" },
                                { label: "Suspended", value: "Suspended" },
                                { label: "Disabled", value: "Disabled" }
                            ]}
                        />
                    </div>
                    <div>
                        <AllInputFields
                            label="Profile Image"
                            labelFor="profile_img"
                            type="file"
                            name="profile_img"
                            required
                            onChange={(e) => {
                                const input = e.currentTarget as HTMLInputElement;
                                setUserData({ ...userData, profile_img: input.files?.[0] ?? null });
                            }}
                        />
                    </div>
                </form>
            </section>
            <section className="space-y-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg p-4">
                <div className="space-y-1">
                    <p className="font-semibold text-lg dark:text-white">Module Permissions</p>
                    <p className="font-semibold text-sm text-gray-500 ">Select permissions for each module. Admin role has all permissions by default.</p>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                    <table className="w-full min-w-[900px] border-collapse bg-white dark:bg-gray-900">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="border-b border-gray-200 px-5 py-4 text-left text-sm font-medium uppercase tracking-wide text-gray-600 dark:border-gray-700 dark:text-gray-300">
                                    Module
                                </th>
                                {allActionLabels.map((column) => (
                                    <th
                                        key={column.key}
                                        className="border-b border-gray-200 px-5 py-4 text-center text-sm font-medium uppercase tracking-wide text-gray-600 dark:border-gray-700 dark:text-gray-300"
                                    >
                                        {column.label}
                                    </th>
                                ))}
                                <th className="border-b border-gray-200 px-5 py-4 text-center text-sm font-medium uppercase tracking-wide text-gray-600 dark:border-gray-700 dark:text-gray-300">
                                    All
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {userData.permissions.map((permission) => {
                                const config = moduleConfig.find((m) => m.key === permission.module)!;
                                return (
                                    <tr key={permission.module} className="border-b border-gray-200 last:border-b-0 dark:border-gray-800">
                                        <td className="px-5 py-4 text-sm font-semibold text-gray-950 dark:text-white">
                                            {permission.label}
                                        </td>
                                        {allActionLabels.map((column) => (
                                            <td key={column.key} className="px-5 py-4 text-center">
                                                {config.actions.includes(column.key) ? (
                                                    <input
                                                        type="checkbox"
                                                        checked={permission.actions[column.key]}
                                                        onChange={(event) =>
                                                            handlePermissionChange(permission.module, column.key, event.target.checked)
                                                        }
                                                        className="h-5 w-5 cursor-pointer rounded border-gray-400 accent-yellow-400"
                                                        aria-label={`${permission.label} ${column.label}`}
                                                    />
                                                ) : (
                                                    <span className="text-gray-300 dark:text-gray-700">—</span>
                                                )}
                                            </td>
                                        ))}
                                        <td className="px-5 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isEveryPermissionSelected(permission, config.actions)}
                                                onChange={(event) =>
                                                    handleAllPermissionChange(permission.module, event.target.checked)
                                                }
                                                className="h-5 w-5 cursor-pointer rounded border-gray-400 accent-yellow-400"
                                                aria-label={`${permission.label} all permissions`}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end gap-4 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="rounded-lg border border-gray-300 px-8 py-1.5 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="rounded-lg bg-yellow-600 px-8 py-1.5 font-semibold text-white transition hover:bg-yellow-700"
                    >
                        {isEdit ? "Update User" : "Create User"}
                    </button>
                </div>
            </section>
        </main>
    )
}
