import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Search, X, RefreshCw } from "lucide-react";
import ProductCard from "../components/ProductCard";
import QuickViewModal from "../components/QuickViewModal";
import ProductDetailModal from "../components/ProductDetailModal";
import { useCart } from "../context/CartContext";
import BASE_URL from "../../config/api";

const PAGE_SIZE = 12;
const VISIBLE_PAGE_COUNT = 5;
const API_URL = `${String(BASE_URL).replace(/\/+$/, "")}/api/products`;

const prepareProductImages = (product) => {
  const images = Array.isArray(product.images)
    ? product.images.flatMap((image) => typeof image === "string" ? image.split(",") : [])
    : typeof product.images === "string" ? product.images.split(",") : [];
  const cleanImages = images.map((image) => image.trim()).filter(Boolean);
  const urls = Array.isArray(product.imageUrls) ? product.imageUrls : [];
  const imageUrls = cleanImages.map((image, index) => {
    const signed = urls[index];
    if (typeof signed === "string" && /^https?:\/\//i.test(signed)) return signed;
    if (/^https?:\/\//i.test(image)) return image;
    const clean = image.replace(/^\/+/, "").replace(/\\/g, "/");
    return `${String(BASE_URL).replace(/\/+$/, "")}/${clean.split("/").map(encodeURIComponent).join("/")}`;
  });
  return { ...product, images: cleanImages, imageUrls };
};

const DealerHome = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [columns, setColumns] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const productsRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = { page: currentPage, limit: PAGE_SIZE, status: "active", search: searchQuery };
        console.log("PRODUCT REQUEST", API_URL, params);
        const response = await axios.get(API_URL, {
          params,
          signal: controller.signal,
          headers: { "Cache-Control": "no-cache" },
        });
        if (controller.signal.aborted) return;
        const payload = response.data;
        if (payload?.success === false) throw new Error(payload.message || "Server rejected the request");
        const list = Array.isArray(payload) ? payload : Array.isArray(payload?.products) ? payload.products : [];
        const pagination = payload?.pagination || {};
        setProducts(list.map(prepareProductImages));
        setTotalProducts(Number(pagination.totalProducts ?? pagination.total ?? list.length));
        setTotalPages(Number(pagination.totalPages ?? Math.ceil(list.length / PAGE_SIZE)));
        console.log("PRODUCT RESPONSE", { count: list.length, pagination });
      } catch (err) {
        if (controller.signal.aborted || err.code === "ERR_CANCELED" || err.name === "CanceledError") return;
        console.error("PRODUCT FETCH FAILED", {
          url: API_URL,
          page: currentPage,
          search: searchQuery,
          status: err.response?.status,
          backendMessage: err.response?.data?.message,
          error: err.message,
        });
        setError(err.response?.data?.message || err.message || "Unable to load products");
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(0);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [currentPage, searchQuery, reloadKey]);

  const handleSearch = (event) => {
    event.preventDefault();
    const value = searchInput.trim();
    setCurrentPage(1);
    setSearchQuery(value);
    if (currentPage === 1 && searchQuery === value) setReloadKey((key) => key + 1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setCurrentPage(1);
    setSearchQuery("");
    if (currentPage === 1 && !searchQuery) setReloadKey((key) => key + 1);
  };

  const changePage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const visiblePages = useMemo(() => {
    if (!totalPages) return [];
    const start = Math.min(Math.max(1, currentPage - 2), Math.max(1, totalPages - VISIBLE_PAGE_COUNT + 1));
    return Array.from({ length: Math.min(VISIBLE_PAGE_COUNT, totalPages) }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  const handleAddToCart = (product) => {
    try {
      addToCart(product);
      setSelectedProduct(null);
      setDetailProduct(null);
    } catch (err) {
      console.error("ADD TO CART ERROR", err);
      alert("Unable to add product to cart");
    }
  };

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + products.length, totalProducts);

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Ready Stock Products</h1>
          <p className="text-gray-500 mt-3 text-sm sm:text-base">Browse our currently available products</p>
        </header>

        <form onSubmit={handleSearch} className="mb-7 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search size={19} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search product code, name, category, description..."
              aria-label="Search products"
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 outline-none focus:border-[#2f86d6] focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button type="submit" className="rounded-lg bg-[#2f86d6] px-6 py-3 text-white font-semibold hover:bg-[#246fb5] cursor-pointer">Search</button>
          {(searchQuery || searchInput) && (
            <button type="button" onClick={clearSearch} className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-center gap-1">
              <X size={16} /> Clear
            </button>
          )}
        </form>

        {!loading && !error && totalProducts > 0 && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <p className="text-sm text-gray-500">
              Showing <strong className="text-gray-700">{startIndex + 1}–{endIndex}</strong> of <strong className="text-gray-700">{totalProducts}</strong> products
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500 mr-1">View:</span>
              {[2, 3, 4, 5].map((number) => (
                <button key={number} type="button" onClick={() => setColumns(number)} aria-pressed={columns === number}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${columns === number ? "bg-[#2f86d6] text-white border-[#2f86d6]" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}>
                  {number} Columns
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={productsRef} className="scroll-mt-28">
          {loading && <div className="text-center mt-20 py-10 text-xl text-gray-500">Loading Products...</div>}
          {!loading && error && (
            <div className="text-center mt-20 py-10">
              <h2 className="text-xl font-semibold text-red-600">Unable to Load Products</h2>
              <p className="text-gray-600 mt-2 break-words">{error}</p>
              <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2f86d6] px-5 py-2.5 text-white cursor-pointer">
                <RefreshCw size={17} /> Retry
              </button>
            </div>
          )}
          {!loading && !error && products.length === 0 && (
            <div className="text-center mt-20 py-10">
              <h2 className="text-2xl font-semibold text-gray-700">No Products Available</h2>
              <p className="text-gray-500 mt-2">{searchQuery ? `No products found for "${searchQuery}".` : "There are currently no active ready-stock products."}</p>
            </div>
          )}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="grid gap-6 lg:gap-8" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
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
              {totalPages > 1 && (
                <div className="mt-12">
                  <nav aria-label="Product pagination" className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2">
                    <button type="button" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page" className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><ChevronLeft size={18} /></button>
                    {visiblePages[0] > 1 && (
                      <>
                        <button type="button" onClick={() => changePage(1)} className="w-10 h-10 rounded-md border bg-white cursor-pointer">1</button>
                        {visiblePages[0] > 2 && <span className="px-1">...</span>}
                      </>
                    )}
                    {visiblePages.map((page) => (
                      <button key={page} type="button" onClick={() => changePage(page)} aria-current={currentPage === page ? "page" : undefined}
                        className={`w-10 h-10 rounded-md border text-sm font-medium cursor-pointer ${currentPage === page ? "bg-[#2f86d6] text-white border-[#2f86d6]" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"}`}>
                        {page}
                      </button>
                    ))}
                    {visiblePages[visiblePages.length - 1] < totalPages && (
                      <>
                        {visiblePages[visiblePages.length - 1] < totalPages - 1 && <span className="px-1">...</span>}
                        <button type="button" onClick={() => changePage(totalPages)} className="w-10 h-10 rounded-md border bg-white cursor-pointer">{totalPages}</button>
                      </>
                    )}
                    <button type="button" onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page" className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><ChevronRight size={18} /></button>
                  </nav>
                  <p className="text-center text-sm text-gray-500 mt-4">Page {currentPage} of {totalPages}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {selectedProduct && <QuickViewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />}
      {detailProduct && <ProductDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} onAddToCart={handleAddToCart} />}
    </div>
  );
};

export default DealerHome;
