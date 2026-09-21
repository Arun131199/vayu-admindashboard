import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../pages/Login/Login";
import OtpVerification from "../pages/Login/OtpVerification";
import UserManagement from "../pages/UserManagement/UserManagement";
import bookingAndEnquiryRoute from "./BookingAndEnquiry/bookingAndEnquiryRoute";
import coursesRoute from "./Courses/coursesRoute";
import productRoutes from "./Products/productRoutes";
import projectClientRoutes from "./ProjectClient/projectClientRoutes";
import ServiceRoute from "./Service/ServiceRoutes";
import studentRoute from "./Students/studentRoute";
import webSettingsRoute from "./WebSettings/webSettingsRoute";
import { ProtectedLayout } from "./ProtectedLayout";
import ViewUser from "../pages/UserManagement/ViewUser";
import AddUser from "../pages/UserManagement/Users/AddUser";
import Roles from "../pages/Roles/Roles";
import AddRole from "../pages/Roles/AddRole";
import Profile from "../pages/Profile/Profile";


const mainRoute = [
  {
    path: "/login",
    Component: Login
  },
  {
    path: "/verify-otp",
    Component: OtpVerification
  },
  {
    path: "/admin-dashboard",
    Component: ProtectedLayout,
    children: [
        {
            index:true,
            Component:Dashboard
        },
        {
            path:"dashboard",
            Component:Dashboard
        },
        {
          path:"profile",
          Component:Profile
        },
        ...ServiceRoute,
        ...coursesRoute,
        ...bookingAndEnquiryRoute,
        ...productRoutes,
        ...studentRoute,
       ...projectClientRoutes,
        {
          path:"user_management",
          Component:UserManagement
        },
        {
          path:"user_management/view_user/:id",
          Component:ViewUser
        },
        {
          path:"user_management/add_user",
          Component:AddUser
        },
        {
          path:"user_management/edit_user/:id",
          Component:AddUser
        },
        ...webSettingsRoute,
        {
          path:"roles",
          Component:Roles
        },
        {
          path:"roles/add_role",
          Component:AddRole
        },
        {
          path:"roles/edit_role/:id",
          Component:AddRole
        }
        
    ],
  },
  {
    path: "/",
    Component: () => {
      // Redirect root to login
      window.location.href = "/login";
      return null;
    }
  }
];



export default mainRoute;
