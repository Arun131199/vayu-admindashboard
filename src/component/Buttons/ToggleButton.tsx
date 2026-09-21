import { useState } from "react";

type toggleButtonProps = {
    buttonTextOne?: string;
    buttonTextTwo?: string;
    onChange?: (value: string) => void;
}

export default function ToggleButton({
    buttonTextOne = "Active",
    buttonTextTwo = "Inactive",
    onChange
}: toggleButtonProps) {
    const [activeValue, setActiveValue] = useState(buttonTextOne);

    const handleChange = (value: string) => {
        setActiveValue(value);
        onChange?.(value);
    };

    return (
        <div className="inline-flex rounded-md border border-gray-300 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
            {[buttonTextOne, buttonTextTwo].map((buttonText) => {
                const isActive = activeValue === buttonText;

                return (
                    <button
                        key={buttonText}
                        type="button"
                        onClick={() => handleChange(buttonText)}
                        className={[
                            "rounded px-4 py-2 text-sm font-medium transition-colors",
                            isActive
                                ? "bg-yellow-500 text-black"
                                : "text-gray-600 hover:text-yellow-600 dark:text-gray-300 dark:hover:text-yellow-400"
                        ].join(" ")}
                    >
                        {buttonText}
                    </button>
                );
            })}
        </div>
    )
}
