import { useEffect, useState } from "react";
import DashboardCard from "../../component/Cards/DashboardCard";
import StatusCard from "../../component/Cards/StatusCard";
import ReusableChart from "../../component/Chart/ReusableChart";
import BookingCards from "../../component/Cards/BookingCards";
import EnquriesCard from "../../component/Cards/EnquriesCard";
import { getDashboardOverview, type DashboardOverview } from "../../service/dashboardApi";
import { CalendarRange, Users, GraduationCap, Award } from "lucide-react";

export default function Dashboard() {
    const [overview, setOverview] = useState<DashboardOverview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await getDashboardOverview();
                setOverview(data);
            } catch (err) {
                console.error("Failed to load dashboard", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const statusData = [
        { id: 1, title: "Active Bookings", value: overview?.activeBookings ?? 0, icon: CalendarRange },
        { id: 2, title: "Total Users", value: overview?.totalUsers ?? 0, icon: Users },
        { id: 3, title: "Courses Enrolled", value: overview?.coursesEnrolledTotal ?? 0, icon: GraduationCap },
        { id: 4, title: "Students Trained", value: overview?.studentsTrainedTotal ?? 0, icon: Award },
    ];

    const coursesEnrolledSeries = [
        {
            name: "Enrolled",
            data: overview?.coursesEnrolledMonthly?.map((m) => m.count) ?? [],
        },
    ];
    const coursesEnrolledCategories = overview?.coursesEnrolledMonthly?.map((m) => m.month) ?? [];

    const trainedSeries = [
        {
            name: "Trained",
            data: overview?.studentsTrainedMonthly?.map((m) => m.count) ?? [],
        },
    ];
    const trainedCategories = overview?.studentsTrainedMonthly?.map((m) => m.month) ?? [];

    const bookingStatusEntries = Object.entries(overview?.bookingStatusBreakdown ?? {});
    const bookingStatusSeries = bookingStatusEntries.map(([, count]) => count);
    const bookingStatusLabels = bookingStatusEntries.map(([status]) => status.replace(/_/g, " "));

    const recentBookingsMapped = (overview?.recentBookings ?? []).map((b) => ({
        id: b.id,
        name: b.name,
        service: b.service,
        status: b.status?.toLowerCase(),
        createdAt: b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN") : "-",
    }));

    const recentEnquiriesMapped = (overview?.recentEnquiries ?? []).map((e) => ({
        id: e.id,
        name: e.name,
        mobile: e.email,
        message: e.status,
    }));

    return (
        <main className="flex flex-col space-y-5">
            <section className="flex flex-col space-y-4">
                <DashboardCard />
                <StatusCard data={statusData} gridcount={4} loading={loading} />
            </section>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ReusableChart
                    title="Courses Enrolled"
                    type="bar"
                    series={coursesEnrolledSeries}
                    categories={coursesEnrolledCategories}
                />
                <ReusableChart
                    title="Booking Status"
                    type="donut"
                    series={bookingStatusSeries}
                    labels={bookingStatusLabels}
                />
            </section>
            <section>
                <ReusableChart
                    title="Student Trained"
                    type="bar"
                    series={trainedSeries}
                    categories={trainedCategories}
                />
            </section>
            <section className="grid grid-cols-2 gap-4">
                <BookingCards
                    title="Recent Booking"
                    data={recentBookingsMapped}
                    loading={loading}
                />
                <EnquriesCard
                    title="Recent Enquries"
                    data={recentEnquiriesMapped}
                    loading={loading}
                />
            </section>
        </main>
    )
}