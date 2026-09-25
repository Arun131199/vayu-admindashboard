import type { NavbarItem } from "../routes/NavbarItem";

export interface NavbarProps {
    data?: {
        name: string;
        profileImage?: string;
        email?: string;
        role?: string;
    };
    menu?: NavbarItem[];
}