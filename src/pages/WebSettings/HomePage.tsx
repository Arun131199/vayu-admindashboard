import { useState } from "react";
import AllInputFields from "../../component/AllInputFields/AllInputFields";
import type { Chooseus, ContactForm, FormInputs, heroSectionInterface, WhoWeAreSection } from "../../interfaces/heroSectionInterface";
import { CheckCircle, Clock, Phone, Plus, Trash2 } from "lucide-react";
import Button from "../../component/Buttons/Button";
import { toast } from "sonner";

type ScrollingText = {
    text: string[];
}

export default function HomePage() {
    const [getHeroData, setHeroData] = useState<heroSectionInterface>({
        heading: "",
        morqueText: [""],
        subHeading: "",
        buttonText: "",
        heroBannerImage: ""
    });

    const [getWhoweAre, setWhoweAre] = useState<WhoWeAreSection>({
        title: "",
        heading: "",
        description: "",
        contact: [],
        available: [],
        image: ""
    });

    const [getText, setText] = useState<ScrollingText>({
        text: []
    })

    const [getChooseus, setChooseus] = useState<Chooseus>({
        buttonText: "",
        chooseUs: [],
        heading: "",
        image: "",
        title: ""
    })

    const [getContact, setContact] = useState<ContactForm>({
        buttonText: "",
        description: "",
        formInputs: [],
        heading: "",
        title: "",
    });

    const addContact = () => {
        setWhoweAre((prev) => ({
            ...prev,
            contact: [
                ...prev.contact, {
                    id: Date.now(),
                    icon: Phone,
                    title: "",
                    contact: "",
                },

            ],
        }));
    };

    const addAvailable = () => {
        setWhoweAre((prev) => ({
            ...prev,
            available: [
                ...prev.available,
                {
                    id: Date.now(),
                    icon: Clock,
                    title: "",
                },
            ],
        }));
    };

    const addScrollingText = () => {
        setText((prev) => ({
            ...prev,
            text: [...prev.text, ""]
        }));
    };

    const addChooseUs = () => {
        setChooseus((prev) => ({
            ...prev,
            chooseUs: [
                ...prev.chooseUs,
                {
                    id: Date.now(),
                    icon: CheckCircle,
                    text: "",
                },
            ],
        }));
    };

    const addFormInput = () => {
        setContact((prev) => ({
            ...prev,
            formInputs: [
                ...prev.formInputs,
                {
                    id: Date.now(),
                    label: "",
                    placeholder: "",
                    labelFor: "",
                    inputType: "text",
                },
            ],
        }));
    };

    const handleContactChange = (
        id: number,
        field: "title" | "contact",
        value: string
    ) => {
        setWhoweAre((prev) => ({
            ...prev,
            contact: prev.contact.map((item) =>
                item.id === id
                    ? { ...item, [field]: value }
                    : item
            ),
        }));
    };

    const handleAvailableChange = (
        id: number,
        value: string
    ) => {
        setWhoweAre((prev) => ({
            ...prev,
            available: prev.available.map((item) => item.id === id ? { ...item, title: value } : item),
        }));
    };

    const handleChooseUsChange = (
        id: number,
        value: string
    ) => {
        setChooseus((prev) => ({
            ...prev,
            chooseUs: prev.chooseUs.map((item) =>
                item.id === id
                    ? { ...item, text: value }
                    : item
            ),
        }));
    };

    const handleFormInputChange = (
        id: number,
        field: keyof Omit<FormInputs, "id">,
        value: string
    ) => {
        setContact((prev) => ({
            ...prev,
            formInputs: prev.formInputs.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item
            ),
        }));
    };

    const removeContact = (id: number) => {
        setWhoweAre((prev) => ({
            ...prev,
            contact: prev.contact.filter((item) => item.id !== id),
        }));
    };

    const removeAvailable = (id: number) => {
        setWhoweAre((prev) => ({
            ...prev,
            available: prev.available.filter((item) => item.id !== id),
        }));
    };

    const handleScrollingTextChange = (
        index: number,
        value: string
    ) => {
        setText((prev) => ({
            ...prev,
            text: prev.text.map((item, i) =>
                i === index ? value : item
            )
        }));
    };

    const removeScrollingText = (index: number) => {
        setText((prev) => ({
            ...prev,
            text: prev.text.filter((_, i) => i !== index)
        }));
    };

    const removeChooseUs = (id: number) => {
        setChooseus((prev) => ({
            ...prev,
            chooseUs: prev.chooseUs.filter(
                (item) => item.id !== id
            ),
        }));
    };

    const removeFormInput = (id: number) => {
        setContact((prev) => ({
            ...prev,
            formInputs: prev.formInputs.filter(
                (item) => item.id !== id
            ),
        }));
    };

    return (
        <main className="space-y-4">
            {/* hero section */}
            <section className="space-y-4">
                <section>
                    <h1 className="text-2xl dark:text-white font-semibold">Home Page</h1>
                </section>
                <section className="border dark:border-gray-700 border-gray-300 rounded-sm p-4 shadow-xl space-y-4">
                    <h1 className="dark:text-white font-semibold ">Hero Section :</h1>
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <AllInputFields
                                name="heading"
                                label="Heading"
                                type="text"
                                onChange={(e) => setHeroData({ ...getHeroData, heading: e.target.value })}
                                value={getHeroData.heading}
                                placeholder="Enter the Heading of the Hero Section"
                                required
                            />
                            <AllInputFields
                                name="morqueText"
                                label="Morque Text"
                                type="textarea"
                                onChange={(e) =>
                                    setHeroData({
                                        ...getHeroData,
                                        morqueText: e.target.value.split(",").map(item => item.trim())
                                    })
                                }
                                value={getHeroData.morqueText.join(", ")}
                                placeholder="e.g, Service, Drone, Goverment Oreders"
                                required

                            />
                            <AllInputFields
                                name="subHeading"
                                label="Sub Heading"
                                type="text"
                                onChange={(e) => setHeroData({ ...getHeroData, subHeading: e.target.value })}
                                value={getHeroData.subHeading}
                                placeholder="Enter the Sub-Heading of the Hero Section"
                                required
                            />
                            <AllInputFields
                                name="buttonText"
                                label="Button Text"
                                type="text"
                                onChange={(e) => setHeroData({ ...getHeroData, buttonText: e.target.value })}
                                value={getHeroData.buttonText}
                                placeholder="Enter the Button label of the Hero Section"
                                required
                            />
                            <AllInputFields
                                name="heroBannerImage"
                                label="Hero Banner Image"
                                type="file"
                                onChange={(e) => setHeroData({ ...getHeroData, heroBannerImage: e.target.value })}
                                value={getHeroData.heroBannerImage}
                                placeholder="Upload the Hero Banner Image"
                                required
                            />

                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <Button
                                buttonText="Submit"
                                type="button"
                                varient="primaryColor"
                                onClick={() => toast.success("The Hero section details added successfully")}
                            />
                        </div>
                    </div>
                </section>
                <section className="border dark:border-gray-700 border-gray-300 rounded-sm p-4 shadow-xl space-y-4">
                    <h1 className="dark:text-gray-300 font-semibold">
                        Who We Are :
                    </h1>
                    <div className="space-y-4">
                        <AllInputFields
                            name="title"
                            label="Title"
                            type="text"
                            onChange={(e) => setWhoweAre({ ...getWhoweAre, title: e.target.value, })}
                            value={getWhoweAre.title}
                            placeholder="Enter the Title"
                            required
                        />

                        <AllInputFields
                            name="heading"
                            label="Heading"
                            type="text"
                            onChange={(e) => setWhoweAre({ ...getWhoweAre, heading: e.target.value, })}
                            value={getWhoweAre.heading}
                            placeholder="Enter the Heading"
                            required
                        />

                        <AllInputFields
                            name="description"
                            label="Description"
                            type="textarea"
                            onChange={(e) => setWhoweAre({ ...getWhoweAre, description: e.target.value, })}
                            value={getWhoweAre.description}
                            placeholder="Enter Description"
                            required
                        />

                    </div>

                    {/* CONTACT */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold dark:text-gray-300">
                                Contact
                            </h2>
                            <button
                                type="button"
                                onClick={addContact}
                                className="border px-4 py-1 rounded-md cursor-pointer border-gray-600 text-gray-600 font-semibold dark:border-gray-500 dark:text-gray-400 hover:scale-105 transition-transform duration-100"
                            >
                                + Add Contact
                            </button>
                        </div>

                        {getWhoweAre.contact.map((item) => (
                            <div
                                key={item.id}
                                className="border p-4 border-gray-200 shadow-xl dark:border-gray-700 rounded-md space-y-3"
                            >
                                <AllInputFields
                                    name={`contact-title-${item.id}`}
                                    label="Title"
                                    type="text"
                                    value={item.title}
                                    placeholder="Example: Phone"
                                    onChange={(e) => handleContactChange(item.id, "title", e.target.value)}
                                />

                                <AllInputFields
                                    name={`contact-${item.id}`}
                                    label="Contact"
                                    type="text"
                                    value={item.contact}
                                    placeholder="+91 9876543210"
                                    onChange={(e) => handleContactChange(item.id, "contact", e.target.value)}
                                />

                                <button
                                    type="button"
                                    onClick={() => removeContact(item.id)}
                                    className="text-red-500 cursor-pointer"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* AVAILABLE */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold dark:text-gray-300">
                                Available
                            </h2>
                            <button
                                type="button"
                                onClick={addAvailable}
                                className="border px-4 py-1 rounded-md cursor-pointer border-gray-600 text-gray-600 font-semibold dark:border-gray-500 dark:text-gray-400 hover:scale-105 transition-transform duration-100"
                            >
                                + Add Available
                            </button>
                        </div>

                        {getWhoweAre.available.map((item) => (
                            <div
                                key={item.id}
                                className="border p-4 border-gray-200 shadow-xl dark:border-gray-700 rounded-md space-y-3"
                            >
                                <AllInputFields
                                    name={`available-${item.id}`}
                                    label="Available"
                                    type="text"
                                    value={item.title}
                                    placeholder="Example: Monday - Saturday"
                                    onChange={(e) => handleAvailableChange(item.id, e.target.value)}
                                />

                                <button
                                    type="button"
                                    onClick={() => removeAvailable(item.id)}
                                    className="text-red-500 cursor-pointer"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <Button
                            buttonText="Submit"
                            type="button"
                            varient="primaryColor"
                            onClick={() => toast.success("The Who We Are section details added successfully")}
                        />
                    </div>
                </section>
                <section className="border dark:border-gray-700 border-gray-300 rounded-sm p-4 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="font-semibold dark:text-gray-200">
                            Scrolling Text
                        </h1>
                        <button
                            type="button"
                            onClick={addScrollingText}
                            className="border px-4 py-1 rounded-md cursor-pointer border-gray-600 text-gray-600 font-semibold dark:border-gray-500 dark:text-gray-400 hover:scale-105 transition-transform duration-100"
                        >
                            + Add Text
                        </button>
                    </div>

                    <div className="space-y-3">
                        {getText.text.map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="flex-1">
                                    <AllInputFields
                                        type="text"
                                        name={`text-${index}`}
                                        placeholder={`Enter the scrolling text - ${index + 1}`}
                                        label={`Scrolling Text ${index + 1}`}
                                        labelFor={`text-${index}`}
                                        value={item}
                                        onChange={(e) =>
                                            handleScrollingTextChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeScrollingText(index)}
                                    className="text-red-500 cursor-pointer"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <Button
                            buttonText="Submit"
                            type="button"
                            varient="primaryColor"
                            onClick={() => toast.success("The Scrolling text's are added successfully")}
                        />
                    </div>
                </section>
                <section className="border dark:border-gray-700 border-gray-300 rounded-sm p-4 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-gray-900 font-semibold dark:text-gray-400">
                            Choosing Us
                        </h1>
                        <button
                            type="button"
                            onClick={addChooseUs}
                            className="border flex items-center gap-2 px-4 py-1 rounded-md cursor-pointer border-gray-600 text-gray-600 font-semibold dark:border-gray-500 
                            dark:text-gray-400 hover:scale-105 transition-transform duration-100"
                        >
                            <Plus size={16} /> <span>Add Point</span>
                        </button>
                    </div>

                    {/* Main Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <AllInputFields
                            name="title"
                            label="Title"
                            required
                            labelFor="title"
                            placeholder="Enter your title"
                            value={getChooseus.title}
                            onChange={(e) => setChooseus((prev) => ({ ...prev, title: e.target.value, }))}
                        />
                        <AllInputFields
                            name="heading"
                            label="Heading"
                            required
                            labelFor="heading"
                            placeholder="Enter your chooseus heading"
                            value={getChooseus.heading}
                            onChange={(e) => setChooseus((prev) => ({ ...prev, heading: e.target.value, }))}
                        />
                        <AllInputFields
                            name="image"
                            type="file"
                            label="Chooseus Banner"
                            placeholder="Select your banner"
                            required
                            onChange={(e) => setChooseus((prev) => ({ ...prev, image: e.target.value, }))}
                        />
                        <AllInputFields
                            label="Button Text"
                            labelFor="buttonText"
                            name="buttonText"
                            required
                            placeholder="Enter your button text"
                            value={getChooseus.buttonText}
                            onChange={(e) => setChooseus((prev) => ({ ...prev, buttonText: e.target.value, }))}
                        />
                    </div>

                    {/* Dynamic Choose Us Points */}
                    {getChooseus.chooseUs.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="font-medium dark:text-gray-300">Choose Us Points</h2>
                            {getChooseus.chooseUs.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="flex items-end gap-3"
                                >
                                    <div className="flex-1">
                                        <AllInputFields
                                            name={`chooseUs-${item.id}`}
                                            label={`Point ${index + 1}`}
                                            labelFor={`chooseUs-${item.id}`}
                                            placeholder="Enter choose us point"
                                            required
                                            value={item.text}
                                            onChange={(e) =>
                                                handleChooseUsChange(
                                                    item.id,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeChooseUs(item.id)}
                                        className="border border-red-500 text-red-500 p-2 rounded-md cursor-pointer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex flex-col items-center justify-center">
                        <Button
                            buttonText="Submit"
                            type="button"
                            varient="primaryColor"
                            onClick={() => toast.success("The choosing us  details added successfully")}
                        />
                    </div>
                </section>
                {/* contact form */}
                <section className="border dark:border-gray-700 border-gray-300 rounded-sm p-4 shadow-xl space-y-4">

                    <div className="flex items-center justify-between">
                        <h1 className="font-semibold text-gray-800 dark:text-gray-300">
                            Contact Form
                        </h1>

                        <button
                            type="button"
                            onClick={addFormInput}
                            className="border flex items-center gap-2 px-4 py-1 rounded-md cursor-pointer border-gray-600 text-gray-600 font-semibold dark:border-gray-500 
                            dark:text-gray-400 hover:scale-105 transition-transform duration-100"
                        >
                            + Add Input
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <AllInputFields
                                name="title"
                                type="text"
                                label="Title"
                                labelFor="title"
                                value={getContact.title}
                                placeholder="Enter Title of contact form"
                                required
                                onChange={(e) => setContact((prev) => ({ ...prev, title: e.target.value, }))}
                            />
                            <AllInputFields
                                name="heading"
                                type="text"
                                label="Heading"
                                labelFor="heading"
                                value={getContact.heading}
                                placeholder="Enter Heading of contact form"
                                required
                                onChange={(e) => setContact((prev) => ({ ...prev, heading: e.target.value, }))}
                            />
                            <AllInputFields
                                name="buttonText"
                                type="text"
                                label="Button Text"
                                labelFor="buttonText"
                                value={getContact.buttonText}
                                placeholder="Enter button text"
                                required
                                onChange={(e) => setContact((prev) => ({ ...prev, buttonText: e.target.value, }))}
                            />
                        </div>
                        <AllInputFields
                            name="description"
                            type="textarea"
                            label="Description"
                            labelFor="description"
                            value={getContact.description}
                            placeholder="Enter contact form description"
                            required
                            onChange={(e) => setContact((prev) => ({ ...prev, description: e.target.value, }))}
                        />
                        {getContact.formInputs.map((item, index) => (
                            <div
                                key={item.id}
                                className="border border-gray-300 dark:border-gray-700 rounded-md p-4 space-y-4"
                            >
                                <div className="flex justify-between items-center">
                                    <h2 className="font-medium">
                                        Input {index + 1}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => removeFormInput(item.id)}
                                        className="text-red-500 cursor-pointer"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <AllInputFields
                                        name={`label-${item.id}`}
                                        label="Label"
                                        type="text"
                                        value={item.label}
                                        placeholder="Example: Full Name"
                                        onChange={(e) => handleFormInputChange(item.id, "label", e.target.value)}
                                    />
                                    <AllInputFields
                                        name={`placeholder-${item.id}`}
                                        label="Placeholder"
                                        type="text"
                                        value={item.placeholder}
                                        placeholder="Example: Enter your name"
                                        onChange={(e) => handleFormInputChange(item.id, "placeholder", e.target.value)}
                                    />
                                    <AllInputFields
                                        name={`labelFor-${item.id}`}
                                        label="Label For"
                                        type="text"
                                        value={item.labelFor}
                                        placeholder="Example: name"
                                        onChange={(e) => handleFormInputChange(item.id, "labelFor", e.target.value)}
                                    />
                                    <AllInputFields
                                        name={`inputType-${item.id}`}
                                        label="Input Type"
                                        type="text"
                                        value={item.inputType}
                                        placeholder="text / email / tel"
                                        onChange={(e) => handleFormInputChange(item.id, "inputType", e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <Button
                            buttonText="Submit"
                            type="button"
                            varient="primaryColor"
                            onClick={() => toast.success("The contact form details added successfully")}
                        />
                    </div>
                </section>
            </section>
        </main>
    )
}