import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import HaswaniLogo from "../../assets/logo/HaswaniLogo.png";
import {
  Home,
  LayoutGrid,
  ClipboardList,
  ShoppingCart,
  LogOut,
  Package,
  X,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import BASE_URL from "../../config/api";

const isActive = (status) =>
  status == null ||
  status === true ||
  status === 1 ||
  ["active", "1", "true"].includes(String(status).trim().toLowerCase());

const getRecords = (response, keys) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
  }
  return Array.isArray(data?.data) ? data.data : [];
};

const toArray = (value) =>
  value == null || value === "" ? [] : Array.isArray(value) ? value : [value];

const getId = (value) => {
  if (value == null) return "";
  if (typeof value === "object") {
    return String(
      value._id ?? value.id ?? value.title ?? value.name ??
      value.subcategory ?? value.subCategory ?? value.category ?? ""
    );
  }
  return String(value);
};

const getName = (value) => {
  if (value == null) return "";
  if (typeof value === "object") {
    return String(
      value.title ?? value.name ?? value.subcategory ??
      value.subCategory ?? value.category ?? value._id ?? value.id ?? ""
    );
  }
  return String(value);
};

const sameReference = (a, b) => {
  if (!a || !b) return false;
  const aKeys = [getId(a), getName(a)].map((s) => s.toLowerCase().trim());
  const bKeys = [getId(b), getName(b)].map((s) => s.toLowerCase().trim());
  return aKeys.some((key) => key && bKeys.includes(key));
};

const DealerNavbar = () => {
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [storedCategories, setStoredCategories] = useState([]);
  const [storedSubCategories, setStoredSubCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");


 const categoryCloseTimer = useRef(null);

const handleCategoryMouseEnter = () => {
  clearTimeout(categoryCloseTimer.current);
  setCategoryMenuOpen(true);
};

const handleCategoryMouseLeave = () => {
  clearTimeout(categoryCloseTimer.current);

  categoryCloseTimer.current = setTimeout(() => {
    setCategoryMenuOpen(false);
  }, 1000);
};

useEffect(() => {
  return () => clearTimeout(categoryCloseTimer.current);
}, []);

  const navigate = useNavigate();
  const { totalCartCount } = useCart();

  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError("");

      const requests = await Promise.allSettled([
        axios.get(`${BASE_URL}/api/products`, { signal: controller.signal }),
        axios.get(`${BASE_URL}/api/categories`, { signal: controller.signal }),
        axios.get(`${BASE_URL}/api/subcategories`, { signal: controller.signal }),
      ]);

      if (controller.signal.aborted) return;

      const [productResult, categoryResult, subcategoryResult] = requests;

      if (productResult.status === "fulfilled") {
        setProducts(
          getRecords(productResult.value, ["products", "items", "results"])
            .filter((product) => isActive(product.status))
        );
      } else {
        console.error("DealerNavbar products:", productResult.reason);
      }

      if (categoryResult.status === "fulfilled") {
        setStoredCategories(
          getRecords(categoryResult.value, ["categories", "category", "results"])
            .filter((category) => isActive(category.status))
        );
      } else {
        console.warn("DealerNavbar categories:", categoryResult.reason);
      }

      if (subcategoryResult.status === "fulfilled") {
        setStoredSubCategories(
          getRecords(subcategoryResult.value, ["subcategories", "subCategories", "results"])
            .filter((sub) => isActive(sub.status))
        );
      } else {
        console.warn("DealerNavbar subcategories:", subcategoryResult.reason);
      }

      if (
        productResult.status === "rejected" &&
        categoryResult.status === "rejected"
      ) {
        setCategoriesError("Unable to load categories.");
      }

      setCategoriesLoading(false);
    };

    loadCategories();
    return () => controller.abort();
  }, []);

  const categories = useMemo(() => {
    const map = new Map();
    const all = [
      ...storedCategories,
      ...products.flatMap((product) => toArray(product.category)),
    ];

    all.forEach((category) => {
      const id = getId(category);
      const name = getName(category);
      if (id && name && !map.has(id)) {
        map.set(id, { id, name });
      }
    });

    return [...map.values()].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );
  }, [storedCategories, products]);

  const getSubCategories = (category) => {
    const relatedProducts = products.filter((product) =>
      toArray(product.category).some((item) => sameReference(item, category))
    );

    const fromCollection = storedSubCategories.filter((sub) => {
      const parent = sub.category ?? sub.categoryId ?? sub.category_id;
      return parent && sameReference(parent, category);
    });

    const map = new Map();
    [
      ...fromCollection,
      ...relatedProducts.flatMap((product) =>
        toArray(product.subCategory ?? product.subcategory ?? product.subcategories)
      ),
    ].forEach((sub) => {
      const id = getId(sub);
      const name = getName(sub);
      if (id && name && !map.has(id)) {
        map.set(id, { id, name });
      }
    });

    return [...map.values()].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("dealerToken");
    localStorage.removeItem("dealer");
    setCategoryMenuOpen(false);
    navigate("/dealer-login");
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-2 font-medium transition ${
      isActive
        ? "text-[#b18152] border-b-2 border-[#b18152] pb-1"
        : "text-gray-700 hover:text-[#b18152]"
    }`;

  const openCategoryPage = (category, subCategory) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category.id);
    if (subCategory) params.set("subcategory", subCategory.id);
    clearTimeout(categoryCloseTimer.current);
    setCategoryMenuOpen(false);
    navigate(`/dealer/categories${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-md">
     {/* LOGO */}
<div className="relative flex justify-center items-center py-4 border-b h-[112px]">
  <img
    src={HaswaniLogo}
    alt="Haswani Handicrafts"
    className="absolute h-[220px] w-auto max-w-none object-contain"
  />
</div>

      {/* NAVIGATION */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          {/* LEFT MENU */}
          <div className="flex items-center gap-10">
            <NavLink to="/dealer" end className={navClass}>
              <Home size={18} />
              Home
            </NavLink>

            {/* CATEGORIES + FULL WIDTH MEGA MENU */}
            <div
              className="h-full flex items-center"
              onMouseEnter={handleCategoryMouseEnter}
              onMouseLeave={handleCategoryMouseLeave}
            >
              <button
                type="button"
                onClick={() => openCategoryPage()}
                className="flex items-center gap-2 font-medium text-gray-700 hover:text-[#b18152] transition duration-200 h-full whitespace-nowrap"
              >
                <LayoutGrid size={18} />
                Categories
              </button>

              {categoryMenuOpen && (
                <div
                  className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-[100]"
                  onMouseEnter={handleCategoryMouseEnter}
                  onMouseLeave={handleCategoryMouseLeave}
                >
                  <div className="w-full max-w-[1600px] mx-auto px-12 py-10">
                    {categoriesLoading && categories.length === 0 ? (
                      <div className="text-center py-10 text-gray-500 text-lg">
                        Loading Categories...
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="text-center py-10 text-gray-500 text-lg">
                        {categoriesError || "No Categories Available"}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-16 gap-y-12">
                        {categories.map((category) => {
                          const subCategories = getSubCategories(category);

                          return (
                            <div key={category.id} className="min-w-0">
                              <button
                                type="button"
                                onClick={() => openCategoryPage(category)}
                                className="block w-full text-left text-xl md:text-2xl font-semibold text-gray-900 hover:text-[#b18152] transition duration-200 leading-tight mb-4 whitespace-normal"
                              >
                                {category.name}
                              </button>

                              <div className="space-y-2">
                                {subCategories.map((subCategory) => (
                                  <button
                                    type="button"
                                    key={subCategory.id}
                                    onClick={() => openCategoryPage(category, subCategory)}
                                    className="block w-full text-left text-base leading-6 text-gray-700 hover:text-[#b18152] transition duration-150 whitespace-normal"
                                  >
                                    {subCategory.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/dealer/exclusive-products"
              className={navClass}
              onClick={() => setCategoryMenuOpen(false)}
            >
              <Package size={18} />
              Catalogue
            </NavLink>

            <NavLink
              to="/dealer/orders"
              className={navClass}
              onClick={() => setCategoryMenuOpen(false)}
            >
              <ClipboardList size={18} />
              My Orders
            </NavLink>
          </div>

          {/* RIGHT MENU */}
          <div className="flex items-center gap-8">
            <NavLink
              to="/dealer/cart"
              className="relative text-gray-700 hover:text-[#b18152]"
              onClick={() => setCategoryMenuOpen(false)}
            >
              <ShoppingCart size={24} />
              <span className="absolute -top-2 -right-3 bg-[#b18152] text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {totalCartCount}
              </span>
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DealerNavbar;

