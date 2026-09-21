import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, KeyRound, MailOpen } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import type { AppDispatch, RootState } from "../../redux/store/store";
import { clearOtpSession, sendOtp, setOtpVerified } from "../../redux/slice/securitySlice";

export default function OtpVerification() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { completeLogin, isAuthenticated } = useAuth();
    const { otpCode, otpSentTo, otpExpiresAt, pendingUser } = useSelector((state: RootState) => state.security);

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!pendingUser && !success && !isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isAuthenticated, pendingUser, success, navigate]);

    useEffect(() => {
        if (success && isAuthenticated) {
            navigate("/admin-dashboard", { replace: true });
            dispatch(clearOtpSession());
        }
    }, [dispatch, isAuthenticated, navigate, success]);

    const handleVerifyOtp = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
        setSuccess(false);

        if (!pendingUser) {
            navigate("/login", { replace: true });
            return;
        }

        if (otp.length !== 6) {
            setError("Please enter the 6 digit OTP");
            return;
        }

        if (otpExpiresAt && Date.now() > otpExpiresAt) {
            setError("OTP expired. Please resend OTP");
            return;
        }

        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 600));

        if (otp === otpCode) {
            dispatch(setOtpVerified(true));
            completeLogin(pendingUser);
            setSuccess(true);
        } else {
            setError("Invalid OTP. Please try again");
        }

        setLoading(false);
    };

    const handleResendOtp = () => {
        if (!pendingUser) {
            return;
        }

        dispatch(sendOtp(pendingUser));
        setOtp("");
        setError("");
        setSuccess(false);
    };

    return (
        <main className="flex justify-center items-center flex-col min-h-screen bg-gradient-to-br from-yellow-500 to-orange-600 font-sans">
            <div className="border-none p-12 rounded-2xl shadow-2xl bg-white dark:bg-gray-900 w-full max-w-md lg:max-w-lg">
                <div className="text-center mb-9">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <KeyRound size={28} />
                    </div>
                    <h1 className="m-0 mb-2 text-gray-800 text-4xl font-bold dark:text-white">Verify OTP</h1>
                    <p className="text-gray-500 text-sm m-0">Enter the code sent to {otpSentTo || "your email"}</p>
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

                {otpCode && (
                    <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-yellow-800">
                        <MailOpen size={20} />
                        <span className="text-sm">Demo OTP: {otpCode}</span>
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
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg text-white font-bold text-base border-none transition-all duration-300 ${
                            loading
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
                        className="text-yellow-600 cursor-pointer border-none bg-transparent font-bold hover:text-yellow-700"
                    >
                        Resend OTP
                    </button>
                </div>
            </div>
        </main>
    );
}
