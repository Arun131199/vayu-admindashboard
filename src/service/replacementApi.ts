import api from "./api";

export type ReplacementStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

export interface OrderReplacementRow {
  id: number;
  replacementId: string;
  orderId: string;
  reason: string;
  images: string[];
  status: ReplacementStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export const getAllReplacements = async (): Promise<OrderReplacementRow[]> => {
  const res = await api.get("v1/products/replacements");
  return res.data?.data ?? [];
};

export const updateReplacementStatus = async (id: number, status: ReplacementStatus, adminNotes?: string) => {
  const res = await api.patch(`v1/products/replacements/${id}/status`, { status, adminNotes });
  return res.data;
};