import api from "./api";

export interface MonthlyCount {
  month: string;
  count: number;
}

export interface RecentBookingRow {
  id: number;
  bookingId: string;
  name: string;
  service: string;
  status: string;
  createdAt: string;
}

export interface RecentEnquiryRow {
  id: number;
  enquiryId: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

export interface DashboardOverview {
  activeBookings: number;
  totalUsers: number;
  coursesEnrolledTotal: number;
  studentsTrainedTotal: number;
  coursesEnrolledMonthly: MonthlyCount[];
  studentsTrainedMonthly: MonthlyCount[];
  bookingStatusBreakdown: Record<string, number>;
  recentBookings: RecentBookingRow[];
  recentEnquiries: RecentEnquiryRow[];
}

export const getDashboardOverview = async (): Promise<DashboardOverview | null> => {
  const res = await api.get("v1/dashboard/overview");
  return res.data?.data ?? null;
};