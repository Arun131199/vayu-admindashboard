import api from "./api";

export type AppointmentStatus = "PENDING" | "CONTACTED" | "COMPLETED" | "CANCELLED";

export interface AppointmentRow {
  id: number;
  appointmentId: string;
  fullName: string;
  email: string;
  mobile: string;
  service: string;
  address: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export const getAllAppointments = async (): Promise<AppointmentRow[]> => {
  const res = await api.get("v1/appointments");
  return res.data?.data ?? [];
};

export const getAppointmentById = async (id: number): Promise<AppointmentRow | null> => {
  const res = await api.get(`v1/appointments/${id}`);
  return res.data?.data ?? null;
};

export const updateAppointmentStatus = async (id: number, status: AppointmentStatus, remarks?: string) => {
  const res = await api.patch(`v1/appointments/${id}/status`, { status, remarks });
  return res.data;
};

export const exportAppointments = async (exportType: "EXCEL" | "CSV" | "PDF") => {
  const res = await api.get(`v1/appointments/export`, {
    params: { exportType },
    responseType: "blob",
  });
  return res.data;
};