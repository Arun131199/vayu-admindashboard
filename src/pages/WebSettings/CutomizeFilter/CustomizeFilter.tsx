import { Outlet, useNavigate } from "react-router-dom";

export default function CustomizeFilter() {
    const filterTypes = [
        {
            id: 1,
            label: "Service Filters",
            value: 'service',
            path: "../customize_filter"
        },
        {
            id: 2,
            label: "Product Filters",
            value: 'product',
            path: "product_filter"
        },
        {
            id: 3,
            label: "Course Filter",
            value: "course",
            path: "course_filter"
        }
    ]

    const navigate = useNavigate();
    return (
        <main className="flex flex-col space-y-4">
            <p className="font-semibold text-lg ">Customize Filter</p>
            <section className="flex items-center gap-4">
                {
                    filterTypes.map((item) => (
                        <div key={item.id} className="cursor-pointer border px-4 py-0.5 border-gray-200 dark:border-gray-800 
                        bg-yellow-500 rounded-md shadow-xl hover:scale-105 transition-transform ease-in duration-200"
                            onClick={() => navigate(item.path)}
                        >
                            <p>{item.label}</p>
                        </div>
                    ))
                }
            </section>
            <section>
                <Outlet />
            </section>
        </main>
    )
}