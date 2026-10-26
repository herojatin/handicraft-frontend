import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import axios from "axios";

import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
} from "lucide-react";

import Footer from "../components/Footer";
import { BASE_URL } from "../config/api";

// =====================================================
// CONFIGURATION
// =====================================================

const PRODUCTS_PER_PAGE = 12;
const CATEGORIES_PER_PAGE = 12;
const MAX_VISIBLE_PAGES = 5;

const API_BASE = BASE_URL.replace(/\/$/, "");

// =====================================================
// HELPERS
// =====================================================

const normalizeText = (value) =>
  String(value ?? "").trim().toLowerCase();

const toArray = (value) => {
  if (Array.isArray(value)) return value;

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return [];
  }

  return [value];
};

const getCategoryName = (category) => {
  if (!category) return "";

  if (
    typeof category === "string" ||
    typeof category === "number"
  ) {
    return String(category).trim();
  }

  return String(
    category.title ??
      category.name ??
      category.categoryName ??
      category.category ??
      ""
  ).trim();
};

const isInactive = (status) => {
  if (status === undefined || status === null) {
    return false;
  }

  return (
    status === false ||
    status === 0 ||
    status === "0" ||
    ["inactive", "deactive", "disabled"].includes(
      normalizeText(status)
    )
  );
};

const getCategoryIdentifiers = (category) => {
  if (!category) return [];

  if (
    typeof category === "string" ||
    typeof category === "number"
  ) {
    return [normalizeText(category)];
  }

  return [
    category._id,
    category.id,
    category.serial_id,
    category.serialId,
    category.title,
    category.name,
    category.categoryName,
    category.category,
  ]
    .filter(
      (value) =>
        value !== undefined &&
        value !== null &&
        typeof value !== "object" &&
        String(value).trim() !== ""
    )
    .map(normalizeText);
};

const categoriesMatch = (left, right) => {
  const leftIdentifiers = getCategoryIdentifiers(left);
  const rightIdentifiers = getCategoryIdentifiers(right);

  return leftIdentifiers.some((identifier) =>
    rightIdentifiers.includes(identifier)
  );
};

// =====================================================
// IMAGE HELPERS
// =====================================================

const getImageUrl = (image) => {
  if (!image) return "";

  const path =
    typeof image === "string"
      ? image
      : image.url ??
        image.imageUrl ??
        image.path ??
        image.src ??
        image.filename ??
        "";

  if (!path || typeof path !== "string") {
    return "";
  }

  // S3 signed URLs and public URLs
  if (/^(https?:\/\/|data:|blob:)/i.test(path)) {
    return path;
  }

  const cleanPath = path
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  // An S3 object key is not a directly accessible URL.
  if (/^products\//i.test(cleanPath)) {
    return "";
  }

  return `${API_BASE}/${cleanPath}`;
};

const getProductImage = (product) => {
  if (!product) return "";

  // Priority 1: S3 signed image URLs
  const signedImages = toArray(product.imageUrls);

  for (const image of signedImages) {
    const url = getImageUrl(image);
    if (url) return url;
  }

  // Priority 2: Single signed/public image URL
  if (product.imageUrl) {
    const url = getImageUrl(product.imageUrl);
    if (url) return url;
  }

  // Priority 3: Existing image field
  const images = toArray(
    product.images ?? product.image
  );

  for (const image of images) {
    const url = getImageUrl(image);
    if (url) return url;
  }

  return "";
};

const getCategoryImage = (category) => {
  if (!category) return "";

  const signedImages = toArray(category.imageUrls);

  for (const image of signedImages) {
    const url = getImageUrl(image);
    if (url) return url;
  }

  if (category.imageUrl) {
    const url = getImageUrl(category.imageUrl);
    if (url) return url;
  }

  const images = toArray(
    category.images ?? category.image
  );

  for (const image of images) {
    const url = getImageUrl(image);
    if (url) return url;
  }

  return "";
};

// =====================================================
// IMAGE COMPONENT
// =====================================================

function PreviewImage({
  sources = [],
  alt,
  className = "",
}) {
  const validSources = useMemo(
    () => sources.filter(Boolean),
    [sources]
  );

  const [sourceIndex, setSourceIndex] = useState(0);

  const sourcesKey = validSources.join("|");

  useEffect(() => {
    setSourceIndex(0);
  }, [sourcesKey]);

  const currentSource = validSources[sourceIndex];

  if (!currentSource) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#f1ede8]">
        <span className="text-sm text-gray-400">
          No image available
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSource}
      alt={alt}
      loading="lazy"
      onError={() => {
        setSourceIndex((previous) => previous + 1);
      }}
      className={className}
    />
  );
}

// =====================================================
// PAGINATION COMPONENT
// =====================================================

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  const visiblePages = useMemo(() => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    let startPage = Math.max(
      1,
      currentPage -
        Math.floor(MAX_VISIBLE_PAGES / 2)
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

  if (totalPages <= 1) return null;

  const pageButtonClass = (page) =>
    `min-w-9 h-9 sm:min-w-10 sm:h-10 px-2
     rounded-md border text-sm font-medium
     transition-colors cursor-pointer ${
       currentPage === page
         ? "bg-[#2b2b2b] text-white border-[#2b2b2b]"
         : "bg-white text-[#2b2b2b] border-gray-300 hover:bg-gray-100"
     }`;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 mt-12"
    >
      {/* PREVIOUS */}

      <button
        type="button"
        onClick={() =>
          onPageChange(currentPage - 1)
        }
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-md border border-gray-300 bg-white text-[#2b2b2b] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronLeft size={18} />
      </button>

      {/* FIRST PAGE */}

      {visiblePages[0] > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className={pageButtonClass(1)}
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

      {/* PAGE NUMBERS */}

      {visiblePages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-current={
            currentPage === page ? "page" : undefined
          }
          className={pageButtonClass(page)}
        >
          {page}
        </button>
      ))}

      {/* LAST PAGE */}

      {visiblePages[visiblePages.length - 1] <
        totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] <
            totalPages - 1 && (
            <span className="px-1 text-gray-500">
              ...
            </span>
          )}

          <button
            type="button"
            onClick={() =>
              onPageChange(totalPages)
            }
            className={pageButtonClass(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* NEXT */}

      <button
        type="button"
        onClick={() =>
          onPageChange(currentPage + 1)
        }
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-md border border-gray-300 bg-white text-[#2b2b2b] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}

// =====================================================
// CATEGORY CARD
// =====================================================

function CategoryCard({
  category,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left bg-white border border-[#e7e2dc] rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      {/* ONE CATEGORY IMAGE */}

      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#f1ede8]">
        <PreviewImage
          sources={category.previewImages}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* CATEGORY NAME ONLY */}

      <div className="px-4 py-5 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base sm:text-lg font-semibold text-[#2b2b2b] group-hover:text-[#5a3e2b] transition-colors">
            {category.name}
          </h3>

          <ArrowRight
            size={19}
            className="shrink-0 text-gray-400 group-hover:text-[#2b2b2b] group-hover:translate-x-1 transition-all"
          />
        </div>
      </div>
    </button>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function ProductTour() {
  // ===================================================
  // STATES
  // ===================================================

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState(null);

  const [categoryPage, setCategoryPage] = useState(1);
  const [productPage, setProductPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImageIndex, setSelectedImageIndex] =
    useState(null);

  // ===================================================
  // REFS
  // ===================================================

  const contentRef = useRef(null);
  const closeButtonRef = useRef(null);

  // ===================================================
  // FETCH PRODUCTS AND CATEGORIES
  // ===================================================

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [productResult, categoryResult] =
          await Promise.allSettled([
            axios.get(`${API_BASE}/api/products`, {
              signal: controller.signal,
            }),

            axios.get(`${API_BASE}/api/categories`, {
              signal: controller.signal,
            }),
          ]);

        if (controller.signal.aborted) return;

        // PRODUCTS

        if (productResult.status === "fulfilled") {
          const response = productResult.value.data;

          const productList = Array.isArray(response)
            ? response
            : Array.isArray(response?.products)
              ? response.products
              : Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response?.data?.products)
                  ? response.data.products
                  : [];

          setProducts(productList);
        } else {
          console.error(
            "PRODUCT API ERROR:",
            productResult.reason
          );

          setProducts([]);
        }

        // CATEGORIES

        if (categoryResult.status === "fulfilled") {
          const response = categoryResult.value.data;

          const categoryList = Array.isArray(response)
            ? response
            : Array.isArray(response?.categories)
              ? response.categories
              : Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response?.data?.categories)
                  ? response.data.categories
                  : [];

          setCategories(categoryList);
        } else {
          console.error(
            "CATEGORY API ERROR:",
            categoryResult.reason
          );

          setCategories([]);
        }

        if (
          productResult.status === "rejected" &&
          categoryResult.status === "rejected"
        ) {
          setError(
            "Unable to load the collection. Please try again."
          );
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error(
          "PRODUCT TOUR FETCH ERROR:",
          err
        );

        setError(
          "Unable to load the collection. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, []);

  // ===================================================
  // PREPARE PRODUCTS WITH IMAGES
  // ===================================================

  const productsWithImages = useMemo(() => {
    return products.map((product) => ({
      ...product,
      galleryImage: getProductImage(product),
    }));
  }, [products]);

  // ===================================================
  // BUILD CATEGORY OPTIONS
  // ===================================================

  const categoryOptions = useMemo(() => {
    const categoryMap = new Map();

    const activeCategories = categories.filter(
      (category) => !isInactive(category.status)
    );

    const inactiveCategories = categories.filter(
      (category) => isInactive(category.status)
    );

    // -----------------------------------------------
    // ADD ALL ACTIVE CATEGORIES
    // -----------------------------------------------

    activeCategories.forEach((category) => {
      const name = getCategoryName(category);

      if (!name) return;

      const key = normalizeText(name);

      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          id: key,
          name,
          originalCategory: category,
          previewImages: [],
        });
      }

      // Category image as a possible fallback
      const categoryImage = getCategoryImage(category);

      if (categoryImage) {
        const option = categoryMap.get(key);

        if (!option.previewImages.includes(categoryImage)) {
          option.previewImages.push(categoryImage);
        }
      }
    });

    // -----------------------------------------------
    // MATCH PRODUCT IMAGES WITH CATEGORIES
    // -----------------------------------------------

    productsWithImages.forEach((product) => {
      const productCategories = toArray(
        product.category
      );

      productCategories.forEach((productCategory) => {
        if (!productCategory) return;

        const inactiveMatch = inactiveCategories.some(
          (category) =>
            categoriesMatch(category, productCategory)
        );

        if (inactiveMatch) return;

        const matchedCategory = activeCategories.find(
          (category) =>
            categoriesMatch(category, productCategory)
        );

        const categoryName = matchedCategory
          ? getCategoryName(matchedCategory)
          : getCategoryName(productCategory);

        if (!categoryName) return;

        const key = normalizeText(categoryName);

        if (!categoryMap.has(key)) {
          categoryMap.set(key, {
            id: key,
            name: categoryName,
            originalCategory:
              matchedCategory ?? productCategory,
            previewImages: [],
          });
        }

        const option = categoryMap.get(key);

        // Product image is preferred.
        if (
          product.galleryImage &&
          !option.previewImages.includes(
            product.galleryImage
          )
        ) {
          option.previewImages.unshift(
            product.galleryImage
          );
        }
      });
    });

    // -----------------------------------------------
    // SORT CATEGORIES
    // -----------------------------------------------


return Array.from(categoryMap.values())
      .map((category) => ({
        ...category,
        // Keep all candidates for fallback, but show only one at a time.
        previewImages: [...new Set(category.previewImages.filter(Boolean))],
      }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
        numeric: true,
      }));

  }, [categories, productsWithImages]);

  // Check category image candidates before pagination. A nonempty URL
  // does not mean that the image is accessible (especially signed S3 URLs).
  // Keep the existing preview candidates as fallbacks rather than hiding them.
  const [categoryImageResults, setCategoryImageResults] = useState({});
  const [checkingCategoryImages, setCheckingCategoryImages] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setCheckingCategoryImages(true);
    setCategoryImageResults({});

    const checkUrl = (url) => new Promise((resolve) => {
      const img = new Image();
      const timer = setTimeout(() => finish(false), 8000);
      let done = false;
      function finish(ok) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        img.onload = null;
        img.onerror = null;
        resolve(ok);
      }
      img.onload = () => finish(true);
      img.onerror = () => finish(false);
      img.src = url;
    });

    (async () => {
      const results = {};
      let cursor = 0;
      const workers = Array.from({ length: Math.min(8, categoryOptions.length) }, async () => {
        while (cursor < categoryOptions.length && !cancelled) {
          const category = categoryOptions[cursor++];
          let workingUrl = "";
          for (const url of category.previewImages) {
            if (await checkUrl(url)) {
              workingUrl = url;
              break;
            }
          }
          results[category.id] = workingUrl;
        }
      });
      await Promise.all(workers);
      if (!cancelled) {
        setCategoryImageResults(results);
        setCheckingCategoryImages(false);
      }
    })();

    return () => { cancelled = true; };
  }, [categoryOptions]);

  const sortedCategoryOptions = useMemo(() => {
    return categoryOptions
      .map((category) => ({
        ...category,
        // Verified image first; otherwise retain original URLs as fallback.
        previewImages: categoryImageResults[category.id]
          ? [categoryImageResults[category.id]]
          : category.previewImages,
        hasWorkingImage: Boolean(categoryImageResults[category.id]),
      }))
      .sort((a, b) => {
        if (a.hasWorkingImage !== b.hasWorkingImage) {
          return a.hasWorkingImage ? -1 : 1;
        }
        return a.name.localeCompare(b.name, undefined, {
          sensitivity: "base", numeric: true,
        });
      });
  }, [categoryOptions, categoryImageResults]);

  // ===================================================
  // ACTIVE CATEGORY
  // ===================================================

  const activeCategory = useMemo(() => {
    return (
      categoryOptions.find(
        (category) =>
          category.id === selectedCategory
      ) ?? null
    );
  }, [categoryOptions, selectedCategory]);

  // ===================================================
  // FILTER PRODUCTS
  // ===================================================

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return [];

    return productsWithImages.filter((product) => {
      const productCategories = toArray(
        product.category
      );

      return productCategories.some(
        (productCategory) =>
          categoriesMatch(
            activeCategory.originalCategory,
            productCategory
          )
      );
    });
  }, [productsWithImages, activeCategory]);

  // ===================================================
  // CATEGORY PAGINATION
  // ===================================================

  const totalCategoryPages = Math.ceil(
    sortedCategoryOptions.length / CATEGORIES_PER_PAGE
  );

  const safeCategoryPage = Math.min(
    Math.max(categoryPage, 1),
    Math.max(totalCategoryPages, 1)
  );

  const categoryStartIndex =
    (safeCategoryPage - 1) * CATEGORIES_PER_PAGE;

  const visibleCategories = sortedCategoryOptions.slice(
    categoryStartIndex,
    categoryStartIndex + CATEGORIES_PER_PAGE
  );

  // ===================================================
  // PRODUCT PAGINATION
  // ===================================================

  const totalProductPages = Math.ceil(
    filteredProducts.length / PRODUCTS_PER_PAGE
  );

  const safeProductPage = Math.min(
    Math.max(productPage, 1),
    Math.max(totalProductPages, 1)
  );

  const productStartIndex =
    (safeProductPage - 1) * PRODUCTS_PER_PAGE;

  const productEndIndex = Math.min(
    productStartIndex + PRODUCTS_PER_PAGE,
    filteredProducts.length
  );

  const visibleProducts = filteredProducts.slice(
    productStartIndex,
    productEndIndex
  );

  // ===================================================
  // SCROLL TO CONTENT
  // ===================================================

  const scrollToContent = () => {
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  // ===================================================
  // CATEGORY NAVIGATION
  // ===================================================

  const openCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setProductPage(1);
    setSelectedImageIndex(null);

    scrollToContent();
  };

  const backToCategories = () => {
    setSelectedCategory(null);
    setProductPage(1);
    setSelectedImageIndex(null);

    scrollToContent();
  };

  // ===================================================
  // CATEGORY PAGE CHANGE
  // ===================================================

  const changeCategoryPage = (page) => {
    if (
      page < 1 ||
      page > totalCategoryPages ||
      page === safeCategoryPage
    ) {
      return;
    }

    setCategoryPage(page);
    scrollToContent();
  };

  // ===================================================
  // PRODUCT PAGE CHANGE
  // ===================================================

  const changeProductPage = (page) => {
    if (
      page < 1 ||
      page > totalProductPages ||
      page === safeProductPage
    ) {
      return;
    }

    setProductPage(page);
    scrollToContent();
  };

  // ===================================================
  // FULLSCREEN IMAGE VIEWER
  // ===================================================

  const galleryProducts = useMemo(() => {
    return filteredProducts.filter(
      (product) => product.galleryImage
    );
  }, [filteredProducts]);

  const openImage = (product) => {
    const index = galleryProducts.findIndex(
      (item) => item === product
    );

    if (index !== -1) {
      setSelectedImageIndex(index);
    }
  };

  const closeImage = () => {
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction) => {
    setSelectedImageIndex((previousIndex) => {
      if (
        previousIndex === null ||
        galleryProducts.length === 0
      ) {
        return previousIndex;
      }

      return (
        previousIndex +
        direction +
        galleryProducts.length
      ) % galleryProducts.length;
    });
  };

  const selectedImage =
    selectedImageIndex !== null
      ? galleryProducts[selectedImageIndex]
      : null;

  // ===================================================
  // KEYBOARD SUPPORT AND SCROLL LOCK
  // ===================================================

  useEffect(() => {
    if (selectedImageIndex === null) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedImageIndex(null);
      }

      if (event.key === "ArrowRight") {
        navigateImage(1);
      }

      if (event.key === "ArrowLeft") {
        navigateImage(-1);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selectedImageIndex !== null,
    galleryProducts.length,
  ]);

  // ===================================================
  // JSX
  // ===================================================

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2]">
      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="flex-1 w-full pt-36 sm:pt-40 pb-14">
        {/* PAGE HEADING */}

        <section className="text-center px-5 mb-10">
          <p className="text-xs sm:text-sm tracking-[0.35em] text-[#a67c52]">
            OUR COLLECTION
          </p>

          <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[0.15em] sm:tracking-[0.2em] text-[#5a3e2b]">
            PRODUCT TOUR
          </h1>

          <div className="w-16 h-[2px] bg-[#a67c52] mx-auto mt-6" />
        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        <section
          ref={contentRef}
          className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 scroll-mt-28"
        >
          {/* LOADING */}

          {(loading || (!selectedCategory && checkingCategoryImages)) && (
            <div className="text-center py-20 text-[#5a3e2b]">
              Loading collection images...
            </div>
          )}

          {/* ERROR */}

          {!loading && !checkingCategoryImages && error && (
            <div className="text-center py-20 text-red-600">
              {error}
            </div>
          )}

          {/* =================================================
              CATEGORY GALLERY
          ================================================= */}

          {!loading &&
            !error &&
            selectedCategory === null && (
              <>
                {/* CATEGORY INTRO */}

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-[#2b2b2b]">
                      Explore Our Collections
                    </h2>

                    <p className="text-sm text-gray-500 mt-2">
                      Select a category to discover
                      our handcrafted products.
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-500">
                    {categoryOptions.length} Collections
                  </p>
                </div>

                {/* EMPTY CATEGORY LIST */}

                {categoryOptions.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    No collections available.
                  </div>
                ) : (
                  <>
                    {/* CATEGORY GRID */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-7">
                      {visibleCategories.map(
                        (category) => (
                          <CategoryCard
                            key={category.id}
                            category={category}
                            onClick={() =>
                              openCategory(category.id)
                            }
                          />
                        )
                      )}
                    </div>

                    {/* CATEGORY PAGINATION */}

                    <Pagination
                      currentPage={safeCategoryPage}
                      totalPages={totalCategoryPages}
                      onPageChange={changeCategoryPage}
                    />
                  </>
                )}
              </>
            )}

          {/* =================================================
              PRODUCTS INSIDE SELECTED CATEGORY
          ================================================= */}

          {!loading &&
            !error &&
            selectedCategory !== null && (
              <>
                {/* BACK BUTTON */}

                <button
                  type="button"
                  onClick={backToCategories}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#2b2b2b] hover:text-[#5a3e2b] transition-colors mb-8 cursor-pointer"
                >
                  <ArrowLeft size={18} />
                  Back to Collections
                </button>

                {/* CATEGORY HEADING */}

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                  <div>
                    <p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">
                      Our Collection
                    </p>

                    <h2 className="text-2xl sm:text-3xl font-semibold text-[#2b2b2b]">
                      {activeCategory?.name || "Products"}
                    </h2>
                  </div>
                </div>

                {/* EMPTY PRODUCT LIST */}

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    No products available in this collection.
                  </div>
                ) : (
                  <>
                    {/* PRODUCT IMAGE GRID */}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                      {visibleProducts.map(
                        (product, index) => (
                          <button
                            key={
                              product._id ??
                              product.productId ??
                              `${product.productCode}-${index}`
                            }
                            type="button"
                            onClick={() =>
                              openImage(product)
                            }
                            disabled={
                              !product.galleryImage
                            }
                            aria-label={`View ${
                              product.productCode ??
                              "product"
                            } image`}
                            className="group relative aspect-square overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-lg transition-all duration-300 cursor-zoom-in disabled:cursor-default"
                          >
                            <PreviewImage
                              sources={[
                                product.galleryImage,
                              ]}
                              alt={
                                product.name ||
                                product.productCode ||
                                "Handcrafted product"
                              }
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />

                            {product.galleryImage && (
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <ZoomIn
                                  size={28}
                                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                              </div>
                            )}
                          </button>
                        )
                      )}
                    </div>

                    {/* PRODUCT PAGINATION */}

                    <Pagination
                      currentPage={safeProductPage}
                      totalPages={totalProductPages}
                      onPageChange={changeProductPage}
                    />
                  </>
                )}
              </>
            )}
        </section>
      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <Footer />

      {/* =================================================
          FULLSCREEN IMAGE PREVIEW
      ================================================= */}

      {selectedImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Product image preview"
          onClick={closeImage}
        >
          {/* CLOSE BUTTON */}

          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeImage}
            aria-label="Close image"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors cursor-pointer"
          >
            <X size={25} />
          </button>

          {/* PREVIOUS IMAGE */}

          {galleryProducts.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                navigateImage(-1);
              }}
              aria-label="Previous image"
              className="absolute left-3 sm:left-8 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors cursor-pointer"
            >
              <ChevronLeft size={26} />
            </button>
          )}

          {/* FULL IMAGE */}

          <img
            src={selectedImage.galleryImage}
            alt={
              selectedImage.name ||
              selectedImage.productCode ||
              "Full-size product"
            }
            onClick={(event) =>
              event.stopPropagation()
            }
            className="max-w-full max-h-[85vh] object-contain rounded-sm select-none"
          />

          {/* NEXT IMAGE */}

          {galleryProducts.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                navigateImage(1);
              }}
              aria-label="Next image"
              className="absolute right-3 sm:right-8 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors cursor-pointer"
            >
              <ChevronRight size={26} />
            </button>
          )}

          {/* IMAGE COUNTER */}

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-xs tracking-widest">
            {selectedImageIndex + 1} /{" "}
            {galleryProducts.length}
          </div>
        </div>
      )}
    </div>
  );
}