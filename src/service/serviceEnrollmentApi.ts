import api from "./api";

export type EnrollmentStatus = "PENDING" | "REJECTED" | "UNDER_REVIEW" | "PAYMENT_APPROVED" | "PAYMENT_PENDING" | "ENROLLED" | "COMPLETED" | "DROPPED";

export interface ServiceEnrollmentRow {
  id: number;
  serviceEnrollmentId: string;
  fullName: string;
  serviceName: string;
  email: string;
  mobileNumber: string;
  bookingDate: string;
  slotTime: string;
  address: string;
  additionalNotes: string;
  status: EnrollmentStatus;
  createdAt: string;
  updatedAt: string;
}

export const getAllServiceEnrollments = async (): Promise<ServiceEnrollmentRow[]> => {
  const res = await api.get("v1/service-enrollments");
  return res.data?.data ?? [];
};

export const getServiceEnrollmentById = async (id: number): Promise<ServiceEnrollmentRow | null> => {
  const res = await api.get(`v1/service-enrollments/${id}`);
  return res.data?.data ?? null;
};

export const updateServiceEnrollmentStatus = async (id: number, status: EnrollmentStatus, remarks?: string) => {
  const res = await api.patch(`v1/service-enrollments/${id}/status`, { status, remarks });
  return res.data;
};

export const exportServiceEnrollments = async (exportType: "EXCEL" | "PDF" | "CSV") => {
  const res = await api.post(
    "v1/service-enrollments/export",
    { exportType },
    { responseType: "blob" }
  );
  const extensionMap: Record<string, string> = { EXCEL: "xlsx", PDF: "pdf", CSV: "csv" };
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `service_enrollments_report.${extensionMap[exportType]}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const importServiceEnrollments = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("v1/service-enrollments/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const downloadServiceEnrollmentTemplate = async () => {
  const res = await api.get("v1/service-enrollments/import/template?type=csv", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "service_enrollment_template.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};