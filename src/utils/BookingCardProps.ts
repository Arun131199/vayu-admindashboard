export interface BookingCardProps{
    id:number;
    name:string;
    service:string;
    status:string;
    createdAt:string
}

export interface bookingCardData{
    data:BookingCardProps[];
    title:string;
    loading?: boolean;
    skeletonCount?: number;
}

export interface enquiryCardProps{
    id:number;
    name:string;
    message:string;
    mobile:string
}

export interface enquiryData{
    data:enquiryCardProps[];
    title:string;
    loading?: boolean;
    skeletonCount?: number;
}
