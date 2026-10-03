import axios from "axios";
import api from "./api";

export type BatchDay = "MONDAY" | "THURSDAY";
export type SlotStatus = "AVAILABLE" | "FULL";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface RpcBatch {
  id: number;
  batchDate: string; // YYYY-MM-DD
  batchDay: BatchDay;
  maxStudents: number;
  bookedStudents: number;
  availableSeats: number;
  status: SlotStatus;
  past: boolean;
}

export interface RpcBatchStudent {
  rpcEnrollId: number;
  enrollmentId: string;
  username: string;
  email: string;
  mobile: string;
  paymentStatus: PaymentStatus;
  enrollmentStatus: string | null;
  // true = student chose this batch but has not paid yet (seat is only held)
  onHold: boolean;
}

export interface RpcBatchDetail {
  batch: RpcBatch;
  students: RpcBatchStudent[];
}

export interface GenerateBatchPayload {
  startDate: string;
  endDate: string;
  days: BatchDay[];
  maxStudents: number;
}

export interface GenerateBatchResult {
  created: number;
  skipped: number;
  createdDates: string[];
}

const BASE = "admin/rpc/batches";

export const getErrorMessage = (err: unknown, fallback = "Something went wrong"): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? fallback;
  }
  return fallback;
};

export const getRpcBatches = async (): Promise<RpcBatch[]> => {
  const res = await api.get(BASE);
  return res.data?.data ?? [];
};

export const getRpcBatchDetail = async (id: number): Promise<RpcBatchDetail | null> => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data?.data ?? null;
};

export const getUnassignedRpcStudents = async (): Promise<RpcBatchStudent[]> => {
  const res = await api.get(`${BASE}/unassigned`);
  return res.data?.data ?? [];
};

export const searchAssignableRpcStudents = async (query: string): Promise<RpcBatchStudent[]> => {
  const res = await api.get(`${BASE}/students/search`, { params: { q: query } });
  return res.data?.data ?? [];
};

export const generateRpcBatches = async (payload: GenerateBatchPayload): Promise<GenerateBatchResult> => {
  const res = await api.post(`${BASE}/generate`, payload);
  return res.data?.data;
};

export const createRpcBatch = async (batchDate: string, maxStudents: number): Promise<RpcBatch> => {
  const res = await api.post(BASE, { batchDate, maxStudents });
  return res.data?.data;
};

export const updateRpcBatchSeats = async (id: number, maxStudents: number): Promise<RpcBatch> => {
  const res = await api.patch(`${BASE}/${id}/seats`, { maxStudents });
  return res.data?.data;
};

export const deleteRpcBatch = async (id: number) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

export const assignStudentToRpcBatch = async (batchId: number, rpcEnrollId: number) => {
  const res = await api.patch(`${BASE}/${batchId}/assign`, { rpcEnrollId });
  return res.data;
};

export const removeStudentFromRpcBatch = async (batchId: number, rpcEnrollId: number) => {
  const res = await api.patch(`${BASE}/${batchId}/remove`, { rpcEnrollId });
  return res.data;
};


export interface WalkInPayload {
  username: string;
  mobile: string;
  paymentStatus: "SUCCESS" | "PENDING";
  paymentNote?: string;
  email?: string;
  age?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export const addWalkInRpcStudent = async (batchId: number, payload: WalkInPayload) => {
  const res = await api.post(`${BASE}/${batchId}/walk-in`, payload);
  return res.data;
};

export const markRpcStudentPaid = async (batchId: number, rpcEnrollId: number, paymentNote?: string) => {
  const res = await api.patch(`${BASE}/${batchId}/mark-paid`, { rpcEnrollId, paymentNote });
  return res.data;
};