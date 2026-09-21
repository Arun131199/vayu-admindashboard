import { X, AlertTriangle, CheckCircle, Info, AlertCircle, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
type ConfirmationPopupType = "danger" | "warning" | "success" | "info";

interface PopupProps {
    open: boolean;
    type?: ConfirmationPopupType;
    icon?: LucideIcon;
    title: string;
    message: string;
    closeButtonText?: string;
    confirmButtonText?: string;
    onClose: () => void;
    onConfirm: () => void;
    confirmDisabled?: boolean;
    loading?: boolean;
    showCloseButton?: boolean;
    showCancelButton?: boolean;
    children?: React.ReactNode;
    size?: "sm" | "md" | "lg";
    position?: "center" | "top" | "bottom";
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    showProgressBar?: boolean;
    progressDuration?: number; // in milliseconds
    autoClose?: boolean;
}

const typeStyles: Record<ConfirmationPopupType, {
    iconBg: string;
    iconText: string;
    confirmButton: string;
    borderColor: string;
    progressBg: string;
    iconComponent: LucideIcon;
}> = {
    danger: {
        iconBg: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-950/60",
        iconText: "text-red-600 dark:text-red-400",
        confirmButton: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-200 dark:shadow-red-950/30",
        borderColor: "border-red-200 dark:border-red-900/50",
        progressBg: "bg-gradient-to-r from-red-500 to-red-600",
        iconComponent: AlertCircle
    },
    warning: {
        iconBg: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-950/60",
        iconText: "text-amber-600 dark:text-amber-400",
        confirmButton: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-200 dark:shadow-amber-950/30",
        borderColor: "border-amber-200 dark:border-amber-900/50",
        progressBg: "bg-gradient-to-r from-amber-500 to-amber-600",
        iconComponent: AlertTriangle
    },
    success: {
        iconBg: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-950/60",
        iconText: "text-emerald-600 dark:text-emerald-400",
        confirmButton: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-950/30",
        borderColor: "border-emerald-200 dark:border-emerald-900/50",
        progressBg: "bg-gradient-to-r from-emerald-500 to-emerald-600",
        iconComponent: CheckCircle
    },
    info: {
        iconBg: "bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-950/40 dark:to-sky-950/60",
        iconText: "text-sky-600 dark:text-sky-400",
        confirmButton: "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg shadow-sky-200 dark:shadow-sky-950/30",
        borderColor: "border-sky-200 dark:border-sky-900/50",
        progressBg: "bg-gradient-to-r from-sky-500 to-sky-600",
        iconComponent: Info
    }
};

const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg"
};

const positionStyles = {
    center: "items-center",
    top: "items-start pt-20",
    bottom: "items-end pb-20"
};

export type { ConfirmationPopupType, PopupProps as ConfirmationPopupProps };

export default function ConfirmationPopup({
    open,
    type = "warning",
    icon: CustomIcon,
    title,
    message,
    closeButtonText = "Cancel",
    confirmButtonText = "Confirm",
    onClose,
    onConfirm,
    confirmDisabled = false,
    loading = false,
    showCloseButton = true,
    showCancelButton = true,
    children,
    size = "md",
    position = "center",
    closeOnClickOutside = true,
    closeOnEscape = true,
    showProgressBar = false,
    progressDuration = 5000,
    autoClose = false
}: PopupProps) {
    const cancelButtonRef = useRef<HTMLButtonElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const autoCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const styles = typeStyles[type];
    const DefaultIcon = styles.iconComponent;
    const IconComponent = CustomIcon || DefaultIcon;

    // Handle auto-close
    useEffect(() => {
        if (autoClose && open && !loading) {
            autoCloseTimeoutRef.current = setTimeout(() => {
                onClose();
            }, progressDuration);
        }

        return () => {
            if (autoCloseTimeoutRef.current) {
                clearTimeout(autoCloseTimeoutRef.current);
            }
        };
    }, [autoClose, open, loading, onClose, progressDuration]);

    // Handle keyboard events
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (closeOnEscape && event.key === "Escape" && !loading) {
                onClose();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [loading, onClose, open, closeOnEscape]);

    // Focus management
    useEffect(() => {
        if (open && cancelButtonRef.current) {
            cancelButtonRef.current.focus();
        }
    }, [open]);

    // Progress bar animation
    useEffect(() => {
        if (showProgressBar && open && !loading && progressBarRef.current) {
            const progressBar = progressBarRef.current;
            progressBar.style.animation = `progress-shrink ${progressDuration}ms linear forwards`;

            const onAnimationEnd = () => {
                if (autoClose) {
                    // Already handled by autoClose timeout
                }
            };

            progressBar.addEventListener('animationend', onAnimationEnd);
            return () => progressBar.removeEventListener('animationend', onAnimationEnd);
        }
    }, [showProgressBar, open, loading, progressDuration, autoClose]);

    if (!open) return null;

    const handleBackdropClick = () => {
        if (closeOnClickOutside && !loading) {
            onClose();
        }
    };

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-50"
                onClose={handleBackdropClick}
                initialFocus={cancelButtonRef}
            >
                <div className={`flex min-h-screen ${positionStyles[position]} justify-center p-4`}>
                    {/* Backdrop overlay with blur */}
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                            onClick={handleBackdropClick}
                        />
                    </Transition.Child>

                    {/* Modal panel */}
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95 translate-y-4"
                        enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100 translate-y-0"
                        leaveTo="opacity-0 scale-95 translate-y-4"
                    >
                        <Dialog.Panel
                            className={`relative w-full ${sizeStyles[size]} transform overflow-hidden rounded-2xl border ${styles.borderColor} bg-white shadow-2xl transition-all dark:bg-gray-900`}
                        >
                            {/* Progress bar */}
                            {showProgressBar && (
                                <div className="absolute left-0 right-0 top-0 h-1 overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-gray-800">
                                    <div
                                        ref={progressBarRef}
                                        className={`h-full ${styles.progressBg}`}
                                        style={{
                                            width: '100%',
                                            transformOrigin: 'left',
                                            animation: `progress-shrink ${progressDuration}ms linear forwards`
                                        }}
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className="relative">
                                <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 dark:border-gray-800">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="relative">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${styles.iconBg}`}>
                                                <IconComponent size={22} className={styles.iconText} />
                                            </div>
                                            {loading && (
                                                <div className="absolute -right-1 -top-1">
                                                    <Loader2 size={16} className="animate-spin text-gray-500" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Text content */}
                                        <div className="space-y-1.5">
                                            <Dialog.Title as="h2" className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {title}
                                            </Dialog.Title>
                                            <Dialog.Description as="p" className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                                {message}
                                            </Dialog.Description>
                                        </div>
                                    </div>

                                    {/* Close button */}
                                    {showCloseButton && (
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            disabled={loading}
                                            className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                            aria-label="Close confirmation popup"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>

                                {/* Custom children content */}
                                {children && (
                                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                            {children}
                                        </div>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex items-center justify-end gap-3 px-6 py-5">
                                    {showCancelButton && (
                                        <button
                                            ref={cancelButtonRef}
                                            type="button"
                                            onClick={onClose}
                                            disabled={loading}
                                            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 focus:outline-none  focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-amber-500 dark:hover:bg-amber-950/30 dark:hover:text-amber-400 dark:focus:ring-offset-gray-900"
                                        >
                                            {closeButtonText}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={onConfirm}
                                        disabled={confirmDisabled || loading}
                                        className={`cursor-pointer inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${styles.confirmButton}`}
                                    >
                                        {loading && <Loader2 size={16} className="animate-spin" />}
                                        {loading ? "Saving..." : confirmButtonText}
                                    </button>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>

            {/* Add keyframes for progress bar animation */}
            <style>{`
                @keyframes progress-shrink {
                    from {
                        transform: scaleX(1);
                    }
                    to {
                        transform: scaleX(0);
                    }
                }
            `}</style>
        </Transition>
    );
}