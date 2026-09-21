import { Bell, CalendarDays, FingerprintPattern, FolderKanban, GalleryThumbnails, GraduationCap, HandPlatter, House, LayoutDashboard, MessageCircleMore, Package, Settings, Shield, User2, Users } from "lucide-react";
import BookingAndEnquiry from "../pages/BookingAndEnquiry/BookingAndEnquiry";
import Dashboard from "../pages/Dashboard/Dashboard";
import Products from "../pages/Products/Products";
import ProjectAndClient from "../pages/ProjectAndClients/ProjectAndClients";
import Service from "../pages/Service/Service";
import Students from "../pages/Students/Students";
import UserManagement from "../pages/UserManagement/UserManagement";
import HomePage from "../pages/WebSettings/HomePage";
import NotificationSettings from "../pages/WebSettings/NotificationSettings";
import SecuritySettings from "../pages/WebSettings/SecuritySettings";
import Gallery from "../pages/WebSettings/Gallery";
import Testimonial from "../pages/WebSettings/Testimonial";
import Roles from "../pages/Roles/Roles";

export const routesConfig = [
  {
    name: "Dashboard",
    path: "dashboard",
    icon: LayoutDashboard,
    element: Dashboard,
    moduleKey: "DASHBOARD",
  },
  {
    name: "Service",
    path: "service",
    icon: HandPlatter,
    element: Service,
    moduleKey: "SERVICE",
  },
  {
    name: "Courses",
    path: "courses",
    icon: GraduationCap,
    element: BookingAndEnquiry,
    moduleKey: "COURSE",
  },
  {
    name: "Booking & Enquiry",
    path: "booking_enquiry",
    icon: CalendarDays,
    element: BookingAndEnquiry,
    moduleKey: "ORDER",
  },
  {
    name: "Products",
    path: "products",
    icon: Package,
    element: Products,
    moduleKey: "PRODUCT",
  },
  {
    name: "Students",
    path: "students",
    icon: User2,
    element: Students,
    moduleKey: "STUDENT",
  },
  {
    name: "Project & Clients",
    path: "project_and_clients",
    icon: FolderKanban,
    element: ProjectAndClient,
    moduleKey: "PROJECT",
  },
  {
    name: "User Management",
    path: "user_management",
    icon: Users,
    element: UserManagement,
    moduleKey: "COMPANY_USER",
  },
  {
    name: "Roles",
    path: "roles",
    icon: Shield, 
    element: Roles,
    moduleKey: "ROLE",
  },
  {
    name: "Web Settings",
    icon: Settings,
    children: [
      {
        name: "Home Page",
        path: "web-settings/home",
        element: HomePage,
        icon: House,
        moduleKey: "DASHBOARD",
      },
      {
        name: "Notification",
        path: "web-settings/notification",
        element: NotificationSettings,
        icon: Bell,
        moduleKey: "DASHBOARD",
      },
      {
        name: "Security",
        path: "web-settings/security",
        element: SecuritySettings,
        icon: FingerprintPattern,
        moduleKey: "DASHBOARD",
      },
      {
        name: "Gallery",
        path: "web-settings/gallery",
        element: Gallery,
        icon: GalleryThumbnails,
        moduleKey: "DASHBOARD",
      },
      {
        name: "Testimonial",
        path: 'web-settings/testimonials',
        element: Testimonial,
        icon: MessageCircleMore,
        moduleKey: "DASHBOARD",
      },
    ],
  },
];