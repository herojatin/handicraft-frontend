export const BASE_URL =
  import.meta.env.VITE_BASE_URL;

  if (!BASE_URL) {
  console.error(
    "VITE_BASE_URL is not defined in .env"
  );
}

export default BASE_URL;