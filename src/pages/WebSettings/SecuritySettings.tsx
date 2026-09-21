import { useState } from "react";
import AllInputFields from "../../component/AllInputFields/AllInputFields";
import BreadCrump from "../../component/BreadCrump/BreadCrump";
import Button from "../../component/Buttons/Button";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store/store";
import { setTwoFactorEnabled } from "../../redux/slice/securitySlice";

export default function SecuritySettings() {
    const dispatch = useDispatch<AppDispatch>();
    const twoFactorEnabled = useSelector((state: RootState) => state.security.twoFactorEnabled);

    const [getPassword, setPassword] = useState({
        current_pass: "",
        new_pass: "",
        confirm_pass: ""
    });

    const [passwordLoading, setPasswordLoading] = useState(false);
    const [twoFactorLoading, setTwoFactorLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [errors, setErrors] = useState({
        current_pass: "",
        new_pass: "",
        confirm_pass: ""
    });

    // Validate password form
    const validatePasswordForm = () => {
        const newErrors = {
            current_pass: "",
            new_pass: "",
            confirm_pass: ""
        };

        if (!getPassword.current_pass.trim()) {
            newErrors.current_pass = "Current password is required";
        }
        if (!getPassword.new_pass.trim()) {
            newErrors.new_pass = "New password is required";
        } else if (getPassword.new_pass.length < 6) {
            newErrors.new_pass = "Password must be at least 6 characters";
        }
        if (!getPassword.confirm_pass.trim()) {
            newErrors.confirm_pass = "Please confirm your password";
        } else if (getPassword.new_pass !== getPassword.confirm_pass) {
            newErrors.confirm_pass = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.values(newErrors).every(err => err === "");
    };

    // Handle password update
    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePasswordForm()) {
            setMessage({ type: "error", text: "Please fix the errors above" });
            return;
        }

        setPasswordLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock validation - in real app, this would be from backend
            if (getPassword.current_pass !== "admin123") {
                setMessage({ type: "error", text: "Current password is incorrect" });
                setPasswordLoading(false);
                return;
            }

            setMessage({ type: "success", text: "Password updated successfully!" });
            setPassword({
                current_pass: "",
                new_pass: "",
                confirm_pass: ""
            });
            setErrors({ current_pass: "", new_pass: "", confirm_pass: "" });

            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update password. Please try again." });
        } finally {
            setPasswordLoading(false);
        }
    };

    // Handle 2FA toggle
    const handleTwoFactorToggle = async () => {
        setTwoFactorLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            dispatch(setTwoFactorEnabled(!twoFactorEnabled));
            setMessage({
                type: "success",
                text: `Two-Factor Authentication ${!twoFactorEnabled ? "enabled" : "disabled"} successfully`
            });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update 2FA settings" });
        } finally {
            setTwoFactorLoading(false);
        }
    };

    return (
        <main className="space-y-4">
            <section>
                <BreadCrump
                    title="Security"
                    subtitles="Manage your dashboard configuration and preferences"
                />
            </section>

           
            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === "success" ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800" : "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"}`}>
                    {message.type === "success" ? (
                        <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                    ) : (
                        <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
                    )}
                    <span className={`${message.type === "success" ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                        {message.text}
                    </span>
                </div>
            )}

            <section className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-xl space-y-4">
                <p className="font-semibold text-lg dark:text-white">Password & Authentication</p>
                
                {/* ✅ PASSWORD UPDATE FORM */}
                <form onSubmit={handlePasswordUpdate} className="space-y-4 border-b border-gray-200 dark:border-gray-800 pb-4">
                    <div className="space-y-4 w-100">
                        <AllInputFields
                            label="Current Password"
                            labelFor="current_pass"
                            name="current_pass"
                            required={true}
                            onChange={(e) => {
                                setPassword({ ...getPassword, current_pass: e.target.value });
                                setErrors({ ...errors, current_pass: "" });
                            }}
                            type="password"
                            value={getPassword.current_pass}
                            placeholder="Enter current password"
                            error={errors.current_pass}
                        />
                        <AllInputFields
                            label="New Password"
                            labelFor="new_pass"
                            name="new_pass"
                            required={true}
                            onChange={(e) => {
                                setPassword({ ...getPassword, new_pass: e.target.value });
                                setErrors({ ...errors, new_pass: "" });
                            }}
                            type="password"
                            value={getPassword.new_pass}
                            placeholder="Enter new password"
                            error={errors.new_pass}
                        />
                        <AllInputFields
                            label="Confirm Password"
                            labelFor="confirm_pass"
                            name="confirm_pass"
                            required={true}
                            onChange={(e) => {
                                setPassword({ ...getPassword, confirm_pass: e.target.value });
                                setErrors({ ...errors, confirm_pass: "" });
                            }}
                            type="password"
                            value={getPassword.confirm_pass}
                            placeholder="Confirm new password"
                            error={errors.confirm_pass}
                        />
                    </div>
                    <div>
                        <Button
                            buttonText={passwordLoading ? "Updating..." : "Update Password"}
                            type="submit"
                        />
                    </div>
                </form>

                {/* ✅ TWO-FACTOR AUTHENTICATION SECTION */}
                <div className="space-y-4 border-b border-gray-200 dark:border-gray-800 pb-4">
                    <p className="font-semibold text-lg dark:text-white">Two-Factor Authentication</p>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-start gap-4">
                        <Shield className={twoFactorEnabled ? "text-green-500" : "text-gray-400"} size={24} />
                        <div className="flex-1 space-y-3">
                            <div>
                                <p className="text-md font-semibold dark:text-white">
                                    2FA is {twoFactorEnabled ? "Enabled" : "Disabled"}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {twoFactorEnabled
                                        ? "Your account is protected with two-factor authentication"
                                        : "Enable 2FA to add an extra layer of security to your account"}
                                </p>
                            </div>
                            <div>
                                <Button
                                    buttonText={twoFactorLoading ? "Processing..." : (twoFactorEnabled ? "Disable 2FA" : "Enable 2FA")}
                                    varient={twoFactorEnabled ? "secondary" : "primary"}
                                    onClick={handleTwoFactorToggle}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ SECURITY INFO */}
                <div className="space-y-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="font-semibold text-yellow-900 dark:text-yellow-300">🔐 Security Tips</p>
                    <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-2">
                        <li>• Use a strong password with at least 6 characters</li>
                        <li>• Change your password regularly</li>
                        <li>• Enable two-factor authentication for better security</li>
                        <li>• Never share your password with anyone</li>
                    </ul>
                </div>
            </section>
        </main>
    )
}
