export type ModuleAction = "READ" | "WRITE" | "UPDATE" | "DELETE" | "IMPORT" | "EXPORT" | "VIEW";

export const moduleConfig: { key: string; label: string; actions: ModuleAction[] }[] = [
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

export const allActionLabels: { key: ModuleAction; label: string }[] = [
    { key: "READ", label: "Read" },
    { key: "WRITE", label: "Write" },
    { key: "UPDATE", label: "Update" },
    { key: "DELETE", label: "Delete" },
    { key: "IMPORT", label: "Import" },
    { key: "EXPORT", label: "Export" },
    { key: "VIEW", label: "View" },
];

export type UserPermission = {
    module: string;
    label: string;
    actions: Record<ModuleAction, boolean>;
};

export const buildEmptyActions = (_moduleActions: ModuleAction[]): Record<ModuleAction, boolean> => {
    const result = {} as Record<ModuleAction, boolean>;
    allActionLabels.forEach((a) => {
        result[a.key] = false;
    });
    return result;
};

export const initialPermissions: UserPermission[] = moduleConfig.map((m) => ({
    module: m.key,
    label: m.label,
    actions: buildEmptyActions(m.actions),
}));

export const buildPermissionsFromFlat = (flatPermissions: string[] = []): UserPermission[] =>
    moduleConfig.map((m) => {
        const actions = {} as Record<ModuleAction, boolean>;
        allActionLabels.forEach((a) => {
            actions[a.key] = flatPermissions.includes(`${m.key}_${a.key}`);
        });
        return { module: m.key, label: m.label, actions };
    });

export const permissionsToFlat = (permissions: UserPermission[]): string[] => {
    const result: string[] = [];
    permissions.forEach((perm) => {
        const config = moduleConfig.find((m) => m.key === perm.module)!;
        config.actions.forEach((action) => {
            if (perm.actions[action]) {
                result.push(`${perm.module}_${action}`);
            }
        });
    });
    return result;
};