import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, KeyRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../service/api";

export default function OtpVerification() {
    const navigate = useNavigate();
    const { verifyLoginOtp, completeLogin, isAuthenticated } = useAuth();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const pendingEmail = sessionStorage.getItem("pendingLoginEmail");
        if (!pendingEmail && !isAuthenticated) {
            navigate("/login", { replace: true });
            return;
        }
        if (pendingEmail) setEmail(pendingEmail);
    }, [navigate, isAuthenticated]);

    const handleVerifyOtp = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
        setSuccess(false);

        if (otp.length !== 6) {
            setError("Please enter the 6 digit OTP");
            return;
        }

        setLoading(true);
        try {
            const result = await verifyLoginOtp(email, otp);
            if (result) {
                sessionStorage.removeItem("pendingLoginEmail");
                completeLogin({ username: result.username, email: result.email });
                setSuccess(true);
                setTimeout(() => {
                    navigate("/admin-dashboard", { replace: true });
                }, 500);
            } else {
                setError("Invalid or expired OTP. Please try again");
            }
        } catch (err) {
            setError("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!email) return;
        setResending(true);
        setError("");
        try {
            await api.post("otp/send", { identifier: email, otpType: "TWO_FACTOR_LOGIN" });
            setOtp("");
            setSuccess(false);
        } catch (err) {
            setError("Failed to resend OTP. Please try again.");
        } finally {
            setResending(false);
        }
    };

    return (
        <main className="flex justify-center items-center flex-col min-h-screen bg-gradient-to-br from-yellow-500 to-orange-600 font-sans">
            <div className="border-none p-12 rounded-2xl shadow-2xl bg-white dark:bg-gray-900 w-full max-w-md lg:max-w-lg">
                <div className="text-center mb-9">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <KeyRound size={28} />
                    </div>
                    <h1 className="m-0 mb-2 text-gray-800 text-4xl font-bold dark:text-white">Verify OTP</h1>
                    <p className="text-gray-500 text-sm m-0">Enter the code sent to {email || "your email"}</p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-300 rounded-lg p-3 mb-4 text-red-600">
                        <AlertCircle size={20} />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-300 rounded-lg p-3 mb-4 text-green-600">
                        <CheckCircle size={20} />
                        <span className="text-sm">OTP verified! Redirecting...</span>
                    </div>
                )}

                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <label htmlFor="otp" className="font-semibold text-gray-700 dark:text-gray-200">OTP</label>
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(event) => {
                                setOtp(event.target.value.replace(/\D/g, ""));
                                setError("");
                            }}
                            placeholder="Enter 6 digit OTP"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-xl font-semibold tracking-widest text-gray-800 outline-none focus:border-yellow-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            required
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg text-white font-bold text-base border-none transition-all duration-300 ${loading
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-yellow-500 hover:bg-yellow-600 shadow-lg hover:shadow-xl cursor-pointer"
                            }`}
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>

                <div className="mt-5 text-center">
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resending}
                        className="text-yellow-600 cursor-pointer border-none bg-transparent font-bold hover:text-yellow-700 disabled:opacity-50"
                    >
                        {resending ? "Resending..." : "Resend OTP"}
                    </button>
                </div>
            </div>
        </main>
    );
}