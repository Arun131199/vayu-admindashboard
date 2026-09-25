import { Plus, Shield, Users, Users2, UserSquare2 } from "lucide-react";
import BreadCrump from "../../component/BreadCrump/BreadCrump";
import Button from "../../component/Buttons/Button";
import StatusCard from "../../component/Cards/StatusCard";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../component/Table/Table";
import { defaultTableActionFeatures, type TableActionFeatures } from "../../utils/tableDataProps";
import type { ColumnDef } from "../../component/Table/tableTypes";
import { deleteCompanyUser, getAllCompanyUsers, type CompanyUserRow } from "../../service/companyUserApi";
import { toast } from "sonner";


export interface modulePermission {
    id: string;
    module: string;
    canImport: string;
    canExport: string;
    canCreate: string;
    canRead: string;
    canDelete: string;
}

export interface userData {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string,
    isOnline: boolean;
    permissions: modulePermission[];
}

export default function UserManagement() {

    const navigate = useNavigate();
    const [companyUsers, setCompanyUsers] = useState<CompanyUserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [_deleting, setDeleting] = useState(false);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getAllCompanyUsers();
            console.log(data)
            setCompanyUsers(data);
        } catch (err) {
            console.error("Failed to load company users", err);
        } finally {
            setLoading(false);
        }
    };

    const tableData: userData[] = useMemo(() => companyUsers.map((u) => ({
        id: String(u.id),
        name: u.name,
        email: u.email,
        role: u.roleName,
        status: u.active ? "Active" : "Inactive",
        isOnline: u.isOnline,   
        permissions: u.permissions.map((p) => ({
            id: p.module,
            module: p.module,
            canImport: String(p.canImport),
            canExport: String(p.canExport),
            canCreate: String(p.canCreate),
            canRead: String(p.canRead),
            canDelete: String(p.canDelete),
        })),
    })), [companyUsers]);

    const statusData = useMemo(() => {
        const total = companyUsers.length;
        const active = companyUsers.filter((u) => u.active).length;
        const superAdmins = companyUsers.filter((u) => u.roleName?.toUpperCase().includes("SUPER")).length;
        const staff = total - superAdmins;
        return [
            { id: 1, title: "Total Users", value: String(total), icon: Users2 },
            { id: 2, title: "Active Users", value: String(active), icon: Users },
            { id: 3, title: "Super Admins", value: String(superAdmins), icon: Shield },
            { id: 4, title: "Staff Members", value: String(staff), icon: UserSquare2 },
        ];
    }, [companyUsers]);

    const tableActionFeatures: TableActionFeatures = {
        ...defaultTableActionFeatures,
        showDateFilter: true,
        showEdit: true,
        showDelete: true,
    };

    const columns: ColumnDef<userData>[] = [
        {
            key: "id",
            header: "User ID",
            accessor: "id",
            sortable: true,
            widthClassName: "w-20",
        },
        {
            key: "name",
            header: "Name",
            accessor: "name",
            sortable: true,
        },
        {
            key: "email",
            header: "Email",
            accessor: "email",
            sortable: true,
        },
        {
            key: "role",
            header: "Role",
            accessor: "role",
            sortable: true,
            cell: (row) => (
                <p className="flex items-center gap-2 ">
                    <span className="text-green-500"><Shield size={16} /></span>
                    <span>{row.role}</span>
                </p>
            )
        },
        {
            key: "isOnline",
            header: "Active",
            accessor: (row) => (row.isOnline ? "Online" : "Offline"),
            widthClassName: "w-24",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${row.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{row.isOnline ? "Online" : "Offline"}</span>
                </div>
            )
        },
        {
            key: "status",
            header: "Status",
            accessor: "status",
            sortable: true,
            cell: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                    {row.status}
                </span>
            ),
        },
        {
            key: "permissions",
            header: "Permissions",
            accessor: "permissions",
            sortable: true,
            cell: (row) => {
                const uniqueModules = Array.from(new Set(row.permissions.map((p) => p.module)));
                const displayModules = uniqueModules.slice(0, 2);
                const remainingCount = uniqueModules.length - 2;
                return (
                    <div className="flex items-center gap-2 flex-wrap">
                        {displayModules.map((module) => (
                            <span key={module} className="px-4 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                                {module.toUpperCase()}
                            </span>
                        ))}
                        {remainingCount > 0 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                +{remainingCount}
                            </span>
                        )}
                    </div>
                );
            },
        }
    ];

    const deleteUsers = async (id: number) => {
        setDeleting(true)
        try {
            const res = await deleteCompanyUser(id)
            console.log(res)
            setDeleting(false);
            if (res?.success) {
                toast.success(`Selected user deleted successfully`)
                loadUsers();
            } else {
                toast.error(res?.message || "Failed to delete the user")
            }
        } catch (error: any) {
            setLoading(false);
            toast.error(error?.response?.data?.message || "Failed to delete users.Please Try Again")
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);
    return (
        <main className="space-y-4">
            <section className="flex items-center justify-between">
                <BreadCrump
                    title="User Management"
                    subtitles="Manage user accounts, roles, and permissions"
                />
                <Button
                    buttonText="Add New User"
                    icon={Plus}
                    onClick={() => navigate("../user_management/add_user")}
                />
            </section>
            <section>
                <StatusCard
                    data={statusData}
                    gridcount={4}
                    loading={loading}
                />
            </section>
            <section>
                <Table
                    data={tableData}
                    rowKey={(row) => row.id}
                    columns={columns}
                    mode="client"
                    loading={loading}
                    tableActionFeatures={tableActionFeatures}
                    showRowActions={true}
                    onViewRow={(row) => navigate(`../user_management/view_user/${row.id}`, { state: row })}
                    onEditRow={(row) => navigate(`../user_management/edit_user/${row.id}`, { state: row })}
                    onRefresh={loadUsers}
                    onDeleteRow={(row) => deleteUsers(parseInt(row.id))}
                />
            </section>
        </main>
    )
}
