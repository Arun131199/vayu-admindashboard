import { Hand, Star } from "lucide-react";
import SkeletonBlock from "../Skeleton/SkeletonBlock";
import useInitialLoading from "../../hooks/useInitialLoading";

type DashboardCardProps = {
    loading?: boolean;
};

export default function DashboardCard({ loading = false }: DashboardCardProps) {
    const initialLoading = useInitialLoading();
    const showSkeleton = loading || initialLoading;
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    if (showSkeleton) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl" aria-busy="true">
                <div className="space-y-4">
                    <SkeletonBlock className="h-7 w-64 max-w-full" />
                    <SkeletonBlock className="h-4 w-96 max-w-full" />
                </div>
                <SkeletonBlock className="absolute right-8 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full opacity-60" />
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-2xl 
    bg-gradient-to-r from-yellow-700 to-yellow-400 
    p-8 shadow-xl">

            {/* Content */}
            <div className="relative z-10">
                <h2 className="text-white text-2xl font-semibold flex items-center gap-3">
                    {getGreeting()}, Admin
                    <Hand className="w-6 h-6 animate-wave" />
                </h2>

                <p className="text-blue-100 mt-2 text-md">
                    Welcome to Vayuratha Dashboard. Here's what's happening today.
                </p>
            </div>

            {/* Background Star */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
                <Star size={140} className="text-white" />
            </div>

            {/* Wave Animation */}
            <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-10deg); }
        }
        .animate-wave {
          animation: wave 1.5s ease-in-out infinite;
          transform-origin: 70% 70%;
        }
      `}</style>

        </div>
    );
}
