import { useCallback, useEffect, useState } from "react";
import { getAllOrders } from "../service/orderApi";
import { getAllServiceEnrollments } from "../service/serviceEnrollmentApi";
import { getAllCourseEnrollments } from "../service/courseEnrollmentApi";
import { getAllRpcEnquiries } from "../service/rpcApi";
import { getAllAppointments } from "../service/appointmentApi";
import { getAllReplacements } from "../service/replacementApi";

export interface BookingNotification {
    key: string;           // unique — "PRODUCT-123"
    type: "PRODUCT" | "SERVICE" | "COURSE" | "RPC" | "APPOINTMENT" | "REPLACEMENT";
    message: string;
    timestamp: string;
    read: boolean;
}

const SEEN_KEY = "notif_seen_ids";
const POLL_INTERVAL_MS = 60000; // 1 min
const MAX_NOTIFICATIONS = 20;

const getSeenIds = (): Set<string> => {
    try {
        const raw = localStorage.getItem(SEEN_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
};

const saveSeenIds = (ids: Set<string>) => {
    localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(ids)));
};

export function useBookingNotifications() {
    const [notifications, setNotifications] = useState<BookingNotification[]>([]);
    const [_seenIds, setSeenIds] = useState<Set<string>>(() => getSeenIds());

    const fetchAll = useCallback(async () => {
        try {
            const [orders, services, courses, rpcs, appointments, replacements] = await Promise.all([
                getAllOrders().catch(() => []),
                getAllServiceEnrollments().catch(() => []),
                getAllCourseEnrollments().catch(() => []),
                getAllRpcEnquiries().catch(() => []),
                getAllAppointments().catch(() => []),
                getAllReplacements().catch(() => []),
            ]);

            const items: BookingNotification[] = [];

            orders.forEach((o: any) => items.push({
                key: `PRODUCT-${o.id}`,
                type: "PRODUCT",
                message: `New product booking ${o.orderId} from ${o.customerName}`,
                timestamp: o.orderedAt,
            } as BookingNotification));

            services.forEach((s: any) => items.push({
                key: `SERVICE-${s.id}`,
                type: "SERVICE",
                message: `New service booking ${s.serviceEnrollmentId} from ${s.fullName}`,
                timestamp: s.bookingDate ?? s.createdAt,
            } as BookingNotification));

            courses.forEach((c: any) => items.push({
                key: `COURSE-${c.id}`,
                type: "COURSE",
                message: `New course enrollment ${c.enrollmentId} — ${c.fullName} joined ${c.courseName}`,
                timestamp: c.enrolledAt,
            } as BookingNotification));

            rpcs.forEach((r: any) => items.push({
                key: `RPC-${r.id}`,
                type: "RPC",
                message: `New RPC enquiry ${r.enrollmentId} from ${r.username}`,
                timestamp: r.createdAt,
            } as BookingNotification));

            appointments.forEach((a: any) => items.push({
                key: `APPOINTMENT-${a.id}`,
                type: "APPOINTMENT",
                message: `New appointment ${a.appointmentId} — ${a.fullName} (${a.appointmentDate})`,
                timestamp: a.createdAt,
            } as BookingNotification));

            replacements.forEach((r: any) => items.push({
                key: `REPLACEMENT-${r.id}`,
                type: "REPLACEMENT",
                message: `New replacement request ${r.replacementId} for order ${r.orderId}`,
                timestamp: r.createdAt,
            } as BookingNotification));

            const currentSeen = getSeenIds();
            const withReadState = items
                .filter((i) => i.timestamp)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, MAX_NOTIFICATIONS)
                .map((i) => ({ ...i, read: currentSeen.has(i.key) }));

            setNotifications(withReadState);
        } catch (err) {
            console.error("Failed to fetch booking notifications", err);
        }
    }, []);

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchAll]);

    const markAsRead = (key: string) => {
        setSeenIds((prev) => {
            const next = new Set(prev);
            next.add(key);
            saveSeenIds(next);
            return next;
        });
        setNotifications((prev) => prev.map((n) => (n.key === key ? { ...n, read: true } : n)));
    };

    const markAllAsRead = () => {
        setSeenIds((prev) => {
            const next = new Set(prev);
            notifications.forEach((n) => next.add(n.key));
            saveSeenIds(next);
            return next;
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return { notifications, unreadCount, markAsRead, markAllAsRead };
}