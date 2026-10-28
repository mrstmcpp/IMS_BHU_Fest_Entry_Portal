const IST = { timeZone: "Asia/Kolkata" };

export const formatDateTimeIST = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", { ...IST, day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
    : "—";

export const formatTimeIST = (date) =>
  date ? new Date(date).toLocaleTimeString("en-IN", { ...IST, hour: "numeric", minute: "2-digit" }) : "—";

// Today's date in India as YYYY-MM-DD (for <input type="date"> limits)
export const todayISTInputValue = () => new Date().toLocaleDateString("en-CA", IST);

export const timeAgo = (date, now = Date.now()) => {
  if (!date) return "Never";
  const seconds = Math.max(0, Math.round((now - new Date(date).getTime()) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

export const normalizePassId = (id) => id.trim().replace(/\s+/g, "").toUpperCase();
