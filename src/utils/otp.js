import otpGenerator from "otp-generator";

// ✅ Generate OTP
export const generateOTP = (length = 4) => {
  return otpGenerator.generate(length, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

// ✅ OTP Expiry (10 minutes from now)
export const generateOTPExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
