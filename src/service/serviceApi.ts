import api from "./api";


export interface ServiceRow {
  id: number;
  serviceId: string;
  serviceName: string;
  aboutService: string;
  useCases: string[];
  traditionalSpecific: string[];
  droneSpecific: string[];
  serviceImage: string | null;
  photos: string[];
  category: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePayload {
  serviceName: string;
  serviceId: string;
  aboutService: string;
  useCases: string[];
  traditionalSpecific: string[];
  droneSpecific: string[];
  category?: string;
}

export interface ServiceStats {
  totalServices: number;
  activeServices: number;
  totalBookings: number;
  categories: number;
}

export const getAllServices = async (): Promise<ServiceRow[]> => {
  const res = await api.get("v1/services");
  return res.data?.data ?? [];
};

export const getServiceById = async (id: string): Promise<ServiceRow | null> => {
  const res = await api.get(`v1/services/${id}`);
  return res.data?.data ?? null;
};

export const createService = async (
  payload: ServicePayload,
  serviceImage?: File | null,
  photos?: File[]
) => {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));
  if (serviceImage) formData.append("serviceImage", serviceImage);
  if (photos) photos.forEach((p) => formData.append("photos", p));

  const res = await api.post("v1/services", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateService = async (
  id: string,
  payload: {
    serviceName: string;
    serviceId: string;
    aboutService: string;
    useCases: string[];
    traditionalSpecific: string[];
    droneSpecific: string[];
  },
  serviceImage?: File | null,
  photos?: File[]
) => {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));
  if (serviceImage) formData.append("serviceImage", serviceImage);
  if (photos) photos.forEach((p) => formData.append("photos", p));

  const res = await api.put(`v1/services/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteService = async (id: number) => {
  const res = await api.delete(`v1/services/${id}`);
  return res.data;
};

export const getServiceStats = async (): Promise<ServiceStats> => {
  const res = await api.get("v1/services/stats");
  return res.data?.data ?? { totalServices: 0, activeServices: 0, totalBookings: 0, categories: 0 };
};

export const getArchivedServices = async (): Promise<ServiceRow[]> => {
  const res = await api.get("v1/services/archived");
  return res.data?.data ?? [];
};

export const restoreService = async (id: number) => {
  const res = await api.patch(`v1/services/${id}/restore`);
  return res.data;
};

export const permanentlyDeleteService = async (id: number) => {
  const res = await api.delete(`v1/services/${id}/permanent`);
  return res.data;
};

export const importServices = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("v1/services/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const downloadServiceImportTemplate = async () => {
  const res = await api.get("/api/v1/services/import/download-template?type=csv", {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "service_import_template.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const exportServices = async (exportType: "EXCEL" | "PDF" | "CSV", serviceIds?: string[]) => {
  const res = await api.post(
    "v1/services/export",
    { exportType, serviceIds: serviceIds && serviceIds.length > 0 ? serviceIds : undefined },
    { responseType: "blob" }
  );

  const extensionMap: Record<string, string> = {
    EXCEL: "xlsx",
    PDF: "pdf",
    CSV: "csv",
  };

  const contentDisposition = res.headers["content-disposition"] as string | undefined;
  const match = contentDisposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? `services_report.${extensionMap[exportType]}`;

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};