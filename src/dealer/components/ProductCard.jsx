import React from "react";
import BASE_URL from "../../config/api";

// =====================================================
// DEFAULT PLACEHOLDER IMAGE
// =====================================================

const DEFAULT_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <rect width="800" height="800" fill="#f8f4ef"/>
      <rect x="35" y="35" width="730" height="730" rx="28" fill="none" stroke="#d8c7b8" stroke-width="3"/>
      <path d="M80 145 V80 H145" fill="none" stroke="#5a3e2b" stroke-width="5" stroke-linecap="round"/>
      <path d="M655 80 H720 V145" fill="none" stroke="#5a3e2b" stroke-width="5" stroke-linecap="round"/>
      <path d="M80 655 V720 H145" fill="none" stroke="#5a3e2b" stroke-width="5" stroke-linecap="round"/>
      <path d="M655 720 H720 V655" fill="none" stroke="#5a3e2b" stroke-width="5" stroke-linecap="round"/>
      <rect x="245" y="245" width="310" height="230" rx="18" fill="#e2d2c3" stroke="#5a3e2b" stroke-width="6"/>
      <path d="M285 300 C315 270 350 270 380 300 C410 330 440 330 470 300 C500 270 535 270 565 300" fill="none" stroke="#8b684f" stroke-width="7"/>
      <path d="M285 355 C315 325 350 325 380 355 C410 385 440 385 470 355 C500 325 535 325 565 355" fill="none" stroke="#8b684f" stroke-width="7"/>
      <path d="M285 410 C315 380 350 380 380 410 C410 440 440 440 470 410 C500 380 535 380 565 410" fill="none" stroke="#8b684f" stroke-width="7"/>
      <circle cx="400" cy="360" r="42" fill="#f8f4ef" stroke="#5a3e2b" stroke-width="5"/>
      <path d="M400 330 C385 350 385 370 400 390 C415 370 415 350 400 330Z" fill="#5a3e2b"/>
      <rect x="275" y="475" width="35" height="55" rx="6" fill="#5a3e2b"/>
      <rect x="490" y="475" width="35" height="55" rx="6" fill="#5a3e2b"/>
      <text x="400" y="595" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="600" letter-spacing="3" fill="#5a3e2b">NO IMAGE</text>
      <text x="400" y="635" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" letter-spacing="2" fill="#8b684f">AVAILABLE</text>
      <text x="400" y="700" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" letter-spacing="4" fill="#9b8777">HANDCRAFTED COLLECTION</text>
    </svg>
  `);

// =====================================================
// DISPLAY VALUE
// =====================================================

const displayValue = (value) => {
  if (value == null) return "";

  if (Array.isArray(value)) {
    return value
      .map(displayValue)
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    return String(
      value.title ??
      value.name ??
      value.subcategory ??
      value.category ??
      value._id ??
      ""
    );
  }

  return String(value);
};

// =====================================================
// IMAGE URL HELPER
// SUPPORTS AWS S3 + LOCAL UPLOADS
// =====================================================

const getImageUrl = (image) => {
  if (!image) return DEFAULT_IMAGE;

  const raw =
    typeof image === "object"
      ? image.url ??
        image.path ??
        image.image ??
        image.src ??
        image.filename ??
        ""
      : image;

  if (typeof raw !== "string" || !raw.trim()) {
    return DEFAULT_IMAGE;
  }

  const value = raw.trim().replace(/\\/g, "/");

  // AWS S3 presigned URL, CloudFront URL,
  // existing full URL, data URL or blob URL.
  // Do not modify signed URLs.
  if (/^(https?:\/\/|data:image\/|blob:)/i.test(value)) {
    return value;
  }

  const base = String(BASE_URL || "").replace(/\/$/, "");

  // Existing local backend image
  if (value.startsWith("/uploads/")) {
    return `${base}${value}`;
  }

  // Other absolute frontend paths
  if (value.startsWith("/")) {
    return value;
  }

  // Existing local images stored as filenames
  // or uploads/filename.jpg
  const clean = value.replace(/^\/+/, "");

  // An S3 key such as products/abc.jpg is not
  // a usable URL for a private bucket.
  // It must have a corresponding signed URL.
  if (clean.startsWith("products/")) {
    return DEFAULT_IMAGE;
  }

  const uploadPath = clean.startsWith("uploads/")
    ? clean
    : `uploads/${clean}`;

  return `${base}/${uploadPath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
};

// =====================================================
// GET PRODUCT MAIN IMAGE
// =====================================================

const getProductMainImage = (product) => {
  // First priority: AWS S3 signed image URLs
  const imageUrls = Array.isArray(product?.imageUrls)
    ? product.imageUrls
    : product?.imageUrls
      ? [product.imageUrls]
      : [];

  if (imageUrls.length > 0 && imageUrls[0]) {
    return getImageUrl(imageUrls[0]);
  }

  // Second priority: existing product images
  const images = Array.isArray(product?.images)
    ? product.images
    : product?.images
      ? [product.images]
      : product?.image
        ? [product.image]
        : [];

  if (images.length > 0) {
    return getImageUrl(images[0]);
  }

  return DEFAULT_IMAGE;
};

// =====================================================
// PRODUCT CARD
// =====================================================

const ProductCard = ({
  product,
  onQuickView,
  onProductDetail,
  onAddToCart,
}) => {
  const mainImage = getProductMainImage(product);

  const productCode = displayValue(
    product?.productCode ?? product?.code ?? "N/A"
  );

  const category = displayValue(product?.category);

  const subCategory = displayValue(
    product?.subCategory ?? product?.subcategory
  );

  return (
    <div
      onClick={() => onProductDetail?.(product)}
      className="
        bg-white
        rounded-2xl
        shadow-md
        overflow-hidden
        border border-gray-200
        hover:shadow-xl
        hover:-translate-y-1
        transition-all duration-300
        cursor-pointer
        min-w-0
        w-full
      "
    >
      {/* ======================================
          PRODUCT IMAGE
      ====================================== */}

      <div className="relative w-full h-64 bg-[#f8f4ef]">
        <img
          key={mainImage}
          src={mainImage}
          alt={productCode}
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.src !== DEFAULT_IMAGE) {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_IMAGE;
            }
          }}
          className="w-full h-full object-cover"
        />

        {/* ======================================
            QUICK VIEW BUTTON
        ====================================== */}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickView?.(product);
          }}
          className="
            absolute
            bottom-3
            left-1/2
            -translate-x-1/2
            bg-white
            text-gray-800
            px-5
            py-2
            rounded-lg
            shadow-md
            text-sm
            font-semibold
            hover:bg-gray-100
            transition
            whitespace-nowrap
            max-w-[95%]
            cursor-pointer
          "
        >
          Quick View
        </button>
      </div>

      {/* ======================================
          PRODUCT DETAILS
      ====================================== */}

      <div className="p-5">
        {/* PRODUCT CODE */}

        <h2 className="text-lg font-semibold text-gray-800 line-clamp-2 break-words">
          {productCode}
        </h2>

        <p className="text-sm text-gray-500 mt-1 break-words">
          Product Code: {productCode}
        </p>

        {/* CATEGORY */}

        {category && (
          <p className="text-sm text-gray-500 mt-1 break-words">
            Category: {category}
          </p>
        )}

        {/* SUBCATEGORY */}

        {subCategory && (
          <p className="text-sm text-gray-500 mt-1 break-words">
            Sub Category: {subCategory}
          </p>
        )}

        {/* ======================================
            ADD TO CART BUTTON
        ====================================== */}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(product);
          }}
          className="
            w-full
            mt-4
            bg-[#5a3e2b]
            text-white
            py-2.5
            rounded-lg
            font-semibold
            hover:bg-[#452f21]
            transition
            cursor-pointer
          "
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;