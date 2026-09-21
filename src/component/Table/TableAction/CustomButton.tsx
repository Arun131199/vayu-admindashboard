import { useState, useRef, useEffect } from "react";
import type { customButtonProps } from "../../../utils/tableDataProps";

export default function CustomButton({ isDropDown, label, icon: Icon, options, onOptionSelect }: customButtonProps) {

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            {/* Button */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="bg-white px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 shadow-xl
                hover:text-yellow-500 hover:border-yellow dark:bg-gray-900 dark:text-white cursor-pointer
                inline-flex items-center gap-2 text-sm"
            >
                {Icon && <Icon size={16} />}
                {label}
            </button>

            {/* Dropdown */}
            {isDropDown && open && (
                <div className="
                absolute mt-2 w-40 
                bg-white dark:bg-gray-900 
                border border-gray-200 dark:border-gray-700 
                rounded-md shadow-lg
                z-50
                ">
                    {options?.map((value) => (
                        <button
                            type="button"
                            key={value.id}
                            onClick={() => {
                                onOptionSelect?.(value);
                                setOpen(false);
                            }}
                            className="
                            w-full text-left px-4 py-2 
                            hover:bg-gray-100 dark:hover:bg-gray-800
                            cursor-pointer dark:text-white
                            "
                        >
                            {value.label}
                        </button>
                    ))}
                </div>
            )}

        </div>
    );
}
