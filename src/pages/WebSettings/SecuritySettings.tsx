import { useEffect, useState } from "react";
import AllInputFields from "../../component/AllInputFields/AllInputFields";
import BreadCrump from "../../component/BreadCrump/BreadCrump";
import Button from "../../component/Buttons/Button";
import { Shield } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store/store";
import { setTwoFactorEnabled } from "../../redux/slice/securitySlice";
import { changePassword, getCurrentUser, sendTwoFactorOtp, toggleTwoFactor } from "../../service/securityApi";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

export default function SecuritySettings() {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useAuth();
    const twoFactorEnabled = useSelector((state: RootState) => state.security.twoFactorEnabled);

    const [getPassword, setPassword] = useState({
        current_pass: "",
        new_pass: "",
        confirm_pass: ""
    });
    const [otpStep, setOtpStep] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const [otpSending, setOtpSending] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [twoFactorLoading, setTwoFactorLoading] = useState(false);
    const [_message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [errors, setErrors] = useState({
        current_pass: "",
        new_pass: "",
        confirm_pass: ""
    });

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

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePasswordForm()) {
            setMessage({ type: "error", text: "Please fix the errors above" });
            return;
        }

        setPasswordLoading(true);
        try {
            await changePassword(getPassword.current_pass, getPassword.new_pass);

            setMessage({ type: "success", text: "Password updated successfully!" });
            setPassword({
                current_pass: "",
                new_pass: "",
                confirm_pass: ""
            });
            setErrors({ current_pass: "", new_pass: "", confirm_pass: "" });
            toast.success("The password updated successfully")
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            const errMsg = error?.response?.data?.message ?? "Failed to update password. Please try again.";
            toast.error(`Failed to update the password ${errMsg}`)
            setMessage({ type: "error", text: errMsg });
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleEnableClick = async () => {
        if (twoFactorEnabled) {
            setTwoFactorLoading(true);
            try {
                await toggleTwoFactor(false);
                dispatch(setTwoFactorEnabled(false));
                setMessage({ type: "success", text: "Two-Factor Authentication disabled successfully" });
                setTimeout(() => setMessage(null), 3000);
            } catch (error: any) {
                setMessage({ type: "error", text: error?.response?.data?.message ?? "Failed to update 2FA settings" });
            } finally {
                setTwoFactorLoading(false);
            }
            return;
        }

        setOtpSending(true);
        try {
            await sendTwoFactorOtp(user?.email ?? "");
            setOtpStep(true);
            setMessage({ type: "success", text: "Verification code sent to your email" });
        } catch (error: any) {
            setMessage({ type: "error", text: error?.response?.data?.message ?? "Failed to send verification code" });
        } finally {
            setOtpSending(false);
        }
    };

    const handleVerifyAndEnable = async () => {
        if (!otpValue.trim()) {
            setMessage({ type: "error", text: "Please enter the verification code" });
            return;
        }
        setTwoFactorLoading(true);
        try {
            await toggleTwoFactor(true, otpValue.trim());
            dispatch(setTwoFactorEnabled(true));
            setMessage({ type: "success", text: "Two-Factor Authentication enabled successfully" });
            setOtpStep(false);
            setOtpValue("");
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: "error", text: error?.response?.data?.message ?? "Invalid or expired code" });
        } finally {
            setTwoFactorLoading(false);
        }
    };


    useEffect(() => {
        getCurrentUser()
            .then((user) => {
                dispatch(setTwoFactorEnabled(user.twoFactorEnabled));
            })
            .catch((err) => console.error("Failed to fetch current user", err));
    }, []);

    return (
        <main className="space-y-4">
            <section>
                <BreadCrump
                    title="Security"
                    subtitles="Manage your dashboard configuration and preferences"
                />
            </section>
            <section className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-xl space-y-4">
                <p className="font-semibold text-lg dark:text-white">Password & Authentication</p>

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

                            {!otpStep ? (
                                <div>
                                    <Button
                                        buttonText={otpSending || twoFactorLoading ? "Processing..." : (twoFactorEnabled ? "Disable 2FA" : "Enable 2FA")}
                                        varient={twoFactorEnabled ? "secondary" : "primary"}
                                        onClick={handleEnableClick}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-3 max-w-sm">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        We've sent a 6-digit code to <strong>{user?.email}</strong>. Enter it below to enable 2FA.
                                    </p>
                                    <input
                                        type="text"
                                        value={otpValue}
                                        onChange={(e) => setOtpValue(e.target.value)}
                                        placeholder="Enter verification code"
                                        maxLength={6}
                                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:text-white"
                                    />
                                    <div className="flex gap-3">
                                        <Button
                                            buttonText={twoFactorLoading ? "Verifying..." : "Verify & Enable"}
                                            onClick={handleVerifyAndEnable}
                                        />
                                        <button
                                            onClick={() => { setOtpStep(false); setOtpValue(""); }}
                                            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

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
    );
}