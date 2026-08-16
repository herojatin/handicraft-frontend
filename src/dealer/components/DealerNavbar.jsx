import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutGrid,
  ClipboardList,
  ShoppingCart,
  LogOut,
  Package,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const DealerNavbar = () => {
  const navigate = useNavigate();
  const { totalCartCount } = useCart();

  const handleLogout = () => {
    localStorage.removeItem("dealerToken");
    localStorage.removeItem("dealer");
    navigate("/dealer-login");
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-2 font-medium transition ${
      isActive
        ? "text-[#b18152] border-b-2 border-[#b18152] pb-1"
        : "text-gray-700 hover:text-[#b18152]"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-md">
      {/* Logo */}
      <div className="flex justify-center py-4 border-b">
        <img
          src="/logo.png"
          alt="Haswani Handicrafts"
          className="h-20 object-contain"
        />
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        {/* Left Menu */}
        <div className="flex items-center gap-10">
          <NavLink to="/dealer" end className={navClass}>
            <Home size={18} />
            Home
          </NavLink>

          <NavLink to="/dealer/categories" className={navClass}>
            <LayoutGrid size={18} />
            Categories
          </NavLink>

          <NavLink to="/dealer/exclusive-products" className={navClass}>
            <Package size={18} />
            Exclusive Products
          </NavLink>

          <NavLink to="/dealer/orders" className={navClass}>
            <ClipboardList size={18} />
            My Orders
          </NavLink>
        </div>

        {/* Right Menu */}
        <div className="flex items-center gap-8">
          <NavLink
            to="/dealer/cart"
            className="relative text-gray-700 hover:text-[#b18152]"
          >
            <ShoppingCart size={24} />

            <span className="absolute -top-2 -right-3 bg-[#b18152] text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {totalCartCount}
            </span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DealerNavbar;