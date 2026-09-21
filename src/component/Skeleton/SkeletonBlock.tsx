type SkeletonBlockProps = {
    className?: string;
};

export default function SkeletonBlock({ className = "" }: SkeletonBlockProps) {
    return (
        <div
            className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`}
            aria-hidden="true"
        />
    );
}
