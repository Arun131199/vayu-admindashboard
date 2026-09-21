export type EnquiryStatus = "New" | "Pending" | "Closed";

export type EnquiryRow = {
    id: string;
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
    date: string;
    status: EnquiryStatus;
};