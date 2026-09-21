import type { buttonProps } from "../../utils/LoginInterfce";

export default function Button({ buttonText, icon: Icon, varient, onClick, type = "button" }: buttonProps) {
    const primaryColor = "bg-yellow-500 text-gray-800 transition-transform ease-in duration-200 dark:bg-gray-900 border border-transparent dark:text-yellow-500 dark:border-yellow-500"
    const secondaryColor = "bg-white border border-yellow-500 hover:scale-105 transition-transform ease-in duration-200  dark:bg-yellow-500 text-yellow-500 dark:text-gray-900"
    return (
        <button
            type={type}
            onClick={onClick}
            className={`flex items-center gap-4 border border-gray-300 rounded-lg px-4 py-1 shadow-xl cursor-pointer ${varient === "primary" ? primaryColor : secondaryColor}`}
        >
            <span className="font-semibold">
                {buttonText}
            </span>
            {
                Icon && (
                    <span>
                        <Icon size={20} />
                    </span>
                )
            }
        </button>
    )
}
