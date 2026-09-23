import api from "./api";

export type ArchiveLeadType = "PRODUCT" | "SERVICE" | "COURSE" | "RPC" | "APPOINTMENT" | "REPLACEMENT";

export const archiveRecords = async (leadType: ArchiveLeadType, entityIds: number[]) => {
  const res = await api.patch(`v1/archive/${leadType}`, { entityIds });
  return res.data;
};

export const restoreRecord = async (leadType: ArchiveLeadType, entityId: number) => {
  const res = await api.patch(`v1/archive/${leadType}/${entityId}/restore`);
  return res.data;
};

export const getArchivedIds = async (leadType: ArchiveLeadType): Promise<number[]> => {
  const res = await api.get(`v1/archive/${leadType}`);
  return res.data?.data ?? [];
};