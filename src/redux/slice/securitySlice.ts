import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface PendingUser {
    username: string;
    email: string;
}

interface SecurityState {
    twoFactorEnabled: boolean;
    otpVerified: boolean;
    otpCode: string;
    otpSentTo: string;
    otpExpiresAt: number | null;
    pendingUser: PendingUser | null;
}

const getInitialTwoFactorStatus = () => {
    if (typeof window === "undefined") {
        return false;
    }

    return localStorage.getItem("twoFactorEnabled") === "true";
};

const getInitialOtpSession = () => {
    if (typeof window === "undefined") {
        return {
            otpCode: "",
            otpSentTo: "",
            otpExpiresAt: null,
            pendingUser: null
        };
    }

    const storedOtpSession = sessionStorage.getItem("otpSession");

    if (!storedOtpSession) {
        return {
            otpCode: "",
            otpSentTo: "",
            otpExpiresAt: null,
            pendingUser: null
        };
    }

    try {
        return JSON.parse(storedOtpSession) as Pick<SecurityState, "otpCode" | "otpSentTo" | "otpExpiresAt" | "pendingUser">;
    } catch {
        sessionStorage.removeItem("otpSession");
        return {
            otpCode: "",
            otpSentTo: "",
            otpExpiresAt: null,
            pendingUser: null
        };
    }
};

const initialOtpSession = getInitialOtpSession();

const initialState: SecurityState = {
    twoFactorEnabled: getInitialTwoFactorStatus(),
    otpVerified: false,
    otpCode: initialOtpSession.otpCode,
    otpSentTo: initialOtpSession.otpSentTo,
    otpExpiresAt: initialOtpSession.otpExpiresAt,
    pendingUser: initialOtpSession.pendingUser
}

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const persistOtpSession = (state: SecurityState) => {
    if (typeof window === "undefined") {
        return;
    }

    sessionStorage.setItem("otpSession", JSON.stringify({
        otpCode: state.otpCode,
        otpSentTo: state.otpSentTo,
        otpExpiresAt: state.otpExpiresAt,
        pendingUser: state.pendingUser
    }));
};

const securitySlice = createSlice({
    name: "security",
    initialState,
    reducers: {
        setTwoFactorEnabled: (state, action: PayloadAction<boolean>) => {
            state.twoFactorEnabled = action.payload;
            state.otpVerified = false;

            if (typeof window !== "undefined") {
                localStorage.setItem("twoFactorEnabled", String(action.payload));
            }
        },
        sendOtp: (state, action: PayloadAction<PendingUser>) => {
            state.pendingUser = action.payload;
            state.otpCode = generateOtp();
            state.otpSentTo = action.payload.email;
            state.otpExpiresAt = Date.now() + 5 * 60 * 1000;
            state.otpVerified = false;
            persistOtpSession(state);
        },
        setOtpVerified: (state, action: PayloadAction<boolean>) => {
            state.otpVerified = action.payload;
        },
        clearOtpSession: (state) => {
            state.otpCode = "";
            state.otpSentTo = "";
            state.otpExpiresAt = null;
            state.pendingUser = null;
            state.otpVerified = false;

            if (typeof window !== "undefined") {
                sessionStorage.removeItem("otpSession");
            }
        }
    }
});

export const {
    setTwoFactorEnabled,
    sendOtp,
    setOtpVerified,
    clearOtpSession
} = securitySlice.actions;

export default securitySlice.reducer;
