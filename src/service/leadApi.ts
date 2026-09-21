import api from "./api";

export type LeadType = "RPC" | "PRODUCT" | "SERVICE" | "COURSE" | "APPOINTMENT" | "REPLACEMENT";

export interface LeadAssignment {
  entityId: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  assignedAt: string;
}

export interface LeadRemark {
  id: number;
  remark: string;
  employeeId: number;
  employeeName: string;
  createdAt: string;
}

export const assignLead = async (leadType: LeadType, entityId: number, employeeId: number) => {
  const res = await api.patch(`v1/leads/${leadType}/${entityId}/assign`, { employeeId });
  return res.data;
};

export const addLeadRemark = async (leadType: LeadType, entityId: number, remark: string) => {
  const res = await api.post(`v1/leads/${leadType}/${entityId}/remarks`, { remark });
  return res.data;
};

export const getLeadRemarks = async (leadType: LeadType, entityId: number): Promise<LeadRemark[]> => {
  const res = await api.get(`v1/leads/${leadType}/${entityId}/remarks`);
  return res.data?.data ?? [];
};

export const getAllLeadAssignments = async (leadType: LeadType): Promise<LeadAssignment[]> => {
  const res = await api.get(`v1/leads/${leadType}/assignments`);
  return res.data?.data ?? [];
};

export const getMyLeadIds = async (leadType: LeadType): Promise<number[]> => {
  const res = await api.get(`v1/leads/${leadType}/my-leads`);
  return res.data?.data ?? [];
};