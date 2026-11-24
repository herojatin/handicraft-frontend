const BASE_URL = (
  import.meta.env.VITE_BASE_URL || "http://localhost:5000"
).trim().replace(/\s+/g, "").replace(/\/+$/, "");

console.log("========== API DEBUG ==========");
console.log("BASE URL:", BASE_URL);
console.log(
  "LOGIN URL:",
  `${BASE_URL}/api/dealers/login`
);
console.log("================================");

export { BASE_URL };
export default BASE_URL;