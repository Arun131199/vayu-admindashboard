import api from "./api";

export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "RETURNED" | "REFUNDED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderRow {
  id: number;
  orderId: string;
  userId: number;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  items: OrderItem[];
  totalAmount: number;
  paymentId: string;
  paymentType: string;
  paymentReference: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  specialInstructions: string;
  orderedAt: string;
}

export const getAllOrders = async (): Promise<OrderRow[]> => {
  const res = await api.get("v1/products/orders");
  return res.data?.data ?? [];
};

export const getOrderById = async (orderId: number): Promise<OrderRow | null> => {
  const res = await api.get(`v1/products/orders/${orderId}`);
  return res.data?.data ?? null;
};

export const updateOrderStatus = async (
  orderId: number,
  orderStatus: OrderStatus,
  trackingStatus?: string,
  trackingDescription?: string,
  trackingLocation?: string
) => {
  const res = await api.patch(`v1/products/orders/${orderId}/status`, {
    orderStatus,
    trackingStatus,
    trackingDescription,
    trackingLocation,
  });
  return res.data;
};

export const getOrderTracking = async (orderId: number) => {
  const res = await api.get(`v1/products/orders/${orderId}/tracking`);
  return res.data?.data ?? [];
};

export const exportOrders = async (exportType: "EXCEL" | "PDF" | "CSV") => {
  const res = await api.get(`v1/products/orders/export/orders?exportType=${exportType}`, {
    responseType: "blob",
  });
  const extensionMap: Record<string, string> = { EXCEL: "xlsx", PDF: "pdf", CSV: "csv" };
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `orders_report.${extensionMap[exportType]}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const importOrders = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("v1/products/orders/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};