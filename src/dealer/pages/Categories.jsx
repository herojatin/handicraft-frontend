
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  X,
  LayoutGrid,
  Package,
} from "lucide-react";

import ProductCard from "../components/ProductCard";
import QuickViewModal from "../components/QuickViewModal";
import { useCart } from "../context/CartContext";
import BASE_URL from "../../config/api";

// ==========================================
// CONFIGURATION
// ==========================================

const PRODUCTS_PER_PAGE = 12;
const MAX_VISIBLE_PAGES = 5;

// ==========================================
// HELPERS
// ==========================================

// Handle active statuses from different schemas.
const isActive = (status) => {
  if (status === undefined || status === null) {
    return true;
  }

  return (
    status === 1 ||
    status === true ||
    String(status).trim().toLowerCase() === "1" ||
    String(status).trim().toLowerCase() === "active"
  );
};

// Normalize category and subcategory values.
const getId = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return String(
      value._id ||
        value.id ||
        value.title ||
        value.name ||
        value.subcategory ||
        value.category ||
        ""
    );
  }

  return String(value);
};

const getName = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return String(
      value.title ||
        value.name ||
        value.subcategory ||
        value.subCategory ||
        value.category ||
        value._id ||
        ""
    );
  }

  return String(value);
};

const toArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  return [value];
};

// Accept common API response shapes without changing existing backend.
const getRecords = (response, keys) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
  }
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const sameReference = (a, b) => {
  const left = [getId(a), getName(a)].map(x => x.toLowerCase());
  const right = [getId(b), getName(b)].map(x => x.toLowerCase());
  return left.some(x => x && right.includes(x));
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const Categories = () => {
  const navigate = useNavigate();
  // ==========================================
  // STATES
  // ==========================================

  const [products, setProducts] = useState([]);
  const [storedCategories, setStoredCategories] = useState([]);
  const [storedSubCategories, setStoredSubCategories] = useState([]);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [selectedSubCategory, setSelectedSubCategory] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(true);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const productsRef = useRef(null);

  const { addToCart } = useCart();

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // Categories have their own collection; do not depend on products
        // existing or being active for category headings to appear.
        const [productResult, categoryResult, subResult] = await Promise.allSettled([
          (async () => {
            // Backend paginates /api/products; fetch every page for client-side filters.
            const all = [];
            let page = 1;
            while (true) {
              const response = await axios.get(`${BASE_URL}/api/products`, {
                signal: controller.signal,
                params: { page, limit: 100, status: "active" },
              });
              all.push(...getRecords(response, ["products", "items", "results"]));
              const pages = Number(response.data?.pagination?.totalPages || 1);
              if (page >= pages) break;
              page += 1;
            }
            return { data: { products: all } };
          })(),
          axios.get(`${BASE_URL}/api/categories`, { signal: controller.signal }),
          axios.get(`${BASE_URL}/api/subcategories`, { signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;

        if (productResult.status === "fulfilled") {
          setProducts(
            getRecords(productResult.value, ["products", "items", "results"])
              .filter(p => isActive(p.status))
          );
        } else {
          console.error("PRODUCTS API:", productResult.reason);
          setError("Unable to load products.");
        }

        if (categoryResult.status === "fulfilled") {
          setStoredCategories(
            getRecords(categoryResult.value, ["categories", "category", "results"])
              .filter(c => isActive(c.status))
          );
        } else {
          console.warn("Categories endpoint unavailable; using product categories.", categoryResult.reason);
        }

        if (subResult.status === "fulfilled") {
          setStoredSubCategories(
            getRecords(subResult.value, ["subcategories", "subCategories", "results"])
              .filter(c => isActive(c.status))
          );
        } else {
          console.warn("Subcategories endpoint unavailable; using product subcategories.", subResult.reason);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("CATEGORY PAGE ERROR:", err);
          setError("Unable to load categories.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, []);

  // ==========================================
  // BUILD CATEGORY OPTIONS
  // ==========================================

  const categories = useMemo(() => {
    const map = new Map();
    [...storedCategories, ...products.flatMap(p => toArray(p.category))]
      .forEach(category => {
        const id = getId(category);
        const name = getName(category);
        if (id && name && ![...map.values()].some(c => c.name.toLowerCase() === name.toLowerCase())) map.set(id, { id, name });
      });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [products, storedCategories]);

  // ==========================================
  // INITIAL SELECTION + NAVBAR URL PARAMETERS
  // ==========================================

  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");

  useEffect(() => {
    if (!categories.length) return;

    if (categoryParam) {
      const matchingCategory = categories.find(
        (category) => category.id === categoryParam ||
          category.name.toLowerCase() === categoryParam.toLowerCase()
      );
      if (matchingCategory) {
        setShowAllProducts(false);
        setSelectedCategory(matchingCategory.id);
        setSelectedSubCategory(subcategoryParam || "");
        setCurrentPage(1);
        setMenuOpen(false);
      }
    } else if (!showAllProducts && !selectedCategory) {
      setSelectedCategory(categories[0].id);
      setSelectedSubCategory("");
    }
  }, [categories, categoryParam, subcategoryParam]);

  // ==========================================
  // PRODUCTS BELONGING TO CATEGORY
  // ==========================================

  const categoryProducts = useMemo(() => {
    if (!selectedCategory) return [];

    return products.filter((product) =>
      toArray(product.category).some(
        (category) =>
          sameReference(category, categories.find(c => c.id === selectedCategory))
      )
    );
  }, [products, selectedCategory, categories]);

  // ==========================================
  // SUBCATEGORIES FOR SELECTED CATEGORY
  // ==========================================

  const subCategories = useMemo(() => {
    const map = new Map();
    const selected = categories.find(c => c.id === selectedCategory);
    const stored = storedSubCategories.filter(sub => {
      const parent = sub.category ?? sub.categoryId ?? sub.category_id;
      return parent && sameReference(parent, selected);
    });
    [...stored, ...categoryProducts.flatMap(p =>
      toArray(p.subCategory ?? p.subcategory ?? p.subcategories)
    )].forEach(sub => {
      const id = getId(sub);
      const name = getName(sub);
      if (id && name && !map.has(id)) map.set(id, { id, name });
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [categoryProducts, storedSubCategories, categories, selectedCategory]);

  // ==========================================
  // FILTER PRODUCTS
  // ==========================================

  const filteredProducts = useMemo(() => {
    if (showAllProducts || !selectedCategory) return products;

    if (!selectedSubCategory) {
      return categoryProducts;
    }

    const selected = subCategories.find(s =>
      s.id === selectedSubCategory || s.name.toLowerCase() === selectedSubCategory.toLowerCase()
    );
    if (!selected) return [];
    return categoryProducts.filter((product) => {
      const byName = toArray(
        product.subCategory ?? product.subcategory ?? product.subcategories
      ).some(sub => sameReference(sub, selected));
      const serial = product.subcategory_serial_id;
      const matchingStored = storedSubCategories.find(sub =>
        sameReference(sub, selected) &&
        (String(sub.subcategory_serial_id ?? "") === String(serial ?? ""))
      );
      return byName || Boolean(matchingStored && serial != null);
    });
  }, [
    products,
    showAllProducts,
    categoryProducts,
    selectedCategory,
    selectedSubCategory,
    subCategories,
    storedSubCategories,
  ]);

  // ==========================================
  // CATEGORY DISPLAY NAME
  // ==========================================

  const selectedCategoryName =
    categories.find(
      (category) =>
        category.id === selectedCategory
    )?.name || "";

  const selectedSubCategoryName =
    subCategories.find(
      (subCategory) =>
        subCategory.id === selectedSubCategory
    )?.name || "";

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalProducts = filteredProducts.length;

  const totalPages = Math.ceil(
    totalProducts / PRODUCTS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * PRODUCTS_PER_PAGE;

  const endIndex = Math.min(
    startIndex + PRODUCTS_PER_PAGE,
    totalProducts
  );

  const currentProducts = filteredProducts.slice(
    startIndex,
    endIndex
  );

  // ==========================================
  // FIVE VISIBLE PAGE NUMBERS
  // ==========================================

  const visiblePages = useMemo(() => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    let startPage = Math.max(
      1,
      currentPage - 3
    );

    if (
      startPage + MAX_VISIBLE_PAGES - 1 >
      totalPages
    ) {
      startPage =
        totalPages - MAX_VISIBLE_PAGES + 1;
    }

    return Array.from(
      { length: MAX_VISIBLE_PAGES },
      (_, index) => startPage + index
    );
  }, [currentPage, totalPages]);

  // ==========================================
  // CHANGE PAGE
  // ==========================================

  const changePage = (page) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    setCurrentPage(page);

    productsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // ==========================================
  // CATEGORY SELECTION
  // ==========================================

  const handleCategoryClick = (categoryId) => {
    setShowAllProducts(false);
    setSearchParams({ category: categoryId });
    setSelectedCategory(categoryId);
    setSelectedSubCategory("");
    setCurrentPage(1);
    setMenuOpen(false);
    requestAnimationFrame(() => productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  // ==========================================
  // SUBCATEGORY SELECTION
  // ==========================================

  const handleSubCategoryClick = (
    categoryId,
    subCategoryId
  ) => {
    setShowAllProducts(false);
    setSearchParams({ category: categoryId, subcategory: subCategoryId });
    setSelectedCategory(categoryId);
    setSelectedSubCategory(subCategoryId);
    setCurrentPage(1);
    setMenuOpen(false);
    requestAnimationFrame(() => productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  // ==========================================
  // QUICK VIEW
  // ==========================================

  const handleQuickView = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = (product) => {
    try {
      addToCart(product);
    } catch (err) {
      console.error(
        "ADD TO CART ERROR:",
        err
      );
      alert("Unable to add product to cart.");
    }
  };

  // ==========================================
  // JSX
  // ==========================================

  return (
    <div className="min-h-screen bg-[#f7f7f7]">

      {/* ======================================
          CATEGORY MEGA MENU
      ====================================== */}

      <div className="w-full bg-white border-b shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex flex-wrap items-center gap-5">
            <button
  type="button"
  onClick={() => navigate("/dealer")}
  className="inline-flex items-center gap-2 font-semibold text-gray-800 hover:text-[#b18152] transition-colors duration-200 cursor-pointer"
>
  <Package size={19} />
  All Products
          </button>
            <button type="button" onClick={() => setMenuOpen(v => !v)} className="inline-flex items-center gap-2 font-semibold text-gray-800 hover:text-[#b18152] cursor-pointer">
              <LayoutGrid size={19} /> {menuOpen ? "Categories & Subcategories" : "Show Categories & Subcategories"}
            </button>
          </div>
          {menuOpen && <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close categories" className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"><X size={24} /></button>}
        </div>
        {menuOpen && (

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ERROR */}
          {!loading && error && (
            <div className="text-center py-12 text-red-600">
              {error}
            </div>
          )}

          {/* CATEGORY GRID */}
          {!loading &&
            !error &&
            categories.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 lg:gap-x-12 gap-y-10">

                {categories.map((category) => {
                  // Subcategories belonging to this category
                  const relatedProducts = products.filter(
                    (product) =>
                      toArray(product.category).some(
                        (item) =>
                          sameReference(item, category)
                      )
                  );

                  const subMap = new Map();
                  const storedForCategory = storedSubCategories.filter(sub => {
                    const parent = sub.category ?? sub.categoryId ?? sub.category_id;
                    return parent && sameReference(parent, category);
                  });
                  [...storedForCategory, ...relatedProducts.flatMap(product =>
                    toArray(product.subCategory ?? product.subcategory ?? product.subcategories)
                  )].forEach(sub => {
                    const id = getId(sub);
                    const name = getName(sub);
                    if (id && name) subMap.set(id, { id, name });
                  });
                  const categorySubCategories = [...subMap.values()]
                    .sort((a, b) => a.name.localeCompare(b.name));

                  return (
                    <div
                      key={category.id}
                      className="group"
                    >

                      {/* CATEGORY HEADING */}
                      <button
                        type="button"
                        onClick={() =>
                          handleCategoryClick(
                            category.id
                          )
                        }
                        className={`
                          block text-left
                          text-lg sm:text-xl lg:text-2xl
                          font-semibold leading-tight mb-3
                          transition-colors duration-200
                          cursor-pointer
                          text-gray-900 hover:text-[#b18152]
                        `}
                      >
                        {category.name}
                      </button>

                      {/* SUBCATEGORIES */}
                      <div className="space-y-1.5">

                        {categorySubCategories.map(
                          (subCategory) => (
                            <button
                              key={subCategory.id}
                              type="button"
                              onClick={() =>
                                handleSubCategoryClick(
                                  category.id,
                                  subCategory.id
                                )
                              }
                              className={`
                                block text-left
                                text-[15px] leading-6
                                transition-colors duration-200
                                cursor-pointer
                                ${
                                  selectedCategory ===
                                    category.id &&
                                  selectedSubCategory ===
                                    subCategory.id
                                    ? "text-[#b18152] font-medium"
                                    : "text-gray-700 hover:text-[#b18152]"
                                }
                              `}
                            >
                              {subCategory.name}
                            </button>
                          )
                        )}

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          {!loading &&
            !error &&
            categories.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No categories available.
              </div>
            )}

        </div>

        )}
      </div>

      {/* ======================================
          SELECTED CATEGORY / SUBCATEGORY
      ====================================== */}

      <div
        ref={productsRef}
        className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-28"
      >

        {/* SECTION HEADING */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {showAllProducts ? "All Products" : (selectedSubCategoryName ||
                selectedCategoryName ||
                "Products")}
            </h1>

            {!showAllProducts && selectedCategoryName && (
              <p className="text-gray-500 mt-2">
                {selectedCategoryName}
              </p>
            )}
          </div>

          {!loading &&
            !error &&
            filteredProducts.length > 0 && (
              <p className="text-sm text-gray-500">
                Showing {startIndex + 1}–{endIndex} of{" "}
                {totalProducts} products
              </p>
            )}

        </div>

        {/* ======================================
            PRODUCTS
        ====================================== */}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div className="bg-white rounded-lg p-10 text-center">
              <p className="text-gray-500 text-lg">
                No Products Available
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          currentProducts.length > 0 && (
            <>

              {/* PRODUCT GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

                {currentProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onQuickView={handleQuickView}
                    onAddToCart={handleAddToCart}
                  />
                ))}

              </div>

              {/* ======================================
                  PAGINATION
              ====================================== */}

              {totalPages > 1 && (
                <div className="mt-12">

                  <nav
                    aria-label="Product pagination"
                    className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2"
                  >

                    {/* PREVIOUS */}
                    <button
                      type="button"
                      onClick={() =>
                        changePage(currentPage - 1)
                      }
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* FIRST PAGE */}
                    {visiblePages[0] > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => changePage(1)}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-md border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          1
                        </button>

                        {visiblePages[0] > 2 && (
                          <span className="px-1 text-gray-500">
                            ...
                          </span>
                        )}
                      </>
                    )}

                    {/* FIVE PAGE NUMBERS */}
                    {visiblePages.map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() =>
                          changePage(page)
                        }
                        aria-current={
                          currentPage === page
                            ? "page"
                            : undefined
                        }
                        className={`
                          w-9 h-9 sm:w-10 sm:h-10
                          rounded-md border text-sm
                          font-medium transition-colors
                          cursor-pointer
                          ${
                            currentPage === page
                              ? "bg-[#2f86d6] text-white border-[#2f86d6]"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          }
                        `}
                      >
                        {page}
                      </button>
                    ))}

                    {/* LAST PAGE */}
                    {visiblePages[
                      visiblePages.length - 1
                    ] < totalPages && (
                      <>
                        {visiblePages[
                          visiblePages.length - 1
                        ] < totalPages - 1 && (
                          <span className="px-1 text-gray-500">
                            ...
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            changePage(totalPages)
                          }
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-md border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    {/* NEXT */}
                    <button
                      type="button"
                      onClick={() =>
                        changePage(currentPage + 1)
                      }
                      disabled={
                        currentPage === totalPages
                      }
                      aria-label="Next page"
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight size={18} />
                    </button>

                  </nav>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    Page {currentPage} of {totalPages}
                  </p>

                </div>
              )}

            </>
          )}

      </div>

      {/* ======================================
          QUICK VIEW MODAL
      ====================================== */}

      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={closeModal}
          onAddToCart={handleAddToCart}
        />
      )}

    </div>
  );
};

export default Categories;
