import api from "./api";

export type EnrollmentStatus = "PENDING" | "REJECTED" | "UNDER_REVIEW" | "PAYMENT_APPROVED" | "PAYMENT_PENDING" | "ENROLLED" | "COMPLETED" | "DROPPED";

export interface CourseEnrollmentRow {
  id: number;
  enrollmentId: string;
  userId: number;
  fullName: string;
  email: string;
  mobile: string;
  courseId: string;
  courseDbId: number;
  courseName: string;
  courseImage: string;
  progressPercent: number;
  status: EnrollmentStatus;
  certificateUrl: string;
  certificateIssuedAt: string;
  completedAt: string;
  enrolledAt: string;
  paymentId: string;
  paymentReference: string;
  paymentStatus: string;
  adminNotes: string;
}

export const getAllCourseEnrollments = async (): Promise<CourseEnrollmentRow[]> => {
  const res = await api.get("v1/courses/enrollments");
  return res.data?.data ?? [];
};

export const getCourseEnrollmentById = async (id: number): Promise<CourseEnrollmentRow | null> => {
  const res = await api.get(`v1/courses/enrollments/${id}`);
  return res.data?.data ?? null;
};

export const updateCourseEnrollmentStatus = async (id: number, status: EnrollmentStatus, remarks?: string) => {
  const res = await api.patch(`v1/courses/enrollments/${id}/status`, { status, remarks });
  return res.data;
};

export const exportCourseEnrollments = async (exportType: "EXCEL" | "CSV" | "PDF") => {
  const res = await api.get(`v1/courses/enrollments/export`, {
    params: { exportType },
    responseType: "blob",
  });
  return res.data;
};

export const updateCourseProgress = async (userId: number, courseId: number, progressPercent: number) => {
  const res = await api.patch(`v1/courses/progress/${userId}/${courseId}`, { progressPercent });
  return res.data;
};