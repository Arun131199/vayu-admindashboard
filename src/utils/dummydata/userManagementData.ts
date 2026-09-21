import type { userData } from "../../pages/UserManagement/UserManagement";

export const userManagementData: userData[] = [
    {
        id: "USR001",
        name: "Arunkumar",
        email: "arunkumar.admin@gmail.com",
        role: "Super Admin",
        status: "Active",
        permissions: [
            {
                id: "PER001",
                module: "Dashboard",
                canImport: "Yes",
                canExport: "Yes",
                canCreate: "Yes",
                canRead: "Yes",
                canDelete: "Yes",
            },
            {
                id: "PER002",
                module: "Users",
                canImport: "Yes",
                canExport: "Yes",
                canCreate: "Yes",
                canRead: "Yes",
                canDelete: "Yes",
            }
        ]
    },
    {
        id: "USR002",
        name: "Priyadharshini",
        email: "priya.admin@gmail.com",
        role: "Admin",
        status: "Active",
        permissions: [
            {
                id: "PER003",
                module: "Reports",
                canImport: "No",
                canExport: "Yes",
                canCreate: "No",
                canRead: "Yes",
                canDelete: "No",
            },
            {
                id: "PER004",
                module: "Projects",
                canImport: "Yes",
                canExport: "Yes",
                canCreate: "Yes",
                canRead: "Yes",
                canDelete: "No",
            }
        ]
    },
    {
        id: "USR003",
        name: "Karthikeyan",
        email: "karthik.manager@gmail.com",
        role: "Manager",
        status: "Inactive",
        permissions: [
            {
                id: "PER005",
                module: "Team",
                canImport: "No",
                canExport: "No",
                canCreate: "Yes",
                canRead: "Yes",
                canDelete: "No",
            }
        ]
    },
    {
        id: "USR004",
        name: "Nivetha",
        email: "nivetha.editor@gmail.com",
        role: "Editor",
        status: "Active",
        permissions: [
            {
                id: "PER006",
                module: "Content",
                canImport: "Yes",
                canExport: "No",
                canCreate: "Yes",
                canRead: "Yes",
                canDelete: "No",
            }
        ]
    },
    {
        id: "USR005",
        name: "Vignesh",
        email: "vignesh.hr@gmail.com",
        role: "HR",
        status: "Active",
        permissions: [
            {
                id: "PER007",
                module: "Employees",
                canImport: "Yes",
                canExport: "Yes",
                canCreate: "Yes",
                canRead: "Yes",
                canDelete: "No",
            }
        ]
    },
    {
        id: "USR006",
        name: "Deepika",
        email: "deepika.accounts@gmail.com",
        role: "Accountant",
        status: "Active",
        permissions: [
            {
                id: "PER008",
                module: "Finance",
                canImport: "No",
                canExport: "Yes",
                canCreate: "No",
                canRead: "Yes",
                canDelete: "No",
            }
        ]
    },
    {
        id: "USR007",
        name: "Harish",
        email: "harish.support@gmail.com",
        role: "Support",
        status: "Inactive",
        permissions: [
            {
                id: "PER009",
                module: "Tickets",
                canImport: "No",
                canExport: "No",
                canCreate: "Yes",
                canRead: "Yes",
                canDelete: "No",
            }
        ]
    },
    {
        id: "USR008",
        name: "Sneha",
        email: "sneha.viewer@gmail.com",
        role: "Viewer",
        status: "Active",
        permissions: [
            {
                id: "PER010",
                module: "Dashboard",
                canImport: "No",
                canExport: "No",
                canCreate: "No",
                canRead: "Yes",
                canDelete: "No",
            }
        ]
    },
    {
        id: "USR009",
        name: "Ragul",
        email: "ragul.lead@gmail.com",
        role: "Project Lead",
        status: "Active",
        permissions: [
            {
                id: "PER011",
                module: "Tasks",
                canImport: "Yes",
                canExport: "Yes",
                canCreate: "Yes",
                canRead: "Yes",
                canDelete: "Yes",
            }
        ]
    },
    {
        id: "USR010",
        name: "Monisha",
        email: "monisha.analytics@gmail.com",
        role: "Data Analyst",
        status: "Active",
        permissions: [
            {
                id: "PER012",
                module: "Analytics",
                canImport: "No",
                canExport: "Yes",
                canCreate: "No",
                canRead: "Yes",
                canDelete: "No",
            }
        ]
    }
];