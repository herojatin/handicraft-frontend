import { useEffect, useMemo, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import BASE_URL from "../../config/api";

const DEFAULT_IMAGE = "/default-product.png";

const ProductDetailModal = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState([]);
  const [hovered, setHovered] = useState(false);

  const [zoomPosition, setZoomPosition] = useState({
    x: 50,
    y: 50,
  });

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

      if (!raw) {
        return [];
      }

      if (raw.startsWith("[")) {
        try {
          const parsed = JSON.parse(raw);

          if (Array.isArray(parsed)) {
            return toArray(parsed);
          }
        } catch {
          // Handle legacy comma-separated images.
        }
      }

      // Do not split signed URLs containing commas.
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
      if (!value) {
        return null;
      }

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

    return paths.map(
      (entry, index) =>
        resolve(signed[index]) ||
        resolve(entry) ||
        DEFAULT_IMAGE
    );
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
    selectedImage &&
    !failedImages.includes(selectedImage)
      ? selectedImage
      : DEFAULT_IMAGE;

  // Show arrows only when at least 2 images exist.
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

    if (images.length <= 1) {
      return;
    }

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

    if (images.length <= 1) {
      return;
    }

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

    if (broken.endsWith(DEFAULT_IMAGE)) {
      return;
    }

    console.warn(
      "Product detail image failed:",
      broken
    );

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

  const calculateCBM = (
    length,
    width,
    height
  ) => {
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
  // PRODUCT CODE
  // =====================================================

  const productCode =
    product.productCode ||
    product.code ||
    "-";

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div
      className="
        fixed inset-0
        z-[100]
        bg-black/70
        flex items-center justify-center
        p-4
      "
      onClick={onClose}
    >
      <div
        className="
          relative
          bg-white
          w-full
          max-w-7xl
          max-h-[95vh]
          overflow-y-auto
          rounded-2xl
          shadow-2xl
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* =====================================================
            CLOSE BUTTON
        ===================================================== */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="
            absolute
            top-4
            right-4
            z-30
            w-10
            h-10
            flex
            items-center
            justify-center
            rounded-full
            bg-white
            border
            border-gray-300
            text-gray-700
            shadow-md
            hover:bg-[#b18152]
            hover:text-white
            transition
            cursor-pointer
          "
        >
          <X size={22} />
        </button>

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-8
            p-6
            sm:p-8
            lg:p-10
          "
        >
          {/* =====================================================
              IMAGE SECTION
          ===================================================== */}

          <div className="self-start lg:sticky lg:top-6">
            <div
              className="
                relative
                w-full
                h-[400px]
                lg:h-[550px]
                bg-gray-50
                rounded-xl
                border
                overflow-hidden
              "
            >
              {/* MAIN IMAGE */}

              <img
                key={safeIndex}
                src={currentImage}
                alt={productCode}
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
                    ? "scale(2.3)"
                    : "scale(1)",

                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }}
                className="
                  w-full
                  h-full
                  object-contain
                  transition-transform
                  duration-150
                  cursor-zoom-in
                "
              />

              {/* =================================================
                  PREVIOUS ARROW
                  ONLY WHEN MORE THAN ONE IMAGE
              ================================================= */}

              {showImageArrows && (
                <button
                  type="button"
                  onClick={handlePreviousImage}
                  title="Previous image"
                  aria-label="Previous image"
                  className="
                    absolute
                    z-30
                    left-3
                    top-1/2
                    -translate-y-1/2
                    w-11
                    h-11
                    flex
                    items-center
                    justify-center
                    rounded-full
                    bg-white/90
                    shadow-lg
                    hover:bg-white
                    transition
                    cursor-pointer
                  "
                >
                  <ChevronLeft size={25} />
                </button>
              )}

              {/* =================================================
                  NEXT ARROW
                  ONLY WHEN MORE THAN ONE IMAGE
              ================================================= */}

              {showImageArrows && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  title="Next image"
                  aria-label="Next image"
                  className="
                    absolute
                    z-30
                    right-3
                    top-1/2
                    -translate-y-1/2
                    w-11
                    h-11
                    flex
                    items-center
                    justify-center
                    rounded-full
                    bg-white/90
                    shadow-lg
                    hover:bg-white
                    transition
                    cursor-pointer
                  "
                >
                  <ChevronRight size={25} />
                </button>
              )}

              {/* =================================================
                  IMAGE COUNT
              ================================================= */}

              {images.length > 1 && (
                <div
                  className="
                    absolute
                    bottom-4
                    left-1/2
                    -translate-x-1/2
                    bg-black/70
                    text-white
                    px-4
                    py-1.5
                    rounded-full
                    text-sm
                  "
                >
                  {safeIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* =====================================================
                IMAGE THUMBNAILS
            ===================================================== */}

            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setHovered(false);
                    }}
                    className={`
                      flex-shrink-0
                      w-20
                      h-20
                      rounded-lg
                      overflow-hidden
                      border-2
                      transition
                      cursor-pointer
                      ${
                        safeIndex === index
                          ? "border-[#5a3e2b]"
                          : "border-gray-200"
                      }
                    `}
                  >
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src =
                          DEFAULT_IMAGE;
                      }}
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* =====================================================
              PRODUCT INFORMATION
          ===================================================== */}

          <div>
            <p className="text-sm text-gray-500 mb-2">
              Product Details
            </p>

            {/* PRODUCT CODE */}

            <h1
              className="
                text-3xl
                lg:text-4xl
                font-bold
                text-gray-800
                pr-12
              "
            >
              {productCode}
            </h1>

            {/* DESCRIPTION */}

            {product.description && (
              <p
                className="
                  text-gray-600
                  mt-5
                  whitespace-pre-line
                  leading-relaxed
                "
              >
                {product.description}
              </p>
            )}

            {/* =================================================
                BASIC DETAILS
            ================================================= */}

            <div
              className="
                mt-7
                space-y-3
                border-b
                pb-6
              "
            >
              {/* PRODUCT CODE */}

              <div className="flex justify-between gap-5">
                <span className="font-semibold text-gray-600">
                  Product Code
                </span>

                <span className="text-gray-800 text-right">
                  {displayValue(product.productCode)}
                </span>
              </div>

              {/* CATEGORY */}

              <div className="flex justify-between gap-5">
                <span className="font-semibold text-gray-600">
                  Category
                </span>

                <span className="text-gray-800 text-right">
                  {displayValue(product.category)}
                </span>
              </div>

              {/* SUBCATEGORY */}

              <div className="flex justify-between gap-5">
                <span className="font-semibold text-gray-600">
                  Sub Categories
                </span>

                <span className="text-gray-800 text-right">
                  {Array.isArray(product.subCategory)
                    ? product.subCategory.length > 0
                      ? product.subCategory.join(", ")
                      : "-"
                    : displayValue(product.subCategory)}
                </span>
              </div>

              {/* AVAILABLE QUANTITY */}

              <div className="flex justify-between gap-5">
                <span className="font-semibold text-gray-600">
                  Available Quantity
                </span>

                <span className="text-gray-800 text-right">
                  {displayValue(product.quantity)}
                </span>
              </div>

              {/* STATUS */}

              <div className="flex justify-between gap-5">
                <span className="font-semibold text-gray-600">
                  Status
                </span>

                <span className="text-green-600 font-semibold">
                  {displayValue(product.status)}
                </span>
              </div>
            </div>

            {/* =====================================================
                PRODUCT SIZES
            ===================================================== */}

            <div className="mt-7">
              <h2
                className="
                  text-2xl
                  font-semibold
                  text-gray-800
                  mb-4
                "
              >
                Product Sizes
              </h2>

              {productSizes.length > 0 ? (
                <div className="space-y-5">
                  {productSizes.map((size, index) => (
                    <div
                      key={size._id || index}
                      className="
                        border
                        rounded-xl
                        p-5
                        bg-gray-50
                      "
                    >
                      <p
                        className="
                          font-semibold
                          text-gray-800
                          mb-4
                        "
                      >
                        Size {index + 1}
                      </p>

                      <div
                        className="
                          grid
                          grid-cols-1
                          sm:grid-cols-2
                          gap-5
                        "
                      >
                        {/* =================================================
                            DIMENSIONS IN CM
                        ================================================= */}

                        <div>
                          <h4
                            className="
                              font-semibold
                              mb-2
                              text-gray-800
                            "
                          >
                            Dimensions (CM)
                          </h4>

                          <p>
                            Length:{" "}
                            {displayValue(size.length)} cm
                          </p>

                          <p>
                            Width:{" "}
                            {displayValue(size.width)} cm
                          </p>

                          <p>
                            Height:{" "}
                            {displayValue(size.height)} cm
                          </p>
                        </div>

                        {/* =================================================
                            DIMENSIONS IN INCHES
                        ================================================= */}

                        <div>
                          <h4
                            className="
                              font-semibold
                              mb-2
                              text-gray-800
                            "
                          >
                            Dimensions (Inches)
                          </h4>

                          <p>
                            Length:{" "}
                            {convertToInch(size.length)} in
                          </p>

                          <p>
                            Width:{" "}
                            {convertToInch(size.width)} in
                          </p>

                          <p>
                            Height:{" "}
                            {convertToInch(size.height)} in
                          </p>
                        </div>
                      </div>

                      {/* =================================================
                          CBM
                      ================================================= */}

                      <div
                        className="
                          mt-5
                          bg-white
                          border
                          rounded-lg
                          p-4
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-3
                          "
                        >
                          <strong className="text-gray-800">
                            Volume (CBM)
                          </strong>

                          <span
                            className="
                              text-lg
                              font-bold
                              text-[#8b603b]
                            "
                          >
                            {calculateCBM(
                              size.length,
                              size.width,
                              size.height
                            )}{" "}
                            m³
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  className="
                    text-gray-500
                    border
                    rounded-lg
                    p-4
                    bg-gray-50
                  "
                >
                  No size information available.
                </p>
              )}
            </div>

            {/* =====================================================
                ADD TO CART
            ===================================================== */}

            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="
                w-full
                mt-8
                bg-[#5a3e2b]
                text-white
                py-3
                rounded-xl
                font-semibold
                text-lg
                hover:bg-[#452f21]
                transition
                cursor-pointer
              "
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;