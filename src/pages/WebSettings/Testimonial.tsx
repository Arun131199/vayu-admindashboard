import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, BookOpenCheck, Shield, RefreshCw, Plus, Trash2, Eye, EyeOff, CalendarDays, X } from "lucide-react";
import BreadCrump from "../../component/BreadCrump/BreadCrump";
import StatusCard from "../../component/Cards/StatusCard";
import Button from "../../component/Buttons/Button";
import { toast } from "sonner";
import {
    getAllTestimonials,
    importFromGoogle,
    toggleTestimonialVisibility,
    deleteTestimonial,
    type TestimonialRow,
} from "../../service/testimonialApi";

export default function Testimonial() {
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState("");
    const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const loadTestimonials = async () => {
        setLoading(true);
        try {
            const data = await getAllTestimonials();
            setTestimonials(data);
        } catch {
            toast.error("Error fetching testimonials");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTestimonials();
    }, []);

    const handleImportFromGoogle = async () => {
        setImporting(true);
        try {
            const res = await importFromGoogle();
            if (res?.success) {
                toast.success(res.message || "Reviews imported successfully");
                loadTestimonials();
            } else {
                toast.error(res?.message || "Failed to import reviews");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to import reviews");
        } finally {
            setImporting(false);
        }
    };

    const handleToggleVisibility = async (id: number) => {
        try {
            const res = await toggleTestimonialVisibility(id);
            if (res?.success) {
                toast.success("Visibility updated");
                loadTestimonials();
            } else {
                toast.error(res?.message || "Failed to update visibility");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update visibility");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this testimonial? This cannot be undone.")) return;
        try {
            const res = await deleteTestimonial(id);
            if (res?.success) {
                toast.success("Testimonial deleted");
                loadTestimonials();
            } else {
                toast.error(res?.message || "Failed to delete testimonial");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to delete testimonial");
        }
    };

    const getDateOnly = (value: string) => {
        const isoDate = value.split("T")[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;

        const parsedDate = new Date(value);
        return Number.isNaN(parsedDate.getTime()) ? "" : parsedDate.toISOString().split("T")[0];
    };

    const filteredTestimonials = testimonials.filter((review) => {
        const search = searchValue.trim().toLowerCase();
        const matchesSearch = !search || (
            review.authorName.toLowerCase().includes(search) ||
            review.text.toLowerCase().includes(search) ||
            review.rating.toString().includes(search)
        );

        const reviewDate = getDateOnly(review.createdAt);
        const matchesStartDate = !startDate || (reviewDate !== "" && reviewDate >= startDate);
        const matchesEndDate = !endDate || (reviewDate !== "" && reviewDate <= endDate);

        return matchesSearch && matchesStartDate && matchesEndDate;
    });

    const clearFilters = () => {
        setSearchValue("");
        setStartDate("");
        setEndDate("");
    };

    const avgRating = testimonials.length > 0
        ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
        : "0";

    const statusData = [
        { id: 1, title: "Total Testimonials", value: testimonials.length.toString(), icon: Star },
        { id: 2, title: "Visible", value: testimonials.filter((t) => t.isVisible).length.toString(), icon: BookOpenCheck },
        { id: 3, title: "Avg. Rating", value: avgRating, icon: Shield },
    ];

    return (
        <main className="space-y-4">
            <section className="flex items-center justify-between">
                <BreadCrump
                    title="Testimonials Management"
                    subtitles="Manage Google customer reviews and testimonials"
                />
                <div className="flex items-center gap-3">
                    <Button
                        buttonText={importing ? "Importing..." : "Import from Google"}
                        icon={RefreshCw}
                        onClick={handleImportFromGoogle}
                    />
                    <Button
                        buttonText="Add Manual"
                        icon={Plus}
                        onClick={() => navigate("../testimonials/add_testimonials")}
                    />
                </div>
            </section>

            <section>
                <StatusCard gridcount={3} data={statusData} loading={loading} />
            </section>

            <section>
                <div className="flex w-full flex-col gap-3 xl:flex-row">
                    <div className="flex w-full items-center gap-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 rounded-lg shadow-xl focus-within:ring-2 focus-within:ring-yellow-500 xl:w-[40%]">
                        <Search className="text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            value={searchValue}
                            placeholder="Search testimonials..."
                            className="w-full bg-transparent outline-none border-none text-gray-800 dark:text-white placeholder:text-gray-400"
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                            <CalendarDays size={16} />
                            <span>From</span>
                            <input
                                type="date"
                                value={startDate}
                                max={endDate || undefined}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent text-gray-800 outline-none dark:text-white"
                                aria-label="Filter testimonials from date"
                            />
                        </label>
                        <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                            <CalendarDays size={16} />
                            <span>To</span>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate || undefined}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent text-gray-800 outline-none dark:text-white"
                                aria-label="Filter testimonials to date"
                            />
                        </label>
                        {(searchValue || startDate || endDate) && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <X size={16} />
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <section>
                {loading ? (
                    <div className="flex items-center justify-center min-h-50 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                    </div>
                ) : filteredTestimonials.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTestimonials.map((review) => (
                            <div key={review.id} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg p-4 shadow-xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {review.authorPhotoUrl ? (
                                            <img src={review.authorPhotoUrl} alt={review.authorName} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-semibold">
                                                {review.authorName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{review.authorName}</p>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} size={12} className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${review.source === "GOOGLE" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                                        {review.source}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">{review.text}</p>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <span className={`text-xs font-medium ${review.isVisible ? "text-green-600" : "text-gray-400"}`}>
                                        {review.isVisible ? "Visible" : "Hidden"}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleToggleVisibility(review.id)} title={review.isVisible ? "Hide" : "Show"}>
                                            {review.isVisible ? <Eye size={16} className="text-gray-500" /> : <EyeOff size={16} className="text-gray-400" />}
                                        </button>
                                        <button onClick={() => navigate(`../testimonials/edit_testimonial/${review.id}`, { state: review })} className="text-blue-600 hover:underline text-xs">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(review.id)}>
                                            <Trash2 size={16} className="text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center min-h-50 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                        <p className="text-gray-500 dark:text-gray-400">
                            No testimonials found{searchValue && ` for "${searchValue}"`}
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}