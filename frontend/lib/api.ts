export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? "" // Relative path when served behind reverse proxy / single domain
    : "http://127.0.0.1:8000");

export const getApiUrl = () => API_BASE;

export const getWsUrl = () => {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  if (typeof window !== "undefined") {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return `${proto}//${window.location.host}/ws`;
    }
  }
  return "ws://127.0.0.1:8000/ws";
};

