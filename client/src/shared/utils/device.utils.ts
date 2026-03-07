/**
 * Utility to identify the current device/browser environment.
 */
export const getDeviceInfo = (): string => {
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    let os = "Unknown OS";

    // Detect OS
    if (ua.indexOf("Win") !== -1) os = "Windows";
    if (ua.indexOf("Mac") !== -1) os = "macOS";
    if (ua.indexOf("X11") !== -1) os = "Linux";
    if (ua.indexOf("Linux") !== -1) os = "Linux";
    if (ua.indexOf("Android") !== -1) os = "Android";
    if (ua.indexOf("like Mac") !== -1) os = "iOS";

    // Detect Browser
    if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
    if (ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1) browser = "Safari";
    if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
    if (ua.indexOf("Edge") !== -1) browser = "Edge";

    // Refinement for "Laptop/PC" vs "Mobile"
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const deviceType = isMobile ? "Mobile" : "PC";

    // Specific mapping as requested (e.g., Windows 11 Laptop)
    // Note: Accurate OS version detection is hard with just UA, but we can approximate.
    if (os === "Windows") {
        return `${os} Laptop/PC (${browser})`;
    }

    return `${os} ${deviceType} (${browser})`;
};
