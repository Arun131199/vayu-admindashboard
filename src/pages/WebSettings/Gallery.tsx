import { Upload, Trash2, Filter, X } from "lucide-react";
import BreadCrump from "../../component/BreadCrump/BreadCrump";
import { useState, useRef, useEffect } from "react";
import galleryDummyData from "../../utils/dummydata/galleryData";

type imageType = {
    id: number;
    imgae_category: string;
    image_url: string
}

type PendingUpload = {
    file: File;
    preview: string;
}

const filterTypeData = [
    {
        label: "All",
        value: "all"
    },
    {
        label: "Expo",
        value: "expo"
    },
    {
        label: "Events",
        value: "events"
    },
    {
        label: "Projects",
        value: "projects"
    },
    
]

export default function Gallery() {
    const [gallery, setGallery] = useState<imageType[]>(galleryDummyData);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [getFilterType, setFilterType] = useState("all");
    const [pendingFiles, setPendingFiles] = useState<PendingUpload[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("expo");
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [customCategory, setCustomCategory] = useState("");

    // Load gallery from localStorage on mount
    useEffect(() => {
        const savedGallery = localStorage.getItem("galleryImages");
        if (savedGallery) {
            try {
                setGallery(JSON.parse(savedGallery));
            } catch (error) {
                console.error("Error loading gallery:", error);
            }
        }
    }, []);

    // Save gallery to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("galleryImages", JSON.stringify(gallery));
    }, [gallery]);

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        const validFiles: PendingUpload[] = [];
        Array.from(files).forEach((file) => {
            if (file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    validFiles.push({
                        file,
                        preview: e.target?.result as string
                    });
                    if (validFiles.length === Array.from(files).filter(f => f.type.startsWith("image/")).length) {
                        setPendingFiles(validFiles);
                        setShowCategoryModal(true);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const handleUploadWithCategory = () => {
        const finalCategory = customCategory.trim() || selectedCategory;
        
        pendingFiles.forEach((file) => {
            const newImage: imageType = {
                id: Date.now() + Math.random(),
                imgae_category: finalCategory,
                image_url: file.preview,
            };
            setGallery((prev) => [newImage, ...prev]);
        });

        // Reset
        setPendingFiles([]);
        setShowCategoryModal(false);
        setCustomCategory("");
        setSelectedCategory("expo");
    };

    const handleSelectFiles = () => {
        fileInputRef.current?.click();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(e.target.files);
        e.target.value = "";
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDeleteImage = (id: number) => {
        setGallery((prev) => prev.filter((img) => img.id !== id));
    };

    const filteredGallery = getFilterType === "all" ? gallery : gallery.filter((item) => item.imgae_category.toLowerCase() === getFilterType)

    return (
        <main className="space-y-4">
            <section>
                <BreadCrump
                    title="Gallery Manager"
                    subtitles="Upload and manage your drone photography portfolio"
                />
            </section>
            <section
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl bg-white dark:bg-gray-900 p-10 transition-all duration-300 ${isDragging
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10"
                    : "border-gray-300 dark:border-gray-700 hover:border-yellow-500"
                    }`}
            >
                <div className="flex flex-col items-center justify-center text-center gap-5">
                    {/* Upload Icon */}
                    <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
                        <Upload size={40} className="text-yellow-500" />
                    </div>

                    {/* Text */}
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            Upload Your Images
                        </h2>

                        <p className="text-gray-500 dark:text-gray-400 max-w-md">
                            Drag and drop your drone photos here or click the button below to upload files.
                        </p>

                        <p className="text-sm text-gray-400">
                            JPG, PNG, WEBP • Max size 10MB
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSelectFiles}
                            className="px-5 cursor-pointer py-2 rounded-lg bg-yellow-500 text-black font-medium hover:bg-yellow-600 transition"
                        >
                            Select Files
                        </button>
                    </div>

                    {/* Hidden File Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleInputChange}
                        className="hidden"
                    />
                </div>
            </section>

            {/* Gallery Count */}
            <section className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Filter className="dark:text-white" size={20} />
                    {
                        filterTypeData.map((value, index) => (
                            <div key={index} className={`cursor-pointer px-4 py-2 rounded-lg transition-all
                            duration-300 ${getFilterType === value.value ? "bg-yellow-500 text-white"
                                    : "bg-gray-200 dark:bg-gray-800 dark:text-white"}`} onClick={() => setFilterType(value.value)}>
                                <p className="dark:text-white" >{value.label}</p>
                            </div>
                        ))
                    }
                </div>
                <div>
                    {gallery.length > 0 && (
                        <div className="flex items-center justify-between">
                            <p className="text-gray-600 dark:text-gray-400">
                                Total Images: <span className="font-bold text-yellow-500">{gallery.length}</span>
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {
                filteredGallery.length > 0 ? (
                    <section className="grid grid-cols-4 auto-rows-max gap-4">
                        {gallery.map((image, index) => {
                            let colSpan = "col-span-1";
                            let rowSpan = "row-span-1";

                            if (index === 0) {
                                colSpan = "col-span-1";
                                rowSpan = "row-span-2";
                            } else if (index === 1) {
                                colSpan = "col-span-2";
                                rowSpan = "row-span-1";
                            } else if (index === 2) {
                                colSpan = "col-span-1";
                                rowSpan = "row-span-2";
                            } else if (index === 3) {
                                colSpan = "col-span-1";
                                rowSpan = "row-span-1";
                            } else if (index === 4) {
                                colSpan = "col-span-2";
                                rowSpan = "row-span-1";
                            } else if (index === 5) {
                                colSpan = "col-span-1";
                                rowSpan = "row-span-1";
                            }

                            const heightClass =
                                index === 0 || index === 2
                                    ? "h-80"
                                    : index === 1 || index === 4
                                        ? "h-48"
                                        : "h-48";

                            return (
                                <div
                                    key={image.id}
                                    className={`${colSpan} ${rowSpan} relative group overflow-hidden rounded-lg shadow-lg cursor-pointer`}
                                >
                                    <img
                                        src={image.image_url}
                                        alt={image.imgae_category}
                                        className={`w-full ${heightClass} object-cover group-hover:scale-110 transition-transform duration-300`}
                                    />
                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-start justify-between p-3">
                                        <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            {image.imgae_category}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteImage(image.id)}
                                            className="bg-red-500 cursor-pointer text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                ) : (
                    <section className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">No images in gallery. Upload some images to get started!</p>
                    </section>
                )
            }

            {showCategoryModal && (
                <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl dark:bg-gray-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold dark:text-white">Add Images</h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setPendingFiles([]);
                                    setShowCategoryModal(false);
                                }}
                                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {pendingFiles.length} image{pendingFiles.length === 1 ? "" : "s"} selected
                            </p>
                            <select
                                value={selectedCategory}
                                onChange={(event) => setSelectedCategory(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700 dark:text-white"
                            >
                                {filterTypeData.filter((item) => item.value !== "all").map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                            <input
                                value={customCategory}
                                onChange={(event) => setCustomCategory(event.target.value)}
                                placeholder="Custom category"
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setPendingFiles([]);
                                    setShowCategoryModal(false);
                                }}
                                className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleUploadWithCategory}
                                className="rounded-lg bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </section>
            )}
        </main >
    )
}
