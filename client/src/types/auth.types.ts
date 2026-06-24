export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "seller" | "admin";
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

// REQUEST TYPES
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  purpose: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// RESPONSE TYPES
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface MessageResponse {
  success: boolean;
  message: string;
}
