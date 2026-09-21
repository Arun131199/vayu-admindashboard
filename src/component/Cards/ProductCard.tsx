import { Pencil, Trash2 } from "lucide-react";
import SkeletonBlock from "../Skeleton/SkeletonBlock";
import useInitialLoading from "../../hooks/useInitialLoading";

type productDataProps = {
    type: string;
    modelName: string;
    price: string;
    stock: number;
    status: string;
    id: number | string;
    imageUrl: string;
}

type productData = {
    data: productDataProps[];
    onClickEdit?: (id: number | string) => void;
    onClickDelete?: (id: number | string) => void;
    loading?: boolean;
    skeletonCount?: number;
}

const getStatusBadgeStyle = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active' || statusLower === 'available' || statusLower=="in stock") {
        return {
            bg: 'bg-emerald-700/10',
            text: 'text-green-700'
        };
    } else if (statusLower === 'inactive' || statusLower === 'unavailable'||statusLower==="out of stock") {
        return {
            bg: 'bg-red-700/10',
            text: 'text-red-700'
        };
    }
    return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-700'
    };
};

export default function ProductCard({ data, onClickEdit, onClickDelete, loading = false, skeletonCount = 6 }: productData) {
    const initialLoading = useInitialLoading();
    const showSkeleton = loading || initialLoading;

    if (showSkeleton) {
        return (
            <main className="w-full" aria-busy="true">
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: skeletonCount }).map((_, index) => (
                        <div
                            key={`product-card-skeleton-${index}`}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden"
                        >
                            <SkeletonBlock className="h-52 w-full rounded-none" />
                            <div className="p-5">
                                <SkeletonBlock className="h-4 w-32 mb-2" />
                                <SkeletonBlock className="h-6 w-48 mb-5" />
                                <div className="flex items-end justify-between mb-5">
                                    <div className="space-y-2">
                                        <SkeletonBlock className="h-3 w-14" />
                                        <SkeletonBlock className="h-6 w-24" />
                                    </div>
                                    <div className="space-y-2">
                                        <SkeletonBlock className="h-3 w-14" />
                                        <SkeletonBlock className="h-6 w-12" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <SkeletonBlock className="h-11 flex-1 rounded-lg" />
                                    <SkeletonBlock className="h-11 w-11 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </main>
        );
    }

    return (
        <main className="w-full">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {
                    data.map((item) => {
                        const statusStyle = getStatusBadgeStyle(item.status);

                        return (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl 
                                         transition-all duration-300 ease-out overflow-hidden"
                            >
                                {/* Image Container */}
                                <div className="relative overflow-hidden bg-gray-100 dark:bg-slate-700 h-52">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.modelName}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                    {/* Status Badge */}
                                    <div className={`absolute top-4 right-4 px-4 py-.5 shadow-xl rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                                        <span className="text-sm font-bold">{item.status}</span>
                                    </div>
                                </div>

                                {/* Content Container */}
                                <div className="p-5">
                                    {/* Product Type and Name */}
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                                        {item.type}
                                    </p>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                        {item.modelName}
                                    </h3>

                                    {/* Price and Stock Info */}
                                    <div className="flex items-end justify-between mb-5">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-1">
                                                Price
                                            </p>
                                            <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                                                {item.price}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-1">
                                                Stock
                                            </p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                {item.stock}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={onClickEdit ? () => onClickEdit(item.id) : undefined}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                                                     border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                                                     font-semibold rounded-lg hover:border-yellow-500 hover:text-yellow-600 
                                                     dark:hover:border-yellow-400 dark:hover:text-yellow-400
                                                     transition-all duration-200 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 cursor-pointer"
                                        >
                                            <Pencil size={18} />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            onClick={onClickDelete ? () => onClickDelete(item.id) : undefined}
                                            className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 
                                                     rounded-lg hover:bg-red-600 hover:text-white dark:hover:bg-red-600 
                                                     dark:hover:text-white transition-all duration-200 flex items-center justify-center cursor-pointer"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
            </section>
        </main>
    )
}
