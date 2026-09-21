import api from "./api";

export interface CourseScheduleItem {
  dayNumber: number;
  day: string;
  topic: string;
  content: string[];
}

export interface CourseRow {
  id: number;
  courseId: string;
  courseName: string;
  courseCode: string;
  courseDescription: string;
  courseImage: string;
  coursePrice: number;
  courseCategory: string;
  courseDuration: string;
  courseStatus: string;
  courseHighlights: string[];
  courseLearnContent: string[];
  courseMedia: string[];
  courseSchedule: CourseScheduleItem[];
  instructor: string;
  maxStudents: number;
  enrolledCount: number;
  createdAt: string;
  updatedAt: string;
  enrolled: boolean;
  inCart: boolean;
  wishlisted: boolean;
  userProgressPercent: number | null;
}

export interface CourseStats {
  totalCourses: number;
  activeCourses: number;
  comingSoonCourses: number;
  totalEnrollments: number;
}

export interface CoursePayload {
  courseName: string;
  courseCode: string;
  courseDescription: string;
  coursePrice: number;
  courseCategory: string;
  courseDuration: string;
  courseSchedule: CourseScheduleItem[];
  courseHighlights: string[];
  courseLearnContent: string[];
  instructor?: string;
  maxStudents?: number;
}

export const getAllCourses = async (): Promise<CourseRow[]> => {
  const response = await api.get("v1/courses");
  return response?.data?.data ?? [];
};

export const getCourseById = async (id: number): Promise<CourseRow | null> => {
  const response = await api.get(`v1/courses/${id}`);
  return response?.data?.data ?? null;
};

export const createCourse = async (
  payload: CoursePayload,
  courseImage?: File | null,
  media?: File[]
) => {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));
  if (courseImage) formData.append("courseImage", courseImage);
  if (media) media.forEach((m) => formData.append("media", m));

  const res = await api.post("v1/courses", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateCourse = async (
  id: number,
  payload: CoursePayload,
  courseImage?: File | null,
  media?: File[]
) => {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));
  if (courseImage) formData.append("courseImage", courseImage);
  if (media) media.forEach((m) => formData.append("media", m));

  const res = await api.put(`v1/courses/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteCourse = async (id: number) => {
  const res = await api.delete(`v1/courses/${id}`);
  return res.data;
};

export const getCourseStats = async (): Promise<CourseStats> => {
  const res = await api.get("v1/courses/stats");
  return res.data?.data ?? { totalCourses: 0, activeCourses: 0, comingSoonCourses: 0, totalEnrollments: 0 };
};

export const importCourses = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("v1/courses/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const downloadCourseImportTemplate = async () => {
  const res = await api.get("v1/courses/import/download-template", {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "course_import_template.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportCourses = async (
  exportType: "EXCEL" | "PDF" | "CSV",
  courseIds?: string[]
) => {
  const res = await api.post("v1/courses/export",
    { exportType, courseIds: courseIds && courseIds.length > 0 ? courseIds : undefined },
    { responseType: "blob" }
  );

  const extensionMap: Record<string, string> = { EXCEL: "xlsx", PDF: "pdf", CSV: "csv" };
  const contentDisposition = res.headers["content-disposition"] as string | undefined;
  const match = contentDisposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? `courses_report.${extensionMap[exportType]}`;

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const updateCourseStatus = async (id: number, status: string) => {
  const res = await api.patch(`v1/courses/${id}/status`, { status });
  return res.data;
};

export const archiveCourse = async (id: number) => {
  const res = await api.patch(`v1/courses/${id}/archive`);
  return res.data;
};

export const restoreCourse = async (id: number) => {
  const res = await api.patch(`v1/courses/${id}/restore`);
  return res.data;
};

export const getArchivedCourses = async (): Promise<CourseRow[]> => {
  const res = await api.get("v1/courses/archived");
  return res.data?.data ?? [];
};