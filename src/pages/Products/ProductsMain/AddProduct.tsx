import { useLocation, useNavigate, useParams } from "react-router-dom";
import BreadCrump from "../../../component/BreadCrump/BreadCrump";
import { ArrowLeft, CaseSensitive, ChartBarStacked, ImagePlus, IndianRupee, Save } from "lucide-react";
import AllInputFields from "../../../component/AllInputFields/AllInputFields";
import { useEffect, useState } from "react";
import Button from "../../../component/Buttons/Button";
import ConfirmationPopup from "../../../component/Popup/ConfirmationPopup";
import { createProduct, updateProduct, markNewArrival, removeNewArrival, type ProductRow } from "../../../service/productApi";

export default function AddProduct() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const product = state?.product as ProductRow | undefined;
    const { id } = useParams();
    const isEdit = Boolean(id);

    const breadCrumpOption = [
        { id: 1, label: "Products", onClick: () => navigate(-1) },
        { id: 2, label: isEdit ? "Edit Product" : "Add New Product", onClick: () => navigate(0) }
    ];

    const [formData, setFormData] = useState({
        product_name: "",
        category: "",
        brand: "",
        price: "",
        discount_price: "",
        stock: "",
        highlights: "",
        description: "",
        specifications: "",
        is_featured: false,
        is_new_arrival: false,
    });

    const [mainImage, setMainImage] = useState<{ file: File; preview: string } | null>(null);
    const [additionalImages, setAdditionalImages] = useState<{ file: File, preview: string }[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openConfirmation, setOpenConfirmation] = useState(false);

    useEffect(() => {
        if (!isEdit || !product) return;

        setFormData({
            product_name: product.productName || "",
            category: product.category || "",
            brand: product.brand || "",
            price: String(product.price ?? ""),
            discount_price: product.discountPrice != null ? String(product.discountPrice) : "",
            stock: String(product.stock ?? ""),
            highlights: (product.highlights ?? []).join("\n"),
            description: product.description || "",
            specifications: Object.entries(product.specifications ?? {})
                .map(([k, v]) => `${k}: ${v}`)
                .join("\n"),
            is_featured: product.featured ?? false,
            is_new_arrival: product.newArrival ?? false,
        });
    }, [product, isEdit]);

    const parseSpecifications = (text: string): Record<string, string> => {
        const specs: Record<string, string> = {};
        text.split("\n").forEach((line) => {
            const idx = line.indexOf(":");
            if (idx === -1) return;
            const key = line.slice(0, idx).trim();
            const value = line.slice(idx + 1).trim();
            if (key && value) specs[key] = value;
        });
        return specs;
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);

        const payload = {
            productName: formData.product_name,
            description: formData.description,
            price: Number(formData.price),
            discountPrice: formData.discount_price ? Number(formData.discount_price) : undefined,
            stock: Number(formData.stock),
            category: formData.category,
            brand: formData.brand,
            highlights: formData.highlights.split("\n").map((s) => s.trim()).filter(Boolean),
            specifications: parseSpecifications(formData.specifications),
            isFeatured: formData.is_featured,
            isNewArrival: formData.is_new_arrival,
        };

        try {
            const result = isEdit && product
                ? await updateProduct(product.id, payload, mainImage?.file, additionalImages.map((i) => i.file))
                : await createProduct(payload, mainImage?.file, additionalImages.map((i) => i.file));

            if (result.success === false) {
                setError(result.message || "Failed to save product");
                setSubmitting(false);
                return;
            }
            const savedProductId = result.data?.id ?? product?.id;

            if (savedProductId) {
                try {
                    if (formData.is_new_arrival) {
                        await markNewArrival(savedProductId, 30);
                    } else if (isEdit) {
                        await removeNewArrival(savedProductId);
                    }
                } catch (arrivalErr) {
                    console.error("Failed to update new-arrival status", arrivalErr);
                }
            }

            setOpenConfirmation(true);
        } catch (err) {
            setError("Failed to save product. Please check the fields and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="space-y-4">
            <section className="flex space-x-4 items-center">
                <ArrowLeft className="dark:text-white cursor-pointer" onClick={() => navigate(-1)} />
                <BreadCrump
                    title={isEdit ? "Edit Product" : "Add New Product"}
                    subtitles={isEdit ? "Update product details" : "Create a new drone product"}
                    options={breadCrumpOption}
                    breadCrumpActive={true}
                />
            </section>
            <section className="border dark:border-gray-700 shadow-xl rounded-md p-4 border-gray-300 bg-white dark:bg-gray-900">
                {error && <p className="text-red-500 mb-3">{error}</p>}
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <AllInputFields
                            label="Product Name"
                            labelFor="product_name"
                            name="product_name"
                            placeholder="Enter product name"
                            type="text"
                            required={true}
                            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                            icon={CaseSensitive}
                            value={formData.product_name}
                        />
                        <AllInputFields
                            label="Category"
                            labelFor="category"
                            name="category"
                            placeholder="Select the category"
                            type="text"
                            required={true}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            icon={ChartBarStacked}
                            value={formData.category}
                            isDropDown={true}
                            options={[
                                { label: "Drone", value: "DRONE" },
                                { label: "Spare Parts", value: "SPARE_PARTS" },
                                { label: "Accessories", value: "ACCESSORIES" },
                                { label: "Batteries", value: "BATTERIES" },
                                { label: "Cameras", value: "CAMERAS" },
                                { label: "Controllers", value: "CONTROLLERS" },
                                { label: "Other", value: "OTHER" }
                            ]}
                        />
                        <AllInputFields
                            label="Brand"
                            labelFor="brand"
                            name="brand"
                            placeholder="Enter brand name"
                            type="text"
                            required={true}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            icon={CaseSensitive}
                            value={formData.brand}
                        />
                        <AllInputFields
                            label="Price"
                            labelFor="price"
                            name="price"
                            placeholder="Enter product price in INR"
                            type="number"
                            required={true}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            icon={IndianRupee}
                            value={formData.price}
                        />
                        <AllInputFields
                            label="Discount Price"
                            labelFor="discount_price"
                            name="discount_price"
                            placeholder="Enter discounted price (optional)"
                            type="number"
                            required={false}
                            onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                            icon={IndianRupee}
                            value={formData.discount_price}
                        />
                        <AllInputFields
                            label="Stock Quantity"
                            labelFor="stock"
                            name="stock"
                            placeholder="Enter product stock quantity"
                            type="number"
                            required={true}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            icon={CaseSensitive}
                            value={formData.stock}
                        />
                        <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3">
                            <input
                                type="checkbox"
                                id="is_featured"
                                checked={formData.is_featured}
                                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                className="w-4 h-4 accent-yellow-500"
                            />
                            <label htmlFor="is_featured" className="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer">
                                Mark as Featured Product
                            </label>
                        </div>
                        <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3">
                            <input
                                type="checkbox"
                                id="is_new_arrival"
                                checked={formData.is_new_arrival}
                                onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                                className="w-4 h-4 accent-yellow-500"
                            />
                            <label htmlFor="is_new_arrival" className="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer">
                                Mark as New Arrival
                            </label>
                        </div>
                        <AllInputFields
                            label="Main Product Image"
                            labelFor="main_image"
                            name="main_image"
                            placeholder="Upload product image"
                            type="file"
                            required={!isEdit}
                            onChange={(e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                setMainImage(file ? { file, preview: URL.createObjectURL(file) } : null);
                            }}
                            icon={ImagePlus}
                            value=""
                        />
                    </div>
                    <div>
                        <AllInputFields
                            label="Description"
                            labelFor="description"
                            name="description"
                            placeholder="Enter the description about the product"
                            type="textarea"
                            required={true}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <AllInputFields
                            label="Highlights (one per line)"
                            labelFor="highlights"
                            name="highlights"
                            placeholder="e.g. 4K Camera&#10;30 min flight time"
                            type="textarea"
                            required={true}
                            value={formData.highlights}
                            onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                        />
                        <AllInputFields
                            label="Specifications (key: value, one per line)"
                            labelFor="specifications"
                            name="specifications"
                            placeholder="e.g. Weight: 250g&#10;Range: 5km"
                            type="textarea"
                            required={false}
                            value={formData.specifications}
                            onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                        />
                        <AllInputFields
                            label="Upload Additional Images"
                            labelFor="additional_images"
                            name="additional_images"
                            placeholder="Add Additional Images"
                            icon={ImagePlus}
                            required={false}
                            value=""
                            multiple={true}
                            accept="image/*"
                            type="file"
                            onChange={(e) => {
                                const files = (e.target as HTMLInputElement).files;
                                if (!files) return;
                                const newImages = Array.from(files).map((file: File) => ({
                                    file,
                                    preview: URL.createObjectURL(file)
                                }));
                                setAdditionalImages((prev) => [...prev, ...newImages]);
                            }}
                        />
                        {mainImage && (
                            <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Main image preview</p>
                                <img src={mainImage.preview} alt="main preview" className="w-40 h-28 object-cover rounded-lg border" />
                            </div>
                        )}
                        {isEdit && !mainImage && product?.mainImage && (
                            <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Current image</p>
                                <img src={product.mainImage} alt="current" className="w-40 h-28 object-cover rounded-lg border" />
                            </div>
                        )}
                        {additionalImages.length > 0 && (
                            <div className="grid grid-cols-4 gap-4 mt-3">
                                {additionalImages.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img src={img.preview} alt="preview" className="w-full h-24 object-cover rounded-lg border" />
                                        <button
                                            type="button"
                                            onClick={() => setAdditionalImages(additionalImages.filter((_, i) => i !== index))}
                                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-end justify-center space-y-5 mt-4">
                        <Button
                            buttonText={submitting ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
                            icon={Save}
                            type="submit"
                        />
                    </div>
                </form>
            </section>
            {openConfirmation && (
                <ConfirmationPopup
                    open={openConfirmation}
                    type="success"
                    title={isEdit ? "Product Updated" : "New Product Added"}
                    message={
                        isEdit
                            ? "Product has been updated successfully."
                            : "New product has been added successfully."
                    }
                    onClose={() => setOpenConfirmation(false)}
                    onConfirm={() => { setOpenConfirmation(false); navigate(-1); }}
                    autoClose
                    showCancelButton={false}
                    confirmButtonText="Dismiss"
                    showProgressBar
                    progressDuration={3000}
                />
            )}
        </main>
    );
}