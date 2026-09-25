import api from "./api";

export interface ModulePermission {
    module: string;
    canCreate: boolean;
    canRead: boolean;
    canDelete: boolean;
    canImport: boolean;
    canExport: boolean;
}

export interface CompanyUserRow {
    id: number;
    name: string;
    email: string;
    roleId: number;
    roleName: string;
    active: boolean;
    createdAt: string;
    permissions: ModulePermission[];
    isOnline: boolean;
}

export interface LoginSessionRow {
  date: string;
  loginAt: string;
  logoutAt: string | null;
  durationText: string;
}

export const getAllCompanyUsers = async (): Promise<CompanyUserRow[]> => {
    const res = await api.get("admin/users");
    return res.data?.data ?? [];
};

export const createCompanyUser = async (name: string, email: string, password: string, roleId: number) => {
    const res = await api.post("admin/users", { name, email, password, roleId });
    return res.data;
};

export const updateCompanyUser = async (id: number, updates: { name?: string; roleId?: number; active?: boolean }) => {
    const res = await api.put(`admin/users/${id}`, updates);
    return res.data;
};

export const deleteCompanyUser = async (id: number) => {
    const res = await api.delete(`admin/users/${id}`);
    return res.data;
};

export const getCompanyUserById = async (id: number): Promise<CompanyUserRow | null> => {
    const res = await api.get(`admin/users/${id}`);
    return res.data?.data ?? null;
};

export const getLoginHistory = async (userId: number): Promise<LoginSessionRow[]> => {
  const res = await api.get(`admin/users/${userId}/login-history`);
  return res.data?.data ?? [];
};