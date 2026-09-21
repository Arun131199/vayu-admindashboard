interface breadCrumpOptions {
    id: number;
    label: string;
    onClick?: () => void;
}

interface breadCrumpProps {
    options?: breadCrumpOptions[];
    title?: string;
    subtitles?: string;
    breadCrumpActive?: boolean;
}


export default function BreadCrump({ options, title, subtitles, breadCrumpActive }: breadCrumpProps) {
    const lastIndex = options?.length ? options.length - 1 : -1;

    return (
        <main>
            {breadCrumpActive ? (
                <nav aria-label="Breadcrumb">
                    <ol className="flex flex-wrap items-center gap-2 text-sm md:text-base">
                        {options?.map((value, index) => {
                            const isLastItem = index === lastIndex;

                            return (
                                <li key={value.id} className="flex items-center gap-2">
                                    {value.onClick && !isLastItem ? (
                                        <button
                                            type="button"
                                            onClick={value.onClick}
                                            className="cursor-pointer font-medium text-gray-500 transition-colors hover:text-yellow-500 dark:text-gray-300 dark:hover:text-yellow-400"
                                        >
                                            {value.label}
                                        </button>
                                    ) : (
                                        <span
                                            className={`font-semibold ${isLastItem ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-300"}`}
                                            aria-current={isLastItem ? "page" : undefined}
                                        >
                                            {value.label}
                                        </span>
                                    )}

                                    {!isLastItem && (
                                        <span className="text-gray-400 dark:text-gray-500">/</span>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </nav>
            ) : (
                <section>
                    <p className="text-xl font-semibold dark:text-white">{title}</p>
                    <p className="text-md text-gray-700 dark:text-white">{subtitles}</p>
                </section>
            )}
        </main>
    )
}
