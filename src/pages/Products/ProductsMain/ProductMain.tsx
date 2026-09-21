import { Plus, Search, ShoppingCart, Calculator, Package, AlertTriangle, TrendingDown } from "lucide-react";
import Button from "../../../component/Buttons/Button";
import ProductCard from "../../../component/Cards/ProductCard";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import ConfirmationPopup from "../../../component/Popup/ConfirmationPopup";
import StatusCard from "../../../component/Cards/StatusCard";
import {
    getAllProducts,
    getArchivedProducts,
    deleteProduct,
    restoreProduct,
    getProductStats,
    type ProductRow,
    type ProductStats,
} from "../../../service/productApi";
import { useAuth } from "../../../context/AuthContext";

export default function ProductsMain() {
    const navigate = useNavigate();
    const { permissions } = useAuth();
    const [dataMode, setDataMode] = useState<"live" | "archived">("live");

    const canWrite = permissions?.includes("PRODUCT_WRITE");
    const canUpdate = permissions?.includes("PRODUCT_UPDATE");
    const canDelete = permissions?.includes("PRODUCT_DELETE");

    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [openSuccess, setOpenSuccess] = useState(false);
    const [targetProduct, setTargetProduct] = useState<ProductRow | null>(null);
    const [getSearchTerm, setSearchTerm] = useState("");

    const [products, setProducts] = useState<ProductRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [stats, setStats] = useState<ProductStats>({
        totalProducts: 0,
        activeProducts: 0,
        outOfStock: 0,
        lowStock: 0,
    });
    const [statsLoading, setStatsLoading] = useState(false);

    const statusData = useMemo(() => [
        { id: 1, title: "Total Products", value: String(stats.totalProducts), icon: Calculator },
        { id: 2, title: "Active Products", value: String(stats.activeProducts), icon: Package },
        { id: 3, title: "Out of Stock", value: String(stats.outOfStock), icon: AlertTriangle },
        { id: 4, title: "Low Stock", value: String(stats.lowStock), icon: TrendingDown }
    ], [stats]);

    const loadStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const data = await getProductStats();
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    const loadProducts = useCallback(async (mode: "live" | "archived") => {
        setLoading(true);
        setError(null);
        try {
            const data = mode === "live" ? await getAllProducts() : await getArchivedProducts();
            setProducts(data);
        } catch (err) {
            console.error(err);
            setError(mode === "live" ? "Failed to load products" : "Failed to load archived products");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts(dataMode);
        if (dataMode === "live") loadStats();
    }, [dataMode, loadProducts, loadStats]);

    const filteredProducts = products.filter((p) =>
        p.productName.toLowerCase().includes(getSearchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(getSearchTerm.toLowerCase())
    );

    const handleDeleteConfirm = async () => {
        if (!targetProduct) return;
        await deleteProduct(targetProduct.id);
        setOpenConfirmation(false);
        setOpenSuccess(true);
        await loadProducts("live");
        await loadStats();
    };

    const handleRestore = async (product: ProductRow) => {
        if (!confirm(`Restore "${product.productName}" back to live products?`)) return;
        await restoreProduct(product.id);
        await loadProducts("archived");
    };

    return (
        <main className="space-y-8">
            <section className="flex items-center justify-between">
                <div>
                    <p className="dark:text-white text-lg font-semibold">
                        {dataMode === "live" ? "Products" : "Archived Products"}
                    </p>
                    <p className="dark:text-white">
                        {dataMode === "live"
                            ? "Manage your drone products and inventory"
                            : "Products hidden from customers — restore anytime"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {dataMode === "live" ? (
                        <Button
                            buttonText="Show Archive"
                            varient="secondary"
                            onClick={() => setDataMode("archived")}
                        />
                    ) : (
                        <Button
                            buttonText="Back to Products"
                            varient="secondary"
                            onClick={() => setDataMode("live")}
                        />
                    )}
                    {dataMode === "live" && canWrite && (
                        <Button
                            buttonText="Add New Product"
                            icon={Plus}
                            varient="primary"
                            onClick={() => navigate("add-new-product")}
                        />
                    )}
                </div>
            </section>

            {error && <p className="text-red-500">{error}</p>}

            {dataMode === "live" && (
                <section>
                    <StatusCard data={statusData} gridcount={4} loading={statsLoading} />
                </section>
            )}

            <section>
                <div className="relative w-full max-w-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="text-gray-500 dark:text-gray-400" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                        bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500
                        dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 
                        dark:focus:ring-yellow-600"
                        value={getSearchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </section>

            <section>
                {loading ? (
                    <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
                ) : filteredProducts.length > 0 ? (
                    <ProductCard
                        data={filteredProducts.map((p) => ({
                            id: p.id,
                            type: p.category,
                            modelName: p.productName,
                            price: `₹${p.price.toLocaleString("en-IN")}`,
                            stock: p.stock,
                            status: p.stock === 0 ? "Out of Stock" : p.stock < 10 ? "Low Stock" : "In Stock",
                            imageUrl: p.mainImage ?? ""
                        }))}
                        onClickDelete={dataMode === "live" && canDelete ? (id) => {
                            const p = products.find((prod) => prod.id === Number(id));
                            if (p) {
                                setTargetProduct(p);
                                setOpenConfirmation(true);
                            }
                        } : undefined}
                        
                        onClickEdit={dataMode === "live" && canUpdate ? (id) => {
                            const p = products.find((prod) => prod.id === Number(id));
                            navigate(`edit-product/${id}`, { state: { product: p } });
                        } : dataMode === "archived" ? (id) => {
                            const p = products.find((prod) => prod.id === Number(id));
                            if (p) handleRestore(p);
                        } : undefined}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                            <ShoppingCart size={40} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                            No products found
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Try adjusting your search{dataMode === "live" ? " or add a new product" : ""}
                        </p>
                    </div>
                )}
            </section>

            {openConfirmation && (
                <ConfirmationPopup
                    open={openConfirmation}
                    title="Archive"
                    type="warning"
                    message={`Are you sure want to archive "${targetProduct?.productName}"? It will no longer be visible to customers.`}
                    onClose={() => setOpenConfirmation(false)}
                    closeButtonText="Cancel"
                    confirmButtonText="Archive"
                    onConfirm={handleDeleteConfirm}
                />
            )}
            {openSuccess && (
                <ConfirmationPopup
                    open={openSuccess}
                    type="success"
                    title="Archived"
                    message="Product has been archived successfully."
                    onClose={() => setOpenSuccess(false)}
                    closeButtonText="Dismiss"
                    confirmButtonText="OK"
                    onConfirm={() => setOpenSuccess(false)}
                />
            )}
        </main>
    );
}