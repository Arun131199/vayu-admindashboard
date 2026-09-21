import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Pencil } from "lucide-react";
import BreadCrump from "../../component/BreadCrump/BreadCrump";
import Button from "../../component/Buttons/Button";
import Table from "../../component/Table/Table";
import type { ColumnDef } from "../../component/Table/tableTypes";
import { defaultTableActionFeatures, type TableActionFeatures } from "../../utils/tableDataProps";
import { getAllRoles, deleteRole, type RoleRow } from "../../service/roleApi";
import { toast } from "sonner";

export default function Roles() {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<RoleRow[]>([]);
    const [loading, setLoading] = useState(true);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const data = await getAllRoles();
            setRoles(data);
        } catch (err: any) {
            toast.error("Failed to load roles", err)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
    }, []);

    const tableActionFeatures: TableActionFeatures = {
        ...defaultTableActionFeatures,
        showDateFilter: false,
        showExport: false,
        showImport: false,
        showCustomButton: false,
        showArchive: false,
        showView: false,
        showDelete: false,
        showEdit: false,
    };

    const columns = useMemo<ColumnDef<RoleRow>[]>(() => [
        {
            key: "id",
            header: "Role ID",
            accessor: "id",
            sortable: true,
            widthClassName: "w-24",
        },
        {
            key: "name",
            header: "Role Name",
            accessor: "name",
            sortable: true,
            widthClassName: "min-w-[220px]",
        },
        {
            key: "permissions",
            header: "Permissions",
            accessor: "permissions",
            sortable: true,
            widthClassName: "min-w-[240px]",
            cell: (row) => {
                const visiblePermissions = row.permissions?.slice(0, 3) ?? [];
                const remaining = (row.permissions?.length ?? 0) - visiblePermissions.length;

                return (
                    <div className="flex flex-wrap gap-2">
                        {visiblePermissions.map((permission) => (
                            <span
                                key={permission}
                                className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-medium text-blue-700"
                            >
                                {permission}
                            </span>
                        ))}
                        {remaining > 0 && (
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-700">
                                +{remaining}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            key: "status",
            header: "Status",
            accessor: (row) => (row.archived ? "Archived" : "Active"),
            sortable: true,
            widthClassName: "w-32",
            cell: (row) => (
                <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${row.archived
                        ? "bg-gray-100 text-gray-700"
                        : "bg-green-100 text-green-700"}
                    `}
                >
                    {row.archived ? "Archived" : "Active"}
                </span>
            ),
        },
    ], []);

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this role? This cannot be undone.")) return;
        try {
            const res = await deleteRole(id);
            if (res?.success) {
                loadRoles();
            } else {
                alert(res?.message || "Failed to delete role");
            }
        } catch (err: any) {
            alert(err?.response?.data?.message || "Failed to delete role");
        }
    };



    return (
        <main className="space-y-4">
            <section className="flex items-center justify-between">
                <BreadCrump title="Roles" subtitles="Manage reusable permission roles" />
                <Button buttonText="Add New Role" icon={Plus} onClick={() => navigate("add_role")} />
            </section>

            <section>
                <Table<RoleRow>
                    data={roles}
                    columns={columns}
                    rowKey={(row) => String(row.id)}
                    mode="client"
                    loading={loading}
                    tableActionFeatures={tableActionFeatures}
                    showRowActions={true}
                    onRefresh={loadRoles}
                    onViewRow={(row) => navigate(`edit_role/${row.id}`, { state: row })}
                    onEditRow={(row) => navigate(`edit_role/${row.id}`, { state: row })}
                    renderRowActions={(row) => (
                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => navigate(`edit_role/${row.id}`, { state: row })}
                                className="rounded-md border border-blue-200 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                                title="Edit role"
                            >
                                <Pencil size={14} />
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDelete(row.id)}
                                className="rounded-md border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                                title="Delete role"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                />
            </section>
        </main>
    );
}