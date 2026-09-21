import api from "./api";
import { getAllCourses, type CourseRow } from "./courseApi";

export interface StudentRow {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  mobile: string;
  emergencyContact: string;
  address: string;
  notes: string;
  courseId: number;
  courseName: string;
  courseImage: string;
  progressPercent: number;
  certificateUrl: string | null;
  status: "ENROLLED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED";
  completedAt: string | null;
  enrolledAt: string;
  updatedAt: string;
}

export interface StudentPayload {
  fullName: string;
  email: string;
  mobile: string;
  emergencyContact: string;
  address: string;
  notes?: string;
  courseId: number;
  status?: "ENROLLED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED";
}

export interface StudentSearchRequest {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  studentIds?: string[];
  exportType?: "EXCEL" | "PDF" | "CSV";
}

export const getAllStudents = async (): Promise<StudentRow[]> => {
  const res = await api.get("v1/students");
  return res.data?.data ?? [];
};

export const getStudentById = async (id: number): Promise<StudentRow | null> => {
  const res = await api.get(`v1/students/${id}`);
  return res.data?.data ?? null;
};

export const createStudent = async (payload: StudentPayload) => {
  const res = await api.post("v1/students", payload);
  return res.data;
};

export const updateStudent = async (id: number, payload: StudentPayload) => {
  const res = await api.put(`v1/students/${id}`, payload);
  return res.data;
};

export const updateStudentProgress = async (id: number, progressPercent: number) => {
  const res = await api.patch(`v1/students/${id}/progress`, { progressPercent });
  return res.data;
};

export const deleteStudent = async (id: number) => {
  const res = await api.delete(`v1/students/${id}`);
  return res.data;
};

export const searchStudents = async (request: StudentSearchRequest): Promise<StudentRow[]> => {
  const res = await api.post("v1/students/search", request);
  return res.data?.data ?? [];
};

export const importStudents = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("v1/students/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const downloadStudentImportTemplate = async () => {
  const res = await api.get("v1/students/import/download-template", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "student_import_template.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportStudents = async (exportType: "EXCEL" | "PDF" | "CSV", studentIds?: string[]) => {
  const res = await api.post(
    "v1/students/export",
    { exportType, studentIds: studentIds && studentIds.length > 0 ? studentIds : undefined },
    { responseType: "blob" }
  );

  const extensionMap: Record<string, string> = { EXCEL: "xlsx", PDF: "pdf", CSV: "csv" };
  const contentDisposition = res.headers["content-disposition"] as string | undefined;
  const match = contentDisposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? `students_report.${extensionMap[exportType]}`;

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getArchivedStudents = async (): Promise<StudentRow[]> => {
  const res = await api.get("v1/students/archived");
  return res.data?.data ?? [];
};

export const restoreStudent = async (id: number) => {
  const res = await api.patch(`v1/students/${id}/restore`);
  return res.data;
};

export const permanentlyDeleteStudent = async (id: number) => {
  const res = await api.delete(`v1/students/${id}/permanent`);
  return res.data;
};

export { getAllCourses };
export type { CourseRow };