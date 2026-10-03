import { useEffect, useMemo, useState } from "react";
import {
    Bell,
    CheckCheck,
    RefreshCw,
} from "lucide-react";

import { getAllOrders, type OrderRow } from "../../service/orderApi";

import {
    getAllAppointments,
    type AppointmentRow,
} from "../../service/appointmentApi";

import {
    getAllServiceEnrollments,
    type ServiceEnrollmentRow,
} from "../../service/serviceEnrollmentApi";

import { toast } from "sonner";

type Notification = {
    id: string;
    message: string;
    type: string;
    createdAt: string;
    read: boolean;
};

const READ_KEY =
    "vayuratha_admin_read_notifications";

const getReadIds = () => {
    try {
        return new Set<string>(
            JSON.parse(
                localStorage.getItem(READ_KEY) ?? "[]"
            )
        );
    } catch {
        return new Set<string>();
    }
};

export default function Notifications() {
    const [items, setItems] = useState<
        Notification[]
    >([]);

    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("ALL");

    const loadNotifications = async () => {
        setLoading(true);

        try {
            const [
                orders,
                appointments,
                services,
            ] = await Promise.allSettled([
                getAllOrders(),
                getAllAppointments(),
                getAllServiceEnrollments(),
            ]);

            const next: Notification[] = [];

            if (orders.status === "fulfilled") {
                orders.value
                    .slice(0, 20)
                    .forEach((order: OrderRow) => {
                        next.push({
                            id: `order-${order.id}-${order.orderStatus}`,
                            message: `Order ${order.orderId} is ${order.orderStatus.replaceAll(
                                "_",
                                " "
                            )}`,
                            type: "ORDER",
                            createdAt: order.orderedAt,
                            read: false,
                        });
                    });
            }

            if (appointments.status === "fulfilled") {
                appointments.value
                    .slice(0, 20)
                    .forEach(
                        (appointment: AppointmentRow) => {
                            next.push({
                                id: `appointment-${appointment.id}-${appointment.status}`,
                                message: `${appointment.fullName} appointment is ${appointment.status.toLowerCase()}`,
                                type: "APPOINTMENT",
                                createdAt:
                                    appointment.updatedAt ||
                                    appointment.createdAt,
                                read: false,
                            });
                        }
                    );
            }

            if (services.status === "fulfilled") {
                services.value
                    .slice(0, 20)
                    .forEach(
                        (
                            service: ServiceEnrollmentRow
                        ) => {
                            next.push({
                                id: `service-${service.id}-${service.status}`,
                                message: `${service.serviceName} booking for ${service.fullName} is ${service.status
                                    .toLowerCase()
                                    .replaceAll("_", " ")}`,
                                type: "SERVICE",
                                createdAt:
                                    service.updatedAt ||
                                    service.createdAt,
                                read: false,
                            });
                        }
                    );
            }

            const readIds = getReadIds();

            const sorted = next
                .sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                )
                .map((item) => ({
                    ...item,
                    read: readIds.has(item.id),
                }));

            setItems(sorted);
        } catch (error) {
            console.error(error);
            toast.error(
                "Unable to load notifications"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadNotifications();
    }, []);

    // Refresh every minute
    useEffect(() => {
        const timer = window.setInterval(
            () => void loadNotifications(),
            60000
        );

        return () => window.clearInterval(timer);
    }, []);

    const visible = useMemo(() => {
        if (filter === "ALL") {
            return items;
        }

        return items.filter(
            (item) => item.type === filter
        );
    }, [items, filter]);

    const unread = items.filter(
        (item) => !item.read
    ).length;

    const markRead = (id: string) => {
        const readIds = getReadIds();

        readIds.add(id);

        localStorage.setItem(
            READ_KEY,
            JSON.stringify([...readIds])
        );

        setItems((current) =>
            current.map((item) =>
                item.id === id
                    ? { ...item, read: true }
                    : item
            )
        );
    };

    const markAllRead = () => {
        const readIds = getReadIds();

        items.forEach((item) =>
            readIds.add(item.id)
        );

        localStorage.setItem(
            READ_KEY,
            JSON.stringify([...readIds])
        );

        setItems((current) =>
            current.map((item) => ({
                ...item,
                read: true,
            }))
        );
    };

    return (
        <main className="space-y-5">
            {/* Header */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-yellow-100 p-2 text-yellow-700">
                            <Bell size={21} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Notification Center
                            </h1>

                            <p className="text-sm text-gray-500">
                                Business activity from orders,
                                appointments and service bookings.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={markAllRead}
                            disabled={!unread}
                            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-40"
                        >
                            <CheckCheck size={16} />
                            Mark all read
                        </button>

                        <button
                            onClick={() =>
                                void loadNotifications()
                            }
                            className="rounded-xl border p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <RefreshCw
                                size={16}
                                className={
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }
                            />
                        </button>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex gap-2 overflow-x-auto border-b p-4 dark:border-gray-800">
                    {[
                        "ALL",
                        "ORDER",
                        "SERVICE",
                        "APPOINTMENT",
                    ].map((key) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`rounded-full px-4 py-2 text-xs font-bold ${filter === key
                                    ? "bg-yellow-400 text-gray-950"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                }`}
                        >
                            {key === "ALL"
                                ? `All (${items.length})`
                                : `${key
                                    .charAt(0)
                                    .toUpperCase()}${key
                                        .slice(1)
                                        .toLowerCase()} (${items.filter(
                                            (item) =>
                                                item.type === key
                                        ).length})`}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="divide-y dark:divide-gray-800">
                    {visible.length === 0 ? (
                        <div className="p-10 text-center text-sm text-gray-500">
                            No notifications found.
                        </div>
                    ) : (
                        visible.map((item) => (
                            <button
                                key={item.id}
                                onClick={() =>
                                    markRead(item.id)
                                }
                                className={`flex w-full items-start gap-4 p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!item.read
                                        ? "bg-yellow-50/50 dark:bg-yellow-950/10"
                                        : ""
                                    }`}
                            >
                                <span
                                    className={`mt-1 h-2.5 w-2.5 rounded-full ${item.read
                                            ? "bg-gray-300"
                                            : "bg-yellow-500"
                                        }`}
                                />

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                        {item.message}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {new Date(
                                            item.createdAt
                                        ).toLocaleString("en-IN")}
                                    </p>
                                </div>

                                <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                    {item.type}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
}