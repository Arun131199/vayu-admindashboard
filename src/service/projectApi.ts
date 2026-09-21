import api from "./api";

export type ProjectCategory = "AGRICULTURE" | "SURVEYING" | "PHOTOGRAPHY" | "INSPECTION" | "TRAINING" | "RESEARCH";
export type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
export type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface ClientInfo {
  company: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface ProjectMilestone {
  id?: number;
  title: string;
  status: MilestoneStatus;
  date: string;
}

export interface ProjectTeamMember {
  id?: number;
  initials?: string;
  name: string;
  role: string;
}

export interface ProjectRow {
  id: number;
  projectCode: string;
  projectName: string;
  description: string;
  location: string;
  category: ProjectCategory;
  status: ProjectStatus;
  budget: number;
  startDate: string;
  endDate: string;
  progress: number;
  client: ClientInfo;
  deliverables: string[];
  teamMembers: ProjectTeamMember[];
  milestones: ProjectMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPayload {
  projectName: string;
  description: string;
  location: string;
  category: ProjectCategory;
  status?: ProjectStatus;
  budget: number;
  startDate: string;
  endDate: string;
  progress?: number;
  client: ClientInfo;
  deliverables?: string[];
  teamMembers?: ProjectTeamMember[];
  milestones?: ProjectMilestone[];
}

export interface ProjectStats {
  totalProjects: number;
  ongoing: number;
  completed: number;
  totalRevenue: number;
}

export interface ProjectSearchRequest {
  search?: string;
  status?: ProjectStatus;
  category?: ProjectCategory;
  dateFrom?: string;
  dateTo?: string;
  projectCodes?: string[];
  exportType?: "EXCEL" | "PDF" | "CSV";
  page?: number;
  size?: number;
}

export const getAllProjects = async (): Promise<ProjectRow[]> => {
  const res = await api.get("v1/projects");
  return res.data?.data ?? [];
};

export const getProjectById = async (id: number): Promise<ProjectRow | null> => {
  const res = await api.get(`v1/projects/${id}`);
  return res.data?.data ?? null;
};

export const createProject = async (payload: ProjectPayload) => {
  const res = await api.post("v1/projects", payload);
  return res.data;
};

export const updateProject = async (id: number, payload: ProjectPayload) => {
  const res = await api.put(`v1/projects/${id}`, payload);
  return res.data;
};

export const deleteProject = async (id: number) => {
  const res = await api.delete(`v1/projects/${id}`);
  return res.data;
};

export const getProjectStats = async (): Promise<ProjectStats> => {
  const res = await api.get("v1/projects/stats");
  return res.data?.data ?? { totalProjects: 0, ongoing: 0, completed: 0, totalRevenue: 0 };
};

export const updateProjectStatus = async (id: number, status: ProjectStatus, progress?: number) => {
  const res = await api.patch(`v1/projects/${id}/status`, { status, progress });
  return res.data;
};

export const addMilestone = async (id: number, milestone: Omit<ProjectMilestone, "id">) => {
  const res = await api.post(`v1/projects/${id}/milestones`, milestone);
  return res.data;
};

export const updateMilestone = async (id: number, milestoneId: number, milestone: Partial<ProjectMilestone>) => {
  const res = await api.patch(`v1/projects/${id}/milestones/${milestoneId}`, milestone);
  return res.data;
};

export const getArchivedProjects = async (): Promise<ProjectRow[]> => {
  const res = await api.get("v1/projects/archived");
  return res.data?.data ?? [];
};

export const restoreProject = async (id: number) => {
  const res = await api.patch(`v1/projects/${id}/restore`);
  return res.data;
};

export const permanentlyDeleteProject = async (id: number) => {
  const res = await api.delete(`v1/projects/${id}/permanent`);
  return res.data;
};

export const importProjects = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("v1/projects/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const downloadProjectImportTemplate = async () => {
  const res = await api.get("v1/projects/import/download-template", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "project_import_template.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportProjects = async (exportType: "EXCEL" | "PDF" | "CSV", projectCodes?: string[]) => {
  const res = await api.post(
    "v1/projects/export",
    { exportType, projectCodes: projectCodes && projectCodes.length > 0 ? projectCodes : undefined },
    { responseType: "blob" }
  );

  const extensionMap: Record<string, string> = { EXCEL: "xlsx", PDF: "pdf", CSV: "csv" };
  const contentDisposition = res.headers["content-disposition"] as string | undefined;
  const match = contentDisposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? `projects_report.${extensionMap[exportType]}`;

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};