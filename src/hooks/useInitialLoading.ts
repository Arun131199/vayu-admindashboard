import { useEffect, useState } from "react";

export default function useInitialLoading(duration = 500) {
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setInitialLoading(false);
        }, duration);

        return () => window.clearTimeout(timer);
    }, [duration]);

    return initialLoading;
}
