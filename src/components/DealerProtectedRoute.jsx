
import { Navigate, Outlet, useLocation } from "react-router-dom";

const DealerProtectedRoute = () => {
  const location = useLocation();
  const token = localStorage.getItem("dealerToken");

  if (!token) {
    return (
      <Navigate
        to="/dealer-login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default DealerProtectedRoute;
