import { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    MapPin,
    RefreshCw,
} from "lucide-react";

import {
    getAllAppointments,
    type AppointmentRow,
} from "../../service/appointmentApi";

import {
    getAllServiceEnrollments,
    type ServiceEnrollmentRow,
} from "../../service/serviceEnrollmentApi";

import {
    getAllRpcEnquiries,
    type RpcEnquiryRow,
} from "../../service/rpcApi";

import { toast } from "sonner";

type CalendarEvent = {
    id: string;
    title: string;
    date: string;
    time?: string;
    type: "Appointment" | "Service" | "RPC";
    status: string;
    subtitle: string;
};

const typeStyles: Record<
    CalendarEvent["type"],
    string
> = {
    Appointment:
        "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200",

    Service:
        "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",

    RPC:
        "border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-200",
};

const toDateKey = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(
        2,
        "0"
    )}`;
};

const formatMonth = (date: Date) =>
    date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
    });

export default function Calendar() {
    const [cursor, setCursor] = useState(() => new Date());

    const [events, setEvents] = useState<
        CalendarEvent[]
    >([]);

    const [loading, setLoading] = useState(true);

    const [selectedDate, setSelectedDate] = useState(
        () => toDateKey(new Date().toISOString())
    );

    const loadEvents = async () => {
        setLoading(true);

        try {
            const [
                appointments,
                services,
                rpc,
            ] = await Promise.allSettled([
                getAllAppointments(),
                getAllServiceEnrollments(),
                getAllRpcEnquiries(),
            ]);

            const next: CalendarEvent[] = [];

            if (appointments.status === "fulfilled") {
                appointments.value.forEach(
                    (item: AppointmentRow) => {
                        next.push({
                            id: `appointment-${item.id}`,
                            title: item.fullName,
                            date: toDateKey(item.appointmentDate),
                            time: item.appointmentTime,
                            type: "Appointment",
                            status: item.status,
                            subtitle: item.service,
                        });
                    }
                );
            }

            if (services.status === "fulfilled") {
                services.value.forEach(
                    (item: ServiceEnrollmentRow) => {
                        next.push({
                            id: `service-${item.id}`,
                            title: item.fullName,
                            date: toDateKey(item.bookingDate),
                            time: item.slotTime,
                            type: "Service",
                            status: item.status,
                            subtitle: item.serviceName,
                        });
                    }
                );
            }

            if (rpc.status === "fulfilled") {
                rpc.value.forEach(
                    (item: RpcEnquiryRow) => {
                        next.push({
                            id: `rpc-${item.id}`,
                            title: item.username,
                            date: toDateKey(item.createdAt),
                            type: "RPC",
                            status: item.status,
                            subtitle: "RPC Enrollment",
                        });
                    }
                );
            }

            setEvents(next);
        } catch (error) {
            console.error(error);
            toast.error("Unable to load calendar events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadEvents();
    }, []);

    const days = useMemo(() => {
        const year = cursor.getFullYear();
        const month = cursor.getMonth();

        const firstDay = new Date(year, month, 1);
        const startDay = firstDay.getDay();

        const totalDays = new Date(
            year,
            month + 1,
            0
        ).getDate();

        const cells: Array<Date | null> = [];

        for (let i = 0; i < startDay; i++) {
            cells.push(null);
        }

        for (let day = 1; day <= totalDays; day++) {
            cells.push(new Date(year, month, day));
        }

        while (cells.length % 7 !== 0) {
            cells.push(null);
        }

        return cells;
    }, [cursor]);

    const selectedEvents = events.filter(
        (event) => event.date === selectedDate
    );

    const goPreviousMonth = () => {
        setCursor(
            (current) =>
                new Date(
                    current.getFullYear(),
                    current.getMonth() - 1,
                    1
                )
        );
    };

    const goNextMonth = () => {
        setCursor(
            (current) =>
                new Date(
                    current.getFullYear(),
                    current.getMonth() + 1,
                    1
                )
        );
    };

    const goToday = () => {
        const today = new Date();

        setCursor(today);
        setSelectedDate(toDateKey(today.toISOString()));
    };

    return (
        <main className="space-y-5">
            {/* Header */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-yellow-100 p-2 text-yellow-700">
                            <CalendarDays size={22} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Operations Calendar
                            </h1>

                            <p className="text-sm text-gray-500">
                                Appointments, service bookings and RPC activity.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToday}
                            className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Today
                        </button>

                        <button
                            onClick={() => void loadEvents()}
                            className="rounded-xl border p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <RefreshCw
                                size={17}
                                className={loading ? "animate-spin" : ""}
                            />
                        </button>
                    </div>
                </div>
            </section>

            {/* Calendar */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b p-4 dark:border-gray-800">
                    <button
                        onClick={goPreviousMonth}
                        className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatMonth(cursor)}
                    </h2>

                    <button
                        onClick={goNextMonth}
                        className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-7 border-b dark:border-gray-800">
                    {[
                        "Sun",
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                    ].map((day) => (
                        <div
                            key={day}
                            className="p-3 text-center text-xs font-bold text-gray-500"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    {days.map((day, index) => {
                        if (!day) {
                            return (
                                <div
                                    key={`empty-${index}`}
                                    className="min-h-27.5 border-b border-r bg-gray-50/40 dark:border-gray-800 dark:bg-gray-950/30"
                                />
                            );
                        }

                        const dateKey = toDateKey(
                            day.toISOString()
                        );

                        const dayEvents = events.filter(
                            (event) => event.date === dateKey
                        );

                        const selected =
                            selectedDate === dateKey;

                        return (
                            <button
                                key={dateKey}
                                onClick={() =>
                                    setSelectedDate(dateKey)
                                }
                                className={`min-h-27.5 border-b border-r p-2 text-left transition dark:border-gray-800 ${selected
                                        ? "bg-yellow-50 dark:bg-yellow-950/20"
                                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    }`}
                            >
                                <div className="mb-2 flex justify-end">
                                    <span
                                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${selected
                                                ? "bg-yellow-400 text-gray-950"
                                                : "text-gray-600 dark:text-gray-300"
                                            }`}
                                    >
                                        {day.getDate()}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    {dayEvents
                                        .slice(0, 3)
                                        .map((event) => (
                                            <div
                                                key={event.id}
                                                className={`truncate rounded-md border px-2 py-1 text-[10px] font-semibold ${typeStyles[event.type]}`}
                                            >
                                                {event.title}
                                            </div>
                                        ))}

                                    {dayEvents.length > 3 && (
                                        <p className="text-[10px] text-gray-500">
                                            +{dayEvents.length - 3} more
                                        </p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Selected Day */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                    Selected Day
                </h2>

                {selectedEvents.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        No events for this date.
                    </p>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                        {selectedEvents.map((event) => (
                            <div
                                key={event.id}
                                className={`rounded-xl border p-4 ${typeStyles[event.type]}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-bold">
                                            {event.title}
                                        </p>

                                        <p className="mt-1 text-xs">
                                            {event.subtitle}
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-white/60 px-2 py-1 text-[10px] font-bold">
                                        {event.type}
                                    </span>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                                    {event.time && (
                                        <span className="flex items-center gap-1">
                                            <Clock3 size={13} />
                                            {event.time}
                                        </span>
                                    )}

                                    <span className="flex items-center gap-1">
                                        <MapPin size={13} />
                                        {event.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}