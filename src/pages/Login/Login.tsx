import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { loginProps } from "../../utils/LoginInterfce.ts";
import AllInputFields from "../../component/AllInputFields/AllInputFields.tsx";
import { AlertCircle, CheckCircle, MailOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login, completeLogin } = useAuth();

    const [getLoginData, setGetLoginData] = useState<loginProps>({
        username: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [otpPending, setOtpPending] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (!getLoginData.username || !getLoginData.password) {
            setError("Email and password are required");
            return;
        }

        setLoading(true);
        try {
            const result = await login(getLoginData.username, getLoginData.password);
            console.log(result);

            if (!result) {
                setError("Invalid email or password");
                return;
            }

            if (result.requiresOtp) {
                setSuccess(true);
                setOtpPending(true);
                sessionStorage.setItem("pendingLoginEmail", result.email);
                setGetLoginData({ username: "", password: "" });
                setTimeout(() => {
                    navigate("/verify-otp");
                }, 500);
                return;
            }

            setSuccess(true);
            setGetLoginData({ username: "", password: "" });
            completeLogin({ username: result.username ?? "", email: result.email });

            setTimeout(() => {
                navigate("/admin-dashboard");
            }, 500);
        } catch (err) {
            setError("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex justify-center items-center flex-col min-h-screen bg-gradient-to-br from-yellow-500 to-orange-600 font-sans">
            <div className="border-none p-12 rounded-2xl shadow-2xl bg-white dark:bg-gray-900 w-full max-w-md lg:max-w-lg">
                <div className="text-center mb-9">
                    <h1 className="m-0 mb-2 text-gray-800 text-4xl font-bold">Admin Dashboard</h1>
                    <p className="text-gray-500 text-sm m-0">Sign in to your account</p>
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
                        <span className="text-sm">
                            {otpPending ? "New device detected — verification code sent! Redirecting..." : "Login successful! Redirecting..."}
                        </span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <AllInputFields
                        label="Email"
                        type="email"
                        icon={MailOpen}
                        isDropDown={false}
                        placeholder="Enter Your Email"
                        name="email"
                        value={getLoginData.username}
                        onChange={(event) => {
                            setGetLoginData(prev => ({ ...prev, username: event.target.value }));
                            setError("");
                        }}
                        labelFor="email"
                        required={true}
                    />
                    <AllInputFields
                        type="password"
                        label="Password"
                        isDropDown={false}
                        value={getLoginData.password}
                        labelFor="password"
                        name="password"
                        onChange={(event) => {
                            setGetLoginData(prev => ({ ...prev, password: event.target.value }));
                            setError("");
                        }}
                        placeholder="Enter your password"
                        required={true}
                    />
                    <div className="w-full mt-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-lg text-white font-bold text-base border-none transition-all duration-300 ${loading
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-yellow-500 hover:bg-yellow-600 shadow-lg hover:shadow-xl cursor-pointer"
                                }`}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </div>
                </form>

                <div className="mt-5 text-center">
                    <p className="text-gray-600 text-sm">
                        <span>Don't have an account? Contact </span>
                        <span className="text-yellow-500 cursor-pointer font-bold hover:text-yellow-600">Admin</span>
                    </p>
                </div>
            </div>
        </main>
    )
}