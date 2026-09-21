import api from "./api";

export interface RoleRow {
    id: number;
    name: string;
    permissions: string[];
    archived: boolean;
}

export const getAllRoles = async (): Promise<RoleRow[]> => {
    const res = await api.get("admin/roles");
    return res.data?.data ?? [];
};

export const createRole = async (name: string, permissions: string[]) => {
    const res = await api.post("admin/roles", { name, permissions });
    return res.data;
};

export const updateRole = async (id: number, updates: { name?: string; permissions?: string[] }) => {
    const res = await api.put(`admin/roles/${id}`, updates);
    return res.data;
};

export const archiveRole = async (id: number) => {
    const res = await api.patch(`admin/roles/${id}/archive`);
    return res.data;
};

export const restoreRole = async (id: number) => {
    const res = await api.patch(`admin/roles/${id}/restore`);
    return res.data;
};

export const deleteRole = async (id: number) => {
    const res = await api.delete(`admin/roles/${id}`);
    return res.data;
};