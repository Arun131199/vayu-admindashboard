import { X } from "lucide-react";
import { useEffect } from "react";

type ModalProps = {
    open: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    size?: "sm" | "md" | "lg";
};

export default function Modal({ open, title, children, onClose, size = "md" }: ModalProps) {
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    const sizeClass =
        size === "sm" ? "max-w-md" : size === "lg" ? "max-w-4xl" : "max-w-2xl";

    return (
        <div className="fixed inset-0 z-100">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    className={[
                        "w-full",
                        sizeClass,
                        "rounded-xl border border-gray-200 dark:border-gray-700",
                        "bg-white dark:bg-gray-900",
                        "shadow-2xl"
                    ].join(" ")}
                >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="font-semibold text-lg dark:text-white">{title}</div>
                        <button
                            className="p-2 cursor-pointer rounded-md border border-gray-200 dark:border-gray-700 dark:text-white"
                            onClick={onClose}
                            aria-label="Close modal"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="p-5">{children}</div>
                </div>
            </div>
        </div>
    );
}

