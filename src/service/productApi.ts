import api from "./api";

export interface ProductRow {
  id: number;
  productId: string;
  productName: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  category: string;
  brand: string;
  mainImage: string | null;
  images: string[];
  highlights: string[];
  specifications: Record<string, string>;
  averageRating: number;
  totalReviews: number;
  totalSold: number;
  createdAt: string;
  arrivedAt: string | null;
  newArrivalUntil: string | null;
  featured: boolean;
  inCart: boolean;
  newArrival: boolean;
  wishlisted: boolean;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  lowStock: number;
}

export interface ProductPayload {
  productName: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  category: string;
  brand: string;
  highlights: string[];
  specifications?: Record<string, string>;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  newArrivalDays?: number;
}

export const getAllProducts = async (): Promise<ProductRow[]> => {
  const res = await api.get("v1/products");
  return res.data?.data ?? [];
};

export const getProductById = async (id: number): Promise<ProductRow | null> => {
  const res = await api.get(`v1/products/${id}`);
  return res.data?.data ?? null;
};

export const createProduct = async (
  payload: ProductPayload,
  mainImage?: File | null,
  images?: File[]
) => {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));
  if (mainImage) formData.append("mainImage", mainImage);
  if (images) images.forEach((img) => formData.append("images", img));

  const res = await api.post("v1/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateProduct = async (
  id: number,
  payload: ProductPayload,
  mainImage?: File | null,
  images?: File[]
) => {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));
  if (mainImage) formData.append("mainImage", mainImage);
  if (images) images.forEach((img) => formData.append("images", img));

  const res = await api.put(`v1/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteProduct = async (id: number) => {
  const res = await api.delete(`v1/products/${id}`);
  return res.data;
};

export const getProductStats = async (): Promise<ProductStats> => {
  const res = await api.get("v1/products/stats");
  return res.data?.data ?? { totalProducts: 0, activeProducts: 0, outOfStock: 0, lowStock: 0 };
};

export const getArchivedProducts = async (): Promise<ProductRow[]> => {
  const res = await api.get("v1/products/archived");
  return res.data?.data ?? [];
};

export const restoreProduct = async (id: number) => {
  const res = await api.patch(`v1/products/${id}/restore`);
  return res.data;
};

export const markNewArrival = async (id: number, days: number = 30) => {
  const res = await api.patch(`v1/products/${id}/new-arrival`, null, { params: { days } });
  return res.data;
};

export const removeNewArrival = async (id: number) => {
  const res = await api.delete(`v1/products/${id}/new-arrival`);
  return res.data;
};