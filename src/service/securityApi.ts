import api from "./api";

export interface CurrentUserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
}

export const getCurrentUser = async (): Promise<CurrentUserInfo> =>{
    const res=await api.get("admin/auth/me");
    return res?.data?.data;
}

export const changePassword=async(currentPassword:string,newPassword:string)=>{
    const response=await api.patch("admin/auth/change-password",{
        currentPassword,
        newPassword
    })
    return response?.data;
}

export const toggleTwoFactor = async (enabled: boolean, otp?: string) => {
  const res = await api.patch("admin/auth/two-factor", { enabled, otp });
  return res.data;
};

export const sendTwoFactorOtp=async(email:string)=>{
    const res=await api.post("/otp/send",{identifier:email,otpType: "TWO_FACTOR_SETUP"});
    return res?.data
}
