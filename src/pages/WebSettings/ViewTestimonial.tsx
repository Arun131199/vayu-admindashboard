import { useLocation, useNavigate } from "react-router-dom";
import BreadCrump from "../../component/BreadCrump/BreadCrump";
import { ArrowLeft, PencilIcon, Star, Trash2 } from "lucide-react";
import Button from "../../component/Buttons/Button";
import { useState } from "react";
import ConfirmationPopup from "../../component/Popup/ConfirmationPopup";

export default function ViewTestimonial() {
    const navigate = useNavigate();
    const breadcrumpOptions = [
        {
            id: 1,
            label: "Testimonial",
            onClick: () => navigate(-1)
        },
        {
            id: 2,
            label: "Courses"
        }
    ];

    const loaction = useLocation();
    const data = loaction?.state;

    const [confirmation, setConfirmation] = useState(false)
    const [success, setSuccess] = useState(false)
    return (
        <main className="space-y-4">
            <section>
                <div className="flex items-center gap-4">
                    <ArrowLeft size={20} className="cursor-pointer " onClick={() => navigate(-1)} />
                    <BreadCrump
                        title="Testimonial"
                        options={breadcrumpOptions}
                        breadCrumpActive
                    />
                </div>

            </section>
            <section className="border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 p-4 rounded-lg shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                    <p className="font-semibold text-md dark:text-white ">View Testimonial</p>
                    <div className="flex items-center gap-4">
                        <Button
                            buttonText="Edit"
                            icon={PencilIcon}
                            onClick={() => navigate(`../testimonials/edit_testimonial/${data?.id}`, { state: data })}
                        />
                        <Button
                            buttonText="Delete"
                            icon={Trash2}
                            onClick={() => setConfirmation(true)}
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="space-y-1">
                            <p className="text-md font-semibold dark:text-white">
                                {data?.authorName ?? data?.customer_name}
                                <span className="text-sm text-gray-500 font-medium">
                                    {" "}({data?.role})
                                </span>
                            </p>

                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                {data?.company}
                            </p>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1">
                            {Array.from({
                                length: Number(String(data?.rating ?? "0").split(" ")[0])
                            }).map((_, index) => (
                                <Star
                                    key={index}
                                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                />
                            ))}
                        </div>

                        {/* Status */}
                        <div className="flex md:justify-end">
                            <p
                                className={`px-4 py-1 rounded-full text-sm w-fit
            ${data?.status === "Published"
                                        ? "bg-green-200 text-green-800"
                                        : data?.status === "Draft"
                                            ? "bg-gray-200 text-gray-800"
                                            : "bg-yellow-200 text-yellow-800"
                                    } font-semibold`}
                            >
                                {data?.status}
                            </p>
                        </div>

                    </div>

                    <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
                        <p className="font-semibold dark:text-white">Testimonial :</p>
                        <p className="dark:text-gray-300 text-gray-600">{data?.text ?? data?.testimonial}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="dark:text-gray-300 text-gray-600">{data?.publishTime ?? data?.created_at }</p>
                        {
                            data?.isFeatured ? (
                                <p className="bg-violet-300 px-4 rounded-full py-0.5 text-violet-800 font-semibold">Featured</p>
                            ) : ""
                        }
                    </div>
                </div>
            </section>
            {
                confirmation && (
                    <ConfirmationPopup
                        open={confirmation}
                        title="Delete"
                        message="Are you sure want to delete this testimonial?"
                        onConfirm={() => {
                            setConfirmation(false)
                            setSuccess(true)
                        }}
                        onClose={() => setConfirmation(false)}
                    />
                )
            }

            {
                success && (
                    <ConfirmationPopup
                        open={success}
                        title="Delete"
                        type="success"
                        message="The testimonial has been deleted successfully."
                        onConfirm={() => {
                            setSuccess(false)
                            navigate(-1)
                        }}
                        onClose={() => setSuccess(false)}
                    />
                )
            }
        </main>
    )
}