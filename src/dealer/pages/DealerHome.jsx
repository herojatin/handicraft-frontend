
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Search, X, RefreshCw } from "lucide-react";

import ProductCard from "../components/ProductCard";
import QuickViewModal from "../components/QuickViewModal";
import ProductDetailModal from "../components/ProductDetailModal";
import { useCart } from "../context/CartContext";
import BASE_URL from "../../config/api";

const PAGE_SIZE = 12;
const API_URL = `${String(BASE_URL).replace(/\/+$/, "")}/api/products`;

// Prepare product images
const prepareProductImages = (product) => {
  const images = Array.isArray(product.images)
    ? product.images.flatMap((image) =>
        typeof image === "string" ? image.split(",") : []
      )
    : typeof product.images === "string"
      ? product.images.split(",")
      : [];

  const cleanImages = images.map((image) => image.trim()).filter(Boolean);
  const urls = Array.isArray(product.imageUrls) ? product.imageUrls : [];

  const imageUrls = cleanImages.map((image, index) => {
    const signed = urls[index];

    if (typeof signed === "string" && /^https?:\/\//i.test(signed)) {
      return signed;
    }

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    const clean = image.replace(/^\/+/, "").replace(/\\/g, "/");

    return `${String(BASE_URL).replace(/\/+$/, "")}/${clean
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;
  });

  return { ...product, images: cleanImages, imageUrls };
};

const DealerHome = () => {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");

  const [columns, setColumns] = useState(4);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const loadMoreRef = useRef(null);

  // Fetch products
  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      const isFirstPage = currentPage === 1;

      if (isFirstPage) {
        setLoading(true);
        setError("");
      } else {
        setLoadingMore(true);
        setLoadMoreError("");
      }

      try {
        const params = {
          page: currentPage,
          limit: PAGE_SIZE,
          status: "active",
          search: searchQuery,
        };

        console.log("PRODUCT REQUEST:", params);

        const response = await axios.get(API_URL, {
          params,
          signal: controller.signal,
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (controller.signal.aborted) return;

        const payload = response.data;

        if (payload?.success === false) {
          throw new Error(
            payload.message || "Server rejected the request"
          );
        }

        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.products)
            ? payload.products
            : [];

        const pagination = payload?.pagination || {};

        const formattedProducts = list.map(prepareProductImages);

        // First page replaces products.
        // Subsequent pages append products.
        setProducts((previous) =>
          isFirstPage
            ? formattedProducts
            : [...previous, ...formattedProducts]
        );

        const total = Number(
          pagination.totalProducts ??
          pagination.total ??
          (isFirstPage ? list.length : currentPage * PAGE_SIZE)
        );

        setTotalProducts(total);

        // Determine whether more products are available.
        let moreAvailable;

        if (pagination.totalPages != null) {
          moreAvailable = currentPage < Number(pagination.totalPages);
        } else if (
          pagination.totalProducts != null ||
          pagination.total != null
        ) {
          moreAvailable = currentPage * PAGE_SIZE < total;
        } else {
          moreAvailable = list.length === PAGE_SIZE;
        }

        setHasMore(moreAvailable);

        console.log("PRODUCT RESPONSE:", {
          page: currentPage,
          received: list.length,
          total,
          hasMore: moreAvailable,
        });

      } catch (err) {
        if (
          controller.signal.aborted ||
          err.code === "ERR_CANCELED" ||
          err.name === "CanceledError"
        ) {
          return;
        }

        console.error("PRODUCT FETCH FAILED:", {
          status: err.response?.status,
          message: err.response?.data?.message,
          error: err.message,
        });

        if (isFirstPage) {
          setError(
            err.response?.data?.message ||
            err.message ||
            "Unable to load products"
          );
          setProducts([]);
        } else {
          setLoadMoreError(
            err.response?.data?.message ||
            "Unable to load more products"
          );
        }

      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    loadProducts();

    return () => controller.abort();

  }, [currentPage, searchQuery, reloadKey]);

  // Search products
  const handleSearch = (event) => {
    event.preventDefault();

    const value = searchInput.trim();

    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    setTotalProducts(0);
    setError("");
    setLoadMoreError("");

    if (value === searchQuery && currentPage === 1) {
      setReloadKey((key) => key + 1);
    } else {
      setSearchQuery(value);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchInput("");
    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    setTotalProducts(0);
    setError("");
    setLoadMoreError("");

    if (!searchQuery && currentPage === 1) {
      setReloadKey((key) => key + 1);
    } else {
      setSearchQuery("");
    }
  };

  // Automatically load more products when scrolling
  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasMore || loading || loadingMore || error) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loading &&
          !loadingMore
        ) {
          setCurrentPage((previous) => previous + 1);
        }
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();

  }, [hasMore, loading, loadingMore, error]);

  // Add to cart
  const handleAddToCart = (product) => {
    try {
      addToCart(product);
      setSelectedProduct(null);
      setDetailProduct(null);
    } catch (err) {
      console.error("ADD TO CART ERROR:", err);
      alert("Unable to add product to cart");
    }
  };

  // Retry loading more products
  const retryLoadingMore = () => {
    setLoadMoreError("");
    setReloadKey((key) => key + 1);
  };
  // =====================================================
// FULL PRODUCT DETAIL PAGE
// Replaces the listing without changing the URL
// =====================================================

if (detailProduct) {
  return (
    <ProductDetailModal
      product={detailProduct}
      onClose={() => setDetailProduct(null)}
      onAddToCart={handleAddToCart}
    />
  );
}

  return (
    <div className="min-h-screen bg-[#f8f8f8]">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Ready Stock Products
          </h1>

          <p className="text-gray-500 mt-3 text-sm sm:text-base">
            Browse our currently available products
          </p>
        </header>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mb-7 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
        >
          <div className="relative flex-1">

            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search product code, name, category, description..."
              aria-label="Search products"
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 outline-none focus:border-[#2f86d6] focus:ring-2 focus:ring-blue-100"
            />

          </div>

          <button
            type="submit"
            className="rounded-lg bg-[#2f86d6] px-6 py-3 text-white font-semibold hover:bg-[#246fb5] cursor-pointer"
          >
            Search
          </button>

          {(searchQuery || searchInput) && (
            <button
              type="button"
              onClick={clearSearch}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-center gap-1"
            >
              <X size={16} />
              Clear
            </button>
          )}

        </form>

        {/* Product Count and Columns */}
        {!loading && !error && products.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">

            

            <div className="flex flex-wrap items-center gap-2">

              <span className="text-sm text-gray-500 mr-1">
                View:
              </span>

              {[2, 3, 4, 5].map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setColumns(number)}
                  aria-pressed={columns === number}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                    columns === number
                      ? "bg-[#2f86d6] text-white border-[#2f86d6]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {number} Columns
                </button>
              ))}

            </div>
          </div>
        )}

        {/* Products */}
        <div>

          {/* Initial Loading */}
          {loading && products.length === 0 && (
            <div className="text-center mt-20 py-10 text-xl text-gray-500">
              Loading Products...
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center mt-20 py-10">

              <h2 className="text-xl font-semibold text-red-600">
                Unable to Load Products
              </h2>

              <p className="text-gray-600 mt-2 break-words">
                {error}
              </p>

              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2f86d6] px-5 py-2.5 text-white cursor-pointer"
              >
                <RefreshCw size={17} />
                Retry
              </button>

            </div>
          )}

          {/* No Products */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center mt-20 py-10">

              <h2 className="text-2xl font-semibold text-gray-700">
                No Products Available
              </h2>

              <p className="text-gray-500 mt-2">
                {searchQuery
                  ? `No products found for "${searchQuery}".`
                  : "There are currently no active ready-stock products."}
              </p>

            </div>
          )}

          {/* Product Grid */}
          {products.length > 0 && (

            <div
              className="grid gap-6 lg:gap-8"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onQuickView={setSelectedProduct}
                  onProductDetail={setDetailProduct}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

          )}

          {/* Infinite Scroll Trigger */}
          <div
            ref={loadMoreRef}
            className="w-full py-8"
          >

            {loadingMore && (
              <div className="flex justify-center items-center gap-3 text-gray-500">
                <RefreshCw size={20} className="animate-spin" />
                        Searching...              </div>
            )}

            {loadMoreError && (
              <div className="text-center">

                <p className="text-red-600 mb-3">
                  {loadMoreError}
                </p>

                <button
                  type="button"
                  onClick={retryLoadingMore}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2f86d6] px-5 py-2.5 text-white"
                >
                  <RefreshCw size={17} />
                  Retry
                </button>

              </div>
            )}

            {!hasMore && products.length > 0 && (
              <p className="text-center text-sm text-gray-400">
                You have reached the end of the products.
              </p>
            )}

          </div>

        </div>

      </div>

      {/* Quick View Modal */}
      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      
        
      

    </div>
  );
};

export default DealerHome;
