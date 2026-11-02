
import { Navigate, Outlet } from "react-router-dom";

export default function DealerProtectedRoute() {
  const dealerToken = localStorage.getItem("dealerToken");

  // Redirect unauthenticated users to Home
  if (
    !dealerToken ||
    dealerToken === "undefined" ||
    dealerToken === "null"
  ) {
    return <Navigate to="/" replace />;
  }

  // Authenticated dealer can access protected pages
  return <Outlet />;
}
