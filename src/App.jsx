import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import "./index.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Dealer from "./pages/Dealer";
import FairandEvents from "./pages/FairandEvents";
import ProductTour from "./pages/ProductTour";
import Testimonials from "./pages/Testimonials";
import ProductDetail from "./pages/ProductDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminEvents from "./pages/AdminEvents";
import AdminRoute from "./components/AdminRoute";
import AddEvent from "./components/AddEvent";
import DealerHome from "./dealer/pages/DealerHome";
import DealerLayout from "./dealer/layout/DealerLayout";
import DealerOrders from "./dealer/pages/DealerOrders";
import DealerCart from "./dealer/pages/DealerCart";
import Categories from "./dealer/pages/Categories";
import ExclusiveProducts from "./dealer/pages/ExclusiveProducts";
export default function App() {
  const location = useLocation();


  // Hide navbar on admin pages
  const hidePublicNavbar =
  location.pathname.startsWith("/admin") ||
  location.pathname.startsWith("/admin-login") ||
  location.pathname.startsWith("/dealer");

  const token = localStorage.getItem("token");

  return (
    <>
      {!hidePublicNavbar && <Navbar />}

      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<Home />} />
        
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dealer-login" element={<Dealer />} />
        <Route path="/fairandevents" element={<FairandEvents />} />
        <Route path="/product-tour" element={<ProductTour />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/product/:id" element={<ProductDetail />} />
       <Route path="/dealer" element={<DealerLayout />}>
      <Route index element={<DealerHome />} />
      <Route path="orders" element={<DealerOrders />} />
      <Route path="cart" element={<DealerCart />} />
      </Route>
      <Route path="/dealer/categories" element={<Categories />} />
      <Route path="/dealer/exclusive-products" element={<ExclusiveProducts />}
/>

        {/* Admin Login */}
        <Route
          path="/admin-login"
          element={
            token ? (
              <Navigate to="/admin" replace />
            ) : (
              <AdminLogin />
            )
          }
        />

        {/* Protected Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AdminEvents />} />

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

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}