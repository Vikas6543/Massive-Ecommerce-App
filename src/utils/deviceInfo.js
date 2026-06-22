import { UAParser } from "ua-parser-js";

// ✅ Parse device info from request
export const getDeviceInfo = (req) => {
  const ua = req.headers["user-agent"] || "";
  const parser = new UAParser(ua);
  const result = parser.getResult();

  return {
    browser:
      `${result.browser.name || "Unknown"} ${result.browser.version || ""}`.trim(),
    os: `${result.os.name || "Unknown"} ${result.os.version || ""}`.trim(),
    platform: result.device.type || "desktop",
  };
};

// ✅ Get IP address from request
export const getIPAddress = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "Unknown"
  );
};

// ✅ Check if device is new (not in sessions)
export const isNewDevice = (sessions, deviceInfo, ipAddress) => {
  return !sessions.some(
    (session) =>
      session.deviceInfo?.browser === deviceInfo.browser &&
      session.deviceInfo?.os === deviceInfo.os &&
      session.ipAddress === ipAddress,
  );
};
