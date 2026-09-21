import type { universelButtonProps } from "../../../utils/tableDataProps";

export default function UniverselButton({ icon: Icon, onClick, label }: universelButtonProps) {
    return (
        <div className="relative group">
            <button
                type="button"
                onClick={onClick}
                aria-label={label ?? "Action"}
                title={label}
                className="
                flex items-center gap-2 
                border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-900
                px-4 py-2 rounded-md
                shadow-sm hover:shadow-md
                transition-all duration-200
                dark:text-white cursor-pointer
                "
            >
                {Icon && <Icon size={16} aria-hidden="true" focusable="false" />}
            </button>

            {/* Tooltip */}
            <span
                aria-hidden="true"
                className="
                absolute -top-10 left-1/2 -translate-x-1/2
                whitespace-nowrap
                bg-yellow-500 text-black font-semibold text-xs
                px-2 py-1 rounded-md
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
                pointer-events-none
                "
            >
                {label}
            </span>
        </div>
    );
}
