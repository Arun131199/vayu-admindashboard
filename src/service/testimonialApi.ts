import api from "./api";

export interface TestimonialRow {
    id: number;
    authorName: string;
    authorPhotoUrl: string;
    rating: number;
    text: string;
    source: "GOOGLE" | "MANUAL";
    isVisible: boolean;
    googleReviewId: string | null;
    createdAt: string;
}

export const getAllTestimonials = async (): Promise<TestimonialRow[]> => {
    const res = await api.get("v1/testimonials");
    return res.data?.data ?? [];
};

export const importFromGoogle = async () => {
    const res = await api.post("v1/testimonials/import-google");
    return res.data;
};

export const createTestimonial = async (data: { authorName: string; authorPhotoUrl?: string; rating: number; text: string; isVisible?: boolean }) => {
    const res = await api.post("v1/testimonials", data);
    return res.data;
};

export const updateTestimonial = async (id: number, data: { authorName: string; authorPhotoUrl?: string; rating: number; text: string; isVisible?: boolean }) => {
    const res = await api.put(`v1/testimonials/${id}`, data);
    return res.data;
};

export const toggleTestimonialVisibility = async (id: number) => {
    const res = await api.patch(`v1/testimonials/${id}/visibility`);
    return res.data;
};

export const deleteTestimonial = async (id: number) => {
    const res = await api.delete(`v1/testimonials/${id}`);
    return res.data;
};