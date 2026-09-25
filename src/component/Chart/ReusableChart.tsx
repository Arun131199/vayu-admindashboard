import Chart from "react-apexcharts";

interface ReusableChartProps {
    title?: string;
    type?: | "line"
    | "area"
    | "bar"
    | "pie"
    | "donut"
    | "radialBar"
    | "scatter"
    | "bubble"
    | "heatmap"
    | "candlestick"
    | "boxPlot"
    | "radar"
    | "polarArea"
    | "rangeBar"
    | "rangeArea"
    | "treemap";
    series: any[];
    categories?: string[];
    labels?: string[];
    height?: number;
}

export default function ReusableChart({
    title,
    type = "line",
    series,
    categories = [],
    labels = [],
    height = 300,
}: ReusableChartProps) {
    const options: any = {
        chart: {
            toolbar: {
                show: false,
            },
            animations: {
                enabled: false,
            },
        },

        stroke: {
            curve: "smooth",
        },

        dataLabels: {
            enabled: false,
        },

        grid: {
            borderColor: "#e5e7eb",
        },

        colors: ["#f59e0b", "#6366f1", "#10b981", "#ef4444"],

        xaxis: {
            categories: categories,
        },

        labels: labels,
    };

    const cardMinHeight = height + 88;

    return (
        <div
            className="w-full rounded-xl bg-white p-4 shadow-lg dark:bg-gray-900"
            style={{ minHeight: `${cardMinHeight}px` }}
        >
            {title && (
                <h2 className="text-lg font-semibold mb-4 dark:text-white">
                    {title}
                </h2>
            )}

            <Chart
                options={options}
                series={series}
                type={type}
                height={height}
            />
        </div>
    );
}
