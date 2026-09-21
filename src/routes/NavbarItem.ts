export interface NavbarItem {
    name: string;
    path?: string;
    icon?: React.ComponentType<{ size?: number; strokeWidth?: number }> | string;
    children?: NavbarItem[];
    badge?: string | number; // Add this for notification badges
}

export interface NavbarProps {
    menu: NavbarItem[];
}