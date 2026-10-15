export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? "" // Relative path when served behind reverse proxy / single domain
    : "http://127.0.0.1:8000");
