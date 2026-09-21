import { useState } from "react";
import type { allInputFieldsProps } from "../../utils/AllinputFieldsProps";
import { Eye, EyeClosed } from "lucide-react";

export default function AllInputFields({
    icon: Icon,
    isDropDown,
    type = "text",
    placeholder,
    value = "",
    onChange,
    name,
    label,
    labelFor,
    required,
    error,
    multiple,
    accept,
    inputRef,
    options
}: allInputFieldsProps) {

    const inputId = labelFor || name;
    const isTextarea = type === "textarea";
    const isFileInput = type === "file";
    const isPasswordField = type === "password";
    const [showPassword, setShowPassword] = useState(false);
    const fieldClassName = `
        w-full rounded-lg border dark:border-gray-600 px-3 py-2 outline-none transition
        dark:bg-gray-900 dark:text-white
        ${error
            ? "border-red-500 focus:ring-2 focus:ring-red-400"
            : "border-gray-300 focus:ring-2 focus:ring-yellow-400"}
        ${Icon ? (isTextarea ? "pr-10" : "pr-10") : ""}
    `;

    const [open, setOpen] = useState(false);

    return (
        <section className="w-full">
            <div className="flex flex-col gap-1 w-full">

                {label && (
                    <label
                        htmlFor={inputId}
                        className="font-semibold text-black dark:text-white"
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                {/* ✅ DROPDOWN */}
                {isDropDown ? (
                    <div className="relative">
                        <div
                            onClick={() => setOpen(!open)}
                            className={`${fieldClassName} cursor-pointer flex items-center justify-between`}
                        >
                            <span>
                                {options?.find((opt) => opt.value === value)?.label || "Select an option"}
                            </span>
                            {Icon && <Icon />}
                        </div>

                        {open && (
                            <div className="absolute w-full mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow z-10">
                                {options?.map((opt) => (
                                    <div
                                        key={opt.value}
                                        onClick={() => {
                                            onChange({
                                                target: { name, value: opt.value }
                                            } as any);
                                            setOpen(false);
                                        }}
                                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
                                    >
                                        {opt.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ✅ INPUT / TEXTAREA */
                    <div className="relative w-full">
                        {isTextarea ? (
                            <textarea
                                id={inputId}
                                placeholder={placeholder}
                                value={value}
                                onChange={onChange}
                                name={name}
                                required={required}
                                rows={4}
                                className={`${fieldClassName} resize-none`}
                            />
                        ) : (
                            <input
                                ref={inputRef}
                                id={inputId}
                                type={isPasswordField ? (showPassword ? "text" : "password") : type}
                                placeholder={placeholder}
                                value={isFileInput ? undefined : value}
                                onChange={onChange}
                                name={name}
                                required={required}
                                multiple={multiple}
                                accept={accept}
                                className={fieldClassName}
                            />
                        )}

                        {/* ✅ PASSWORD TOGGLE ICON */}
                        {isPasswordField ? (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                            >
                                {showPassword ? (
                                    <Eye size={20} />
                                ) : (
                                    <EyeClosed size={20} />
                                )}
                            </button>
                        ) : Icon && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Icon />
                            </span>
                        )}
                    </div>
                )}

                {error && (
                    <span className="text-sm text-red-500 mt-1">{error}</span>
                )}
            </div>
        </section>
    );
}
