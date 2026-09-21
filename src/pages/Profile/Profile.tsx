import { Mail, ShieldCheck, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import BreadCrump from "../../component/BreadCrump/BreadCrump";

export default function Profile() {
    const { user, isAuthenticated } = useAuth();
    const displayName = user?.username || "Admin";
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <main className="space-y-4">
            <BreadCrump
                title="Profile"
                subtitles="View your account details"
            />

            <section className="max-w-3xl border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 p-6 shadow-xl">
                <div className="flex flex-col items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6 sm:flex-row">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-3xl font-semibold text-white shadow-md">
                        {initial}
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{displayName}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Administrator account</p>
                    </div>
                </div>

                <div className="grid gap-5 pt-6 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                        <UserCircle className="mt-0.5 text-blue-500" size={20} />
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{displayName}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Mail className="mt-0.5 text-blue-500" size={20} />
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                            <p className="break-all font-semibold text-gray-900 dark:text-white">
                                {user?.email || "Not available"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 text-green-500" size={20} />
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</p>
                            <p className="font-semibold text-gray-900 dark:text-white">Admin</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <span className={`mt-2 h-2.5 w-2.5 rounded-full ${isAuthenticated ? "bg-green-500" : "bg-red-500"}`} />
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account status</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {isAuthenticated ? "Active" : "Inactive"}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
