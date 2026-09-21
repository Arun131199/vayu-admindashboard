import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import BreadCrump from "../../component/BreadCrump/BreadCrump";
import AllInputFields from "../../component/AllInputFields/AllInputFields";
import { createRole, updateRole, type RoleRow } from "../../service/roleApi";
import { moduleConfig, allActionLabels, buildPermissionsFromFlat, permissionsToFlat, type UserPermission, type ModuleAction } from "../../utils/moduleConfig";

export default function AddRole() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const isEdit = Boolean(id);
    const existingRole = location.state as RoleRow | undefined;

    const [roleName, setRoleName] = useState(existingRole?.name ?? "");
    const [permissions, setPermissions] = useState<UserPermission[]>(buildPermissionsFromFlat(existingRole?.permissions ?? []));

    useEffect(() => {
        if (isEdit && !existingRole) {
            // If navigated directly without state, could fetch by id here if a getRoleById API exists.
        }
    }, []);

    const handlePermissionChange = (module: string, action: ModuleAction, checked: boolean) => {
        setPermissions((prev) =>
            prev.map((p) => (p.module === module ? { ...p, actions: { ...p.actions, [action]: checked } } : p))
        );
    };

    const handleAllPermissionChange = (module: string, checked: boolean) => {
        setPermissions((prev) =>
            prev.map((p) => {
                if (p.module !== module) return p;
                const newActions = { ...p.actions };
                Object.keys(newActions).forEach((k) => { newActions[k as ModuleAction] = checked; });
                return { ...p, actions: newActions };
            })
        );
    };

    const isEveryPermissionSelected = (permission: UserPermission, moduleActions: ModuleAction[]) =>
        moduleActions.every((a) => permission.actions[a]);

    const handleSubmit = async () => {
        if (!roleName.trim()) {
            alert("Please enter a role name");
            return;
        }

        const flatPermissions = permissionsToFlat(permissions);

        try {
            const res = isEdit
                ? await updateRole(Number(id), { name: roleName, permissions: flatPermissions })
                : await createRole(roleName, flatPermissions);

            if (res?.success) {
                navigate(-1);
            } else {
                alert(res?.message || "Failed to save role");
            }
        } catch (err: any) {
            alert(err?.response?.data?.message || "Failed to save role");
        }
    };

    return (
        <main className="space-y-4">
            <section className="flex items-start gap-4">
                <ArrowLeft className="cursor-pointer dark:text-white" onClick={() => navigate(-1)} />
                <BreadCrump
                    title={isEdit ? "Edit Role" : "Add New Role"}
                    subtitles={isEdit ? "Update role permissions" : "Create a reusable permission role"}
                />
            </section>

            <section className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg shadow-xl p-4 space-y-4">
                <AllInputFields
                    label="Role Name"
                    labelFor="roleName"
                    name="roleName"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    required
                    placeholder="e.g., Sales Team"
                    type="text"
                />
            </section>

            <section className="space-y-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg p-4">
                <p className="font-semibold text-lg dark:text-white">Module Permissions</p>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                    <table className="w-full min-w-[900px] border-collapse bg-white dark:bg-gray-900">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="border-b border-gray-200 px-5 py-4 text-left text-sm font-medium uppercase text-gray-600 dark:border-gray-700 dark:text-gray-300">Module</th>
                                {allActionLabels.map((column) => (
                                    <th key={column.key} className="border-b border-gray-200 px-5 py-4 text-center text-sm font-medium uppercase text-gray-600 dark:border-gray-700 dark:text-gray-300">
                                        {column.label}
                                    </th>
                                ))}
                                <th className="border-b border-gray-200 px-5 py-4 text-center text-sm font-medium uppercase text-gray-600 dark:border-gray-700 dark:text-gray-300">All</th>
                            </tr>
                        </thead>
                        <tbody>
                            {permissions.map((permission) => {
                                const config = moduleConfig.find((m) => m.key === permission.module)!;
                                return (
                                    <tr key={permission.module} className="border-b border-gray-200 last:border-b-0 dark:border-gray-800">
                                        <td className="px-5 py-4 text-sm font-semibold text-gray-950 dark:text-white">{permission.label}</td>
                                        {allActionLabels.map((column) => (
                                            <td key={column.key} className="px-5 py-4 text-center">
                                                {config.actions.includes(column.key) ? (
                                                    <input
                                                        type="checkbox"
                                                        checked={permission.actions[column.key]}
                                                        onChange={(e) => handlePermissionChange(permission.module, column.key, e.target.checked)}
                                                        className="h-5 w-5 cursor-pointer rounded border-gray-400 accent-yellow-400"
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
                                                onChange={(e) => handleAllPermissionChange(permission.module, e.target.checked)}
                                                className="h-5 w-5 cursor-pointer rounded border-gray-400 accent-yellow-400"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end gap-4 pt-2">
                    <button type="button" onClick={() => navigate(-1)} className="rounded-lg border border-gray-300 px-8 py-1.5 font-semibold text-gray-700 dark:border-gray-700 dark:text-white">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSubmit} className="rounded-lg bg-yellow-600 px-8 py-1.5 font-semibold text-white hover:bg-yellow-700">
                        {isEdit ? "Update Role" : "Create Role"}
                    </button>
                </div>
            </section>
        </main>
    );
}