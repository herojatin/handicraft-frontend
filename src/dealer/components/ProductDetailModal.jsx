
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ShoppingCart,
  Package,
  Ruler,
  Info,
} from "lucide-react";

import BASE_URL from "../../config/api";

const DEFAULT_IMAGE = "/default-product.png";

const ProductDetailModal = ({ product, onClose, onAddToCart }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState([]);
  const [hovered, setHovered] = useState(false);

  const [zoomPosition, setZoomPosition] = useState({
    x: 50,
    y: 50,
  });

  // Hide dealer navbar while product details are open.
  useEffect(() => {
    document.body.classList.add("product-detail-active");

    return () => {
      document.body.classList.remove("product-detail-active");
    };
  }, []);

  // =====================================================
  // IMAGE NORMALIZATION
  // =====================================================

  const images = useMemo(() => {
    const toArray = (value) => {
      if (Array.isArray(value)) {
        return value.flatMap(toArray);
      }

      if (typeof value !== "string") {
        return [];
      }

      const raw = value.trim();

      if (!raw) return [];

      if (raw.startsWith("[")) {
        try {
          const parsed = JSON.parse(raw);

          if (Array.isArray(parsed)) {
            return toArray(parsed);
          }
        } catch {
          // Support legacy comma-separated paths.
        }
      }

      return /^https?:\/\//i.test(raw)
        ? [raw]
        : raw
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);
    };

    const stored = toArray(product?.images);
    const signed = toArray(product?.imageUrls);

    const fallback = toArray(
      product?.imageUrl || product?.image
    );

    const paths = stored.length
      ? stored
      : signed.length
        ? signed
        : fallback;

    const resolve = (value) => {
      if (!value) return null;

      if (/^(https?:\/\/|data:|blob:)/i.test(value)) {
        return value;
      }

      if (
        value.startsWith("/") &&
        !value.startsWith("/uploads/")
      ) {
        return value;
      }

      const clean = value
        .replace(/^\/+/, "")
        .replace(/\\/g, "/");

      const encoded = clean
        .split("/")
        .map(encodeURIComponent)
        .join("/");

      const base = BASE_URL.replace(/\/+$/, "");

      return clean.startsWith("uploads/")
        ? `${base}/${encoded}`
        : `${base}/uploads/${encoded}`;
    };

    const resolved = paths.map(
      (entry, index) =>
        resolve(signed[index]) ||
        resolve(entry) ||
        DEFAULT_IMAGE
    );

    return resolved.length ? resolved : [DEFAULT_IMAGE];
  }, [
    product?.images,
    product?.imageUrls,
    product?.imageUrl,
    product?.image,
  ]);

  // =====================================================
  // IMAGE DISPLAY
  // =====================================================

  const safeIndex = images.length
    ? currentImageIndex % images.length
    : 0;

  const selectedImage = images[safeIndex];

  const currentImage =
    selectedImage && !failedImages.includes(selectedImage)
      ? selectedImage
      : DEFAULT_IMAGE;

  const showImageArrows = images.length > 1;

  useEffect(() => {
    setCurrentImageIndex(0);
    setFailedImages([]);
    setHovered(false);
  }, [product?._id, product?.productCode]);

  // =====================================================
  // NEXT IMAGE
  // =====================================================

  const handleNextImage = (event) => {
    event?.stopPropagation();

    if (images.length <= 1) return;

    setHovered(false);

    setCurrentImageIndex(
      (previous) => (previous + 1) % images.length
    );
  };

  // =====================================================
  // PREVIOUS IMAGE
  // =====================================================

  const handlePreviousImage = (event) => {
    event?.stopPropagation();

    if (images.length <= 1) return;

    setHovered(false);

    setCurrentImageIndex(
      (previous) =>
        (previous - 1 + images.length) % images.length
    );
  };

  // =====================================================
  // IMAGE ERROR
  // =====================================================

  const handleImageError = (event) => {
    const broken =
      event.currentTarget.currentSrc ||
      event.currentTarget.src;

    if (broken.endsWith(DEFAULT_IMAGE)) return;

    console.warn("Product image failed:", broken);

    setFailedImages((previous) =>
      previous.includes(broken)
        ? previous
        : [...previous, broken]
    );
  };

  // =====================================================
  // PRODUCT VALIDATION
  // =====================================================

  if (!product) {
    return null;
  }

  // =====================================================
  // PRODUCT SIZES
  // =====================================================

  const productSizes =
    Array.isArray(product.sizes) &&
    product.sizes.length > 0
      ? product.sizes
      : product.length != null ||
          product.width != null ||
          product.height != null
        ? [
            {
              length: product.length,
              width: product.width,
              height: product.height,
            },
          ]
        : [];

  // =====================================================
  // DISPLAY VALUE
  // =====================================================

  const displayValue = (value) =>
    value !== undefined &&
    value !== null &&
    value !== ""
      ? value
      : "-";

  // =====================================================
  // CM TO INCH
  // =====================================================

  const convertToInch = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "-";
    }

    const number = Number(value);

    return Number.isFinite(number)
      ? (number / 2.54).toFixed(2)
      : "-";
  };

  // =====================================================
  // CALCULATE CBM
  // =====================================================

  const calculateCBM = (length, width, height) => {
    if (
      length === undefined ||
      length === null ||
      length === "" ||
      width === undefined ||
      width === null ||
      width === "" ||
      height === undefined ||
      height === null ||
      height === ""
    ) {
      return "-";
    }

    const l = Number(length);
    const w = Number(width);
    const h = Number(height);

    if (
      !Number.isFinite(l) ||
      !Number.isFinite(w) ||
      !Number.isFinite(h) ||
      l <= 0 ||
      w <= 0 ||
      h <= 0
    ) {
      return "-";
    }

    return ((l * w * h) / 1000000).toFixed(4);
  };

  // =====================================================
  // PRODUCT INFORMATION
  // =====================================================

  const productCode =
    product.productCode ||
    product.code ||
    "-";

  const productDescription =
    product.description?.trim() ||
    productCode;

  const isAvailable =
    product.status === 1 ||
    product.status === "1" ||
    product.status === "Active";

  // =====================================================
  // JSX
  // =====================================================

  return (
    <main className="min-h-screen w-full bg-[#faf7f2]">

      {/* STICKY PAGE HEADER */}

      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-[#8b603b]"
          >
            <ArrowLeft size={19} />
            Back to Products
          </button>

          <span className="hidden text-sm text-gray-500 sm:block">
            Haswani Handicrafts
          </span>
        </div>
      </div>

      {/* BREADCRUMB */}

      <div className="mx-auto max-w-[1600px] px-4 pt-5 sm:px-6 lg:px-10">
        <p className="text-sm text-gray-500">
          Products
          <span className="mx-2">/</span>
          {displayValue(product.category)}
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-800">
            {productCode}
          </span>
        </p>
      </div>

      {/* MAIN PRODUCT SECTION */}

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_300px]">

          {/* LEFT: PRODUCT GALLERY */}

          <section className="min-w-0">
            <div className="flex flex-col gap-4 sm:flex-row">

              {/* THUMBNAILS */}

              {images.length > 1 && (
                <div className="order-2 flex gap-3 overflow-x-auto pb-2 sm:order-1 sm:w-[85px] sm:flex-col sm:overflow-y-auto sm:overflow-x-hidden sm:pb-0">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setCurrentImageIndex(index);
                        setHovered(false);
                      }}
                      className={`h-[76px] w-[76px] flex-shrink-0 overflow-hidden rounded-lg border-2 bg-white transition ${
                        safeIndex === index
                          ? "border-[#8b603b]"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = DEFAULT_IMAGE;
                        }}
                        className="h-full w-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* MAIN IMAGE */}

              <div className="order-1 min-w-0 flex-1 sm:order-2">
                <div className="relative h-[420px] overflow-hidden rounded-xl border border-gray-200 bg-white sm:h-[540px] xl:h-[600px]">
                  <img
                    key={safeIndex}
                    src={currentImage}
                    alt={productDescription}
                    onError={handleImageError}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    onMouseMove={(event) => {
                      const rect =
                        event.currentTarget.getBoundingClientRect();

                      setZoomPosition({
                        x:
                          ((event.clientX - rect.left) /
                            rect.width) *
                          100,
                        y:
                          ((event.clientY - rect.top) /
                            rect.height) *
                          100,
                      });
                    }}
                    style={{
                      transform: hovered
                        ? "scale(2.2)"
                        : "scale(1)",
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }}
                    className="h-full w-full cursor-zoom-in object-contain p-5 transition-transform duration-150"
                  />

                  {/* PREVIOUS IMAGE */}

                  {showImageArrows && (
                    <button
                      type="button"
                      onClick={handlePreviousImage}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border bg-white/95 shadow-md transition hover:bg-white"
                    >
                      <ChevronLeft size={24} />
                    </button>
                  )}

                  {/* NEXT IMAGE */}

                  {showImageArrows && (
                    <button
                      type="button"
                      onClick={handleNextImage}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border bg-white/95 shadow-md transition hover:bg-white"
                    >
                      <ChevronRight size={24} />
                    </button>
                  )}

                  {/* IMAGE COUNT */}

                  {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white">
                      {safeIndex + 1} / {images.length}
                    </div>
                  )}
                </div>

                <p className="mt-3 text-center text-xs text-gray-500">
                  Move your cursor over the image to zoom in
                </p>
              </div>
            </div>
          </section>

          {/* MIDDLE: PRODUCT INFORMATION */}

          <section className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8b603b]">
              Haswani Handicrafts
            </p>

            <h1 className="text-2xl font-semibold leading-snug text-gray-900 sm:text-3xl">
              {productDescription}
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              Product Code:{" "}
              <span className="font-semibold text-gray-800">
                {productCode}
              </span>
            </p>

            <div className="my-6 border-t border-gray-200" />

            {/* PRODUCT OVERVIEW */}

            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Product Information
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">
                    Category
                  </span>
                  <span className="text-right text-sm font-medium text-gray-800">
                    {displayValue(product.category)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">
                    Sub Category
                  </span>
                  <span className="text-right text-sm font-medium text-gray-800">
                    {Array.isArray(product.subCategory)
                      ? product.subCategory.length
                        ? product.subCategory.join(", ")
                        : "-"
                      : displayValue(product.subCategory)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">
                    Product Status
                  </span>
                  <span
                    className={`text-right text-sm font-semibold ${
                      isAvailable
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            </div>

            {/* PRODUCT DIMENSIONS */}

            <div className="mt-8">
              <div className="mb-4 flex items-center gap-2">
                <Ruler size={19} className="text-[#8b603b]" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Product Dimensions
                </h2>
              </div>

              {productSizes.length > 0 ? (
                <div className="space-y-4">
                  {productSizes.map((size, index) => (
                    <div
                      key={size._id || index}
                      className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <h3 className="mb-4 text-sm font-semibold text-gray-800">
                        Size {index + 1}
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Centimeters
                          </p>

                          <p className="text-sm text-gray-700">
                            Length: {displayValue(size.length)} cm
                          </p>
                          <p className="text-sm text-gray-700">
                            Width: {displayValue(size.width)} cm
                          </p>
                          <p className="text-sm text-gray-700">
                            Height: {displayValue(size.height)} cm
                          </p>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Inches
                          </p>

                          <p className="text-sm text-gray-700">
                            Length: {convertToInch(size.length)} in
                          </p>
                          <p className="text-sm text-gray-700">
                            Width: {convertToInch(size.width)} in
                          </p>
                          <p className="text-sm text-gray-700">
                            Height: {convertToInch(size.height)} in
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between rounded-lg bg-[#faf7f2] p-3">
                        <span className="text-sm font-medium text-gray-700">
                          Volume (CBM)
                        </span>

                        <span className="font-bold text-[#8b603b]">
                          {calculateCBM(
                            size.length,
                            size.width,
                            size.height
                          )} m³
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
                  No size information available.
                </p>
              )}
            </div>
          </section>

          {/* RIGHT: PURCHASE PANEL */}

          <aside className="min-w-0">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:sticky xl:top-20">
              <div className="flex items-center gap-2">
                <Package size={20} className="text-[#8b603b]" />

                <h2 className="font-semibold text-gray-900">
                  Dealer Purchase
                </h2>
              </div>

              <div className="my-5 border-t border-gray-200" />

              <p className="text-sm text-gray-500">
                Product Code
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {productCode}
              </p>

              <div className="my-5 border-t border-gray-200" />

              <div className="flex items-start gap-3">
                <Info
                  size={19}
                  className="mt-0.5 flex-shrink-0 text-[#8b603b]"
                />

                <p className="text-sm leading-relaxed text-gray-600">
                  Add this product to your dealer cart to include it in your enquiry.
                </p>
              </div>

              <div className="my-5 border-t border-gray-200" />

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-500">
                  Availability
                </span>

                <span
                  className={`text-sm font-semibold ${
                    isAvailable
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>

              <button
                type="button"
                disabled={!isAvailable}
                onClick={() => onAddToCart?.(product)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#5a3e2b] px-5 py-3 font-semibold text-white transition hover:bg-[#452f21] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                <ShoppingCart size={19} />
                Add to Cart
              </button>

              <p className="mt-4 text-center text-xs leading-relaxed text-gray-500">
                Product details and dimensions are provided for dealer reference.
              </p>
            </div>
          </aside>
        </div>

        {/* FULL WIDTH DESCRIPTION SECTION */}

        <section className="mt-12 rounded-xl border border-gray-200 bg-white p-5 sm:p-8">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Product Description
            </h2>
          </div>

          <div className="py-6">
            {product.description?.trim() ? (
              <p className="whitespace-pre-line text-sm leading-8 text-gray-700">
                {product.description}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                No product description available.
              </p>
            )}
          </div>
        </section>

        {/* SPECIFICATIONS TABLE */}

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-8">
          <h2 className="mb-6 border-b border-gray-200 pb-4 text-xl font-semibold text-gray-900">
            Product Specifications
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="w-1/2 bg-gray-50 px-4 py-4 font-medium text-gray-600">
                    Product Code
                  </td>
                  <td className="px-4 py-4 text-gray-800">
                    {productCode}
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="bg-gray-50 px-4 py-4 font-medium text-gray-600">
                    Category
                  </td>
                  <td className="px-4 py-4 text-gray-800">
                    {displayValue(product.category)}
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="bg-gray-50 px-4 py-4 font-medium text-gray-600">
                    Sub Category
                  </td>
                  <td className="px-4 py-4 text-gray-800">
                    {Array.isArray(product.subCategory)
                      ? product.subCategory.join(", ") || "-"
                      : displayValue(product.subCategory)}
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="bg-gray-50 px-4 py-4 font-medium text-gray-600">
                    Number of Images
                  </td>
                  <td className="px-4 py-4 text-gray-800">
                    {images.length}
                  </td>
                </tr>

                <tr>
                  <td className="bg-gray-50 px-4 py-4 font-medium text-gray-600">
                    Product Status
                  </td>
                  <td className="px-4 py-4 text-gray-800">
                    {isAvailable ? "Available" : "Unavailable"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
};

export default ProductDetailModal;
