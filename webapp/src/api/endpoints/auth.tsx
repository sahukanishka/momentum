import { GET, POST } from "../https";

export const registerUser = (data: any) =>
  POST({
    url: "/api/v1/auth/register",
    data,
  });

export const verifyEmail = (data: any) =>
  POST({
    url: "/api/v1/auth/verify-email",
    data,
  });

export const loginUser = (data: any) =>
  POST({
    url: "/api/v1/auth/login",
    data,
  });

export const logoutUser = () =>
  POST({
    url: "/api/v1/auth/logout",
    data: {},
  });

interface SendOtpData {
  email: string;
}

export const sendOtp = (data: SendOtpData) =>
  POST({
    url: "/api/v1/auth/send-otp",
    data,
  });

interface ResetPasswordData {
  email: string;
  otp: string;
  password: string;
}

export const resetPassword = (data: ResetPasswordData) =>
  POST({
    url: "/api/v1/auth/reset-password",
    data,
  });

export const getMyProfile = () =>
  GET({
    url: "/api/v1/auth/me",
    data: {},
  });
