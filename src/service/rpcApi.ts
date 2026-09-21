import api from "./api";
import type { ServiceEnrollmentRow } from "./serviceEnrollmentApi";

export type EnrollmentStatus = "PENDING" | "REJECTED" | "UNDER_REVIEW" | "PAYMENT_APPROVED" | "PAYMENT_PENDING" | "ENROLLED" | "COMPLETED" | "DROPPED";

export interface RpcEnquiryRow {
  id: number;
  enrollmentId: string;
  username: string;
  email: string;
  mobile: string;
  age: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  status: EnrollmentStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export const getAllRpcEnquiries = async (): Promise<RpcEnquiryRow[]> => {
  const res = await api.get("v1/rpce-enroll");
  return res.data?.data ?? [];
};

export const updateRpcStatus = async (id: number, status: EnrollmentStatus, remarks?: string) => {
  const res = await api.patch(`v1/rpce-enroll/${id}/status`, { status, remarks });
  return res.data;
};

export const getServiceEnrollmentById = async (id: number): Promise<ServiceEnrollmentRow | null> => {
  const res = await api.get(`v1/service-enrollments/${id}`);
  return res.data?.data ?? null;
};

export const getRpcById = async (id: number): Promise<RpcEnquiryRow | null> => {
  const res = await api.get(`v1/rpce-enroll/${id}`);
  return res.data?.data ?? null;
};

export const exportRpcEnquiries = async (exportType: "EXCEL" | "PDF" | "CSV") => {
  const res = await api.post(
    "v1/rpce-enroll/export",
    { exportType },
    { responseType: "blob" }
  );
  const extensionMap: Record<string, string> = { EXCEL: "xlsx", PDF: "pdf", CSV: "csv" };
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `rpc_enrollments_report.${extensionMap[exportType]}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const importRpcEnquiries = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("v1/rpce-enroll/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const downloadRpcImportTemplate = async () => {
  const res = await api.get("v1/rpce-enroll/import/download-template?type=csv", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "rpc_import_template.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};