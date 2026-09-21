import { useState, useEffect } from "react";
import BreadCrump from "../../component/BreadCrump/BreadCrump";
import ToggleButton from "../../component/Buttons/ToggleButton";
import ConfirmationPopup from "../../component/Popup/ConfirmationPopup";

type notificationProps = {
    bookingRequest: boolean;
    course_enrollment: boolean;
    payment_confirmation: boolean;
    system_updates: boolean;
    browser_notification: boolean;
    mobile_alerts: boolean;
}

type notificationType = {
    id: number;
    key: keyof notificationProps;
    label: string;
    subtitle: string;
    category: string;
}

const typeNotification: notificationType[] = [
    {
        id: 1,
        key: "bookingRequest",
        label: "New Booking Requests",
        subtitle: "Get notified when a new booking is created",
        category: "Email Notifications"
    },
    {
        id: 2,
        key: "course_enrollment",
        label: "Course Enrollments",
        subtitle: "Alerts when students enroll in courses",
        category: "Email Notifications"
    },
    {
        id: 3,
        key: "payment_confirmation",
        label: "Payment Confirmations",
        subtitle: "Receive payment receipt notifications",
        category: "Email Notifications"
    },
    {
        id: 4,
        key: "system_updates",
        label: "System Updates",
        subtitle: "Important system and security updates",
        category: "Email Notifications"
    },
    {
        id: 5,
        key: "browser_notification",
        label: "Browser Notifications",
        subtitle: "Show desktop notifications in your browser",
        category: "Push Notifications"
    },
    {
        id: 6,
        key: "mobile_alerts",
        label: "Mobile Alerts",
        subtitle: "Push notifications to mobile devices",
        category: "Push Notifications"
    },
]

const defaultSettings: notificationProps = {
    bookingRequest: true,
    course_enrollment: true,
    payment_confirmation: true,
    system_updates: true,
    browser_notification: true,
    mobile_alerts: true,
}

export default function NotificationSettings() {
    const [notification, setNotification] = useState<notificationProps>(defaultSettings);
    const [initialSettings, setInitialSettings] = useState<notificationProps>(defaultSettings);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        const savedSettings = localStorage.getItem("notificationSettings");
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                setNotification(parsedSettings);
                setInitialSettings(parsedSettings);
            } catch (error) {
                console.error("Error loading notification settings:", error);
            }
        }
    }, []);

    const handleNotificationChange = (key: keyof notificationProps) => {
        setNotification(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        setSaveSuccess(false);
    };

    const handleSave = () => {
        try {
            localStorage.setItem("notificationSettings", JSON.stringify(notification));
            setInitialSettings(notification);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving notification settings:", error);
        }
    };

    const handleReset = () => {
        setNotification(initialSettings);
        setSaveSuccess(false);
    };

    const groupedNotifications = typeNotification.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, notificationType[]>);

    const isModified = JSON.stringify(notification) !== JSON.stringify(initialSettings);

    return (
        <main className="space-y-4">
            <section>
                <BreadCrump
                    title="Notification settings"
                    subtitles="Manage your dashboard configuration and preferences"
                />
            </section>
            {Object.entries(groupedNotifications).map(([category, notifications]) => (
                <section key={category} className="space-y-4 border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-xl">
                    <p className="text-lg font-semibold dark:text-white">{category}</p>
                    <div className="space-y-6">
                        {notifications.map((item) => (
                            <div key={item.id} className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <p className="dark:text-white text-md font-semibold">{item.label}</p>
                                    <p className="text-gray-500 text-sm dark:text-gray-400">{item.subtitle}</p>
                                </div>
                                <div>
                                    <ToggleButton
                                        buttonTextOne="ON"
                                        buttonTextTwo="OFF"
                                        onChange={() => handleNotificationChange(item.key)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            <section className="flex gap-4 justify-end">
                <button
                    onClick={handleReset}
                    disabled={!isModified}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Reset
                </button>
                <button
                    onClick={handleSave}
                    disabled={!isModified}
                    className="px-6 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Save Settings
                </button>
            </section>
            {
                saveSuccess && (
                    <ConfirmationPopup
                        open={saveSuccess}
                        message="Notification Settings saved successfully"
                        title="Notification Settings"
                        type="success"
                        onConfirm={() => setSaveSuccess(false)}
                        onClose={() => setSaveSuccess(false)}
                    />
                )
            }
        </main>
    )
}