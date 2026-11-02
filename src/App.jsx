
import {
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import "./index.css";

// Public Navbar
import Navbar from "./components/Navbar";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Dealer from "./pages/Dealer";
import FairandEvents from "./pages/FairandEvents";
import ProductTour from "./pages/ProductTour";
import Testimonials from "./pages/Testimonials";
import ProductDetail from "./pages/ProductDetail";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminEvents from "./pages/AdminEvents";
import AdminRoute from "./components/AdminRoute";
import AddEvent from "./components/AddEvent";

// Dealer Pages
import DealerProtectedRoute from "./components/DealerProtectedRoute";
import DealerHome from "./dealer/pages/DealerHome";
import DealerLayout from "./dealer/layout/DealerLayout";
import DealerOrders from "./dealer/pages/DealerOrders";
import DealerCart from "./dealer/pages/DealerCart";
import Categories from "./dealer/pages/Categories";
import ExclusiveProducts from "./dealer/pages/ExclusiveProducts";

export default function App() {
  const location = useLocation();

  // Hide public navbar only on admin and protected dealer pages
  const hidePublicNavbar =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/dealer" ||
    location.pathname.startsWith("/dealer/");

  // Existing admin authentication token
  const adminToken = localStorage.getItem("token");

  return (
    <>
      {/* Public Navbar */}
      {!hidePublicNavbar && <Navbar />}

      <Routes>
        {/* ==================================
            PUBLIC WEBSITE ROUTES
        ================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/dealer-login"
          element={<Dealer />}
        />

        <Route
          path="/fairandevents"
          element={<FairandEvents />}
        />

        <Route
          path="/product-tour"
          element={<ProductTour />}
        />

        <Route
          path="/testimonials"
          element={<Testimonials />}
        />

        <Route
          path="/product/:id"
          element={<ProductDetail />}
        />

        {/* ==================================
            PROTECTED DEALER ROUTES
        ================================== */}

        <Route element={<DealerProtectedRoute />}>
          <Route
            path="/dealer"
            element={<DealerLayout />}
          >
            {/* Dealer Ready Stock */}
            <Route
              index
              element={<DealerHome />}
            />

            {/* Dealer Orders */}
            <Route
              path="orders"
              element={<DealerOrders />}
            />

            {/* Dealer Cart */}
            <Route
              path="cart"
              element={<DealerCart />}
            />

            {/* Dealer Categories */}
            <Route
              path="categories"
              element={<Categories />}
            />

            {/* Exclusive Products */}
            <Route
              path="exclusive-products"
              element={<ExclusiveProducts />}
            />
          </Route>
        </Route>

        {/* ==================================
            ADMIN LOGIN
        ================================== */}

        <Route
          path="/admin-login"
          element={
            adminToken ? (
              <Navigate to="/admin" replace />
            ) : (
              <AdminLogin />
            )
          }
        />

        {/* ==================================
            PROTECTED ADMIN ROUTES
        ================================== */}

        <Route element={<AdminRoute />}>
          <Route
            path="/admin"
            element={<AdminDashboard />}
          >
            <Route
              index
              element={<AdminEvents />}
            />

            <Route
              path="add-event"
              element={<AddEvent />}
            />

            <Route
              path="edit-event/:id"
              element={<AddEvent />}
            />
          </Route>
        </Route>

        {/* ==================================
            UNKNOWN ROUTES
        ================================== */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </>
  );
}
