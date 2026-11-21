export const BASE_URL =
  import.meta.env.VITE_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

export default BASE_URL;