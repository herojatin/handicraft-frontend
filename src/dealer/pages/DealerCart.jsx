
import React, { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

import { useCart } from "../context/CartContext";
import BASE_URL from "../../config/api";

const API_URL = BASE_URL.replace(/\/+$/, "");

// =====================================================
// HELPERS
// =====================================================

const isValidObjectId = (id) =>
  typeof id === "string" &&
  /^[0-9a-fA-F]{24}$/.test(id);

const getProductId = (item) => {
  const productId =
    item.productId?._id ||
    item.productId?.id ||
    item.product?._id ||
    item._id ||
    item.id ||
    item.productId;

  return typeof productId === "string"
    ? productId
    : "";
};

const getText = (value, fallback = "") => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value.map((v) => getText(v)).join(", ");
  }

  if (typeof value === "object") {
    return value.name || value.label || fallback;
  }

  return String(value);
};

// Resolve public URLs, local uploads, and signed S3 URLs.
// Raw S3 keys cannot be displayed without a URL signed by the backend.
const imageCandidates = (item) => {
  const sources = [
    item?.imageUrls, item?.imageUrl, item?.images, item?.image,
    item?.product?.imageUrls, item?.product?.imageUrl,
    item?.product?.images, item?.product?.image,
    item?.productId?.imageUrls, item?.productId?.imageUrl,
    item?.productId?.images, item?.productId?.image,
  ];
  const urls = [];
  const add = (value) => {
    if (Array.isArray(value)) { value.forEach(add); return; }
    if (value && typeof value === "object") {
      add(value.url ?? value.imageUrl ?? value.secure_url ??
          value.src ?? value.path ?? value.filename);
      return;
    }
    if (typeof value !== "string" || !value.trim()) return;
    const path = value.trim().replace(/\\/g, "/");
    if (/^(https?:\/\/|data:|blob:)/i.test(path)) {
      urls.push(path);
      return;
    }
    const clean = path.replace(/^\/+/, "");
    if (/^(products|categories)\//i.test(clean)) return;
    const encoded = clean.split("/").map(encodeURIComponent).join("/");
    if (clean.startsWith("uploads/")) {
      urls.push(`${API_URL}/${encoded}`);
    } else {
      urls.push(`${API_URL}/uploads/${encoded}`);
      urls.push(`${API_URL}/${encoded}`);
    }
  };
  sources.forEach(add);
  return [...new Set(urls)];
};

function CartProductImage({ item, alt }) {
  const urls = useMemo(() => imageCandidates(item), [item]);
  const [failed, setFailed] = useState([]);
  const imageKey = urls.join("|");

  useEffect(() => {
    setFailed([]);
  }, [imageKey]);

  // Show the first working image only; no carousel or zoom.
  const image = urls.find((url) => !failed.includes(url));

  return (
    <div className="w-36 sm:w-44 shrink-0">
      <div className="aspect-square overflow-hidden rounded-lg border bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={alt}
            className="w-full h-full object-contain"
            onError={() => {
              setFailed((previous) =>
                previous.includes(image) ? previous : [...previous, image]
              );
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
            No Image
          </div>
        )}
      </div>
    </div>
  );
}

const getDimensions = (item) => ({
  length: item.length ?? item.size?.length ?? "",
  width: item.width ?? item.size?.width ?? "",
  height: item.height ?? item.size?.height ?? "",
});

const calculateCBM = (item) => {
  const savedCBM = Number(
    item.cbm ?? item.size?.cbm ?? 0
  );

  if (savedCBM > 0 && Number.isFinite(savedCBM)) {
    return savedCBM;
  }

  const { length, width, height } =
    getDimensions(item);

  const l = Number(length);
  const w = Number(width);
  const h = Number(height);

  if (l > 0 && w > 0 && h > 0) {
    return (l * w * h) / 1000000;
  }

  return 0;
};

// =====================================================
// DEALER CART
// =====================================================

const DealerCart = () => {
  const {
    cart,
    removeFromCart,
    clearCart,
    increaseQty,
    decreaseQty,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [enquiryQuestion, setEnquiryQuestion] =
    useState("");

  const cartItems = Array.isArray(cart) ? cart : [];

  // The cart may contain only an S3 key or a single image.
  // Fetch current products to obtain their complete signed imageUrls array.
  const [productLookup, setProductLookup] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    axios.get(`${API_URL}/api/products`, { signal: controller.signal })
      .then(({ data }) => {
        const products = Array.isArray(data) ? data :
          Array.isArray(data?.products) ? data.products :
          Array.isArray(data?.data?.products) ? data.data.products :
          Array.isArray(data?.data) ? data.data : [];
        const lookup = {};
        products.forEach((product) => {
          if (product._id) lookup[String(product._id)] = product;
          if (product.productCode) lookup[`code:${String(product.productCode).toLowerCase()}`] = product;
        });
        setProductLookup(lookup);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error("Unable to fetch product images:", error);
        }
      });
    return () => controller.abort();
  }, []);


  const totalQuantity = cartItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 1),
    0
  );

  // ===================================================
  // SEND ENQUIRY
  // ===================================================

  const handleSendEnquiry = async () => {
    if (loading) return;

    if (cartItems.length === 0) {
      alert("Your enquiry cart is empty.");
      return;
    }

    const dealerToken =
      localStorage.getItem("dealerToken");

    if (!dealerToken) {
      alert(
        "Your dealer session has expired. Please login again."
      );
      return;
    }

    const invalidItem = cartItems.find(
      (item) => !isValidObjectId(getProductId(item))
    );

    if (invalidItem) {
      console.error(
        "Invalid product ID:",
        invalidItem
      );

      alert(
        "One of the products has an invalid Product ID. Please remove and add it again."
      );
      return;
    }

    try {
      setLoading(true);

      const orderItems = cartItems.map((item) => {
        const dimensions = getDimensions(item);

        return {
          productId: getProductId(item),

          productCode:
            item.productCode ||
            item.code ||
            item.productId?.productCode ||
            "",

          productName:
            item.productName ||
            item.name ||
            item.product?.name ||
            item.description ||
            "Product",

          name:
            item.name ||
            item.productName ||
            item.description ||
            "Product",

          quantity: Number(item.quantity || 1),

          image:
            item.image ||
            item.imageUrl ||
            (Array.isArray(item.images)
              ? item.images[0]
              : item.images) ||
            "",

          category: getText(item.category),

          subCategory:
            item.subCategory || [],

          question: getText(
            item.question || item.comment
          ),

          comment: getText(
            item.question || item.comment
          ),

          size: item.size || null,

          length: dimensions.length,
          width: dimensions.width,
          height: dimensions.height,

          cbm: calculateCBM(item),
        };
      });

      const response = await axios.post(
        `${API_URL}/api/orders`,
        {
          items: orderItems,
          enquiryQuestion: enquiryQuestion.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${dealerToken}`,
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to send enquiry."
        );
      }

      alert(
        response.data.message ||
         "Query sent successfully."
      );

      clearCart();
      setEnquiryQuestion("");
    } catch (error) {
      console.error(
        "SEND ENQUIRY ERROR:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to send enquiry."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADING */}

        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart
            className="text-[#b18152]"
            size={34}
          />

          <h1 className="text-3xl font-bold text-gray-800">
            My Enquiry Cart
          </h1>
        </div>

        {cartItems.length === 0 ? (
          // EMPTY CART

          <div className="bg-white rounded-xl shadow p-16 text-center">
            <ShoppingCart
              size={70}
              className="mx-auto text-gray-300 mb-4"
            />

            <h2 className="text-2xl font-semibold text-gray-700">
              Your cart is empty
            </h2>

            <p className="text-gray-500 mt-2">
              Browse products and add them to your enquiry.
            </p>

            <Link
              to="/dealer"
              className="inline-flex items-center gap-2 mt-8 bg-[#b18152] hover:bg-[#936740] text-white px-6 py-3 rounded-lg"
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* CART ITEMS */}

            <div className="space-y-6">
              {cartItems.map((item, index) => {
                const productId =
                  getProductId(item);

                const itemId =
                  item.cartItemId ||
                  item.cartId ||
                  item._id ||
                  item.id ||
                  productId;

                const productName = getText(
                  item.name ||
                    item.productName ||
                    item.description,
                  "Product"
                );

                const question = getText(
                  item.question || item.comment
                );

                const dimensions =
                  getDimensions(item);

                const cbm =
                  calculateCBM(item);

                return (
                  <div
                    key={`${String(itemId)}-${index}`}
                    className="bg-white rounded-xl shadow-md p-5 flex flex-col md:flex-row items-center justify-between gap-6"
                  >
                    {/* PRODUCT INFORMATION */}

                    <div className="flex items-start gap-5 w-full">

                      {/* SINGLE PRODUCT IMAGE — NO ZOOM OR ARROWS */}
                      <CartProductImage
                        item={{
                          ...item,
                          // Prefer the current product API's signed S3 URLs.
                          imageUrls: (
                            productLookup[productId] ||
                            productLookup[`code:${String(item.productCode || item.code || "").toLowerCase()}`]
                          )?.imageUrls || item.imageUrls,
                          product: (
                            productLookup[productId] ||
                            productLookup[`code:${String(item.productCode || item.code || "").toLowerCase()}`]
                          ) || item.product,
                        }}
                        alt={productName}
                      />

                      {/* DETAILS */}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {productName}
                        </h3>

                        <p className="text-gray-500 mt-1">
                          Product Code:{" "}
                          {getText(
                            item.productCode ||
                              item.code ||
                              item.productId?.productCode,
                            "-"
                          )}
                        </p>

                        {productId && (
                          <p className="text-sm text-gray-400 mt-1 break-all">
                            Product ID: {productId}
                          </p>
                        )}

                        {item.category && (
                          <p className="text-sm text-gray-500 mt-1">
                            Category:{" "}
                            {getText(item.category)}
                          </p>
                        )}

                        {item.subCategory && (
                          <p className="text-sm text-gray-500 mt-1">
                            Sub Category:{" "}
                            {getText(item.subCategory)}
                          </p>
                        )}

                        {/* DIMENSIONS */}

                        <div className="mt-3 p-3 bg-gray-50 border rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Dimensions
                          </p>

                          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                            <span>
                              Length:{" "}
                              {getText(
                                dimensions.length,
                                "-"
                              )}{" "}
                              cm
                            </span>

                            <span>
                              Width:{" "}
                              {getText(
                                dimensions.width,
                                "-"
                              )}{" "}
                              cm
                            </span>

                            <span>
                              Height:{" "}
                              {getText(
                                dimensions.height,
                                "-"
                              )}{" "}
                              cm
                            </span>

                            <span className="font-semibold">
                              CBM: {cbm.toFixed(6)}
                            </span>
                          </div>
                        </div>

                        {/* PRODUCT QUESTION */}

                        {question && (
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                            <MessageSquare
                              size={17}
                              className="text-amber-700 mt-0.5 flex-shrink-0"
                            />

                            <div>
                              <strong className="block text-xs uppercase tracking-wider text-amber-800 mb-1">
                                Product Question
                              </strong>

                              <p className="text-sm text-amber-900 whitespace-pre-wrap break-words">
                                {question}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* QUANTITY AND REMOVE */}

                    <div className="flex items-center gap-6 self-center">
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            decreaseQty(item)
                          }
                          disabled={loading}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
                        >
                          -
                        </button>

                        <span className="px-5 min-w-[50px] text-center font-medium">
                          {item.quantity || 1}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQty(item)
                          }
                          disabled={loading}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(itemId)
                        }
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 cursor-pointer"
                        title="Remove Product"
                      >
                        <Trash2 size={22} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* GENERAL ENQUIRY QUESTION */}

            <div className="mt-8 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare
                  size={24}
                  className="text-[#b18152]"
                />

                <h3 className="text-xl font-semibold text-gray-800">
                  Have a Question?
                </h3>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Write your enquiry or any special
                requirements regarding the products
                in your cart.
              </p>

              <textarea
                value={enquiryQuestion}
                onChange={(event) =>
                  setEnquiryQuestion(event.target.value)
                }
                placeholder="Enter your question or special requirements..."
                rows={4}
                maxLength={2000}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg p-4 text-sm outline-none resize-none focus:border-[#b18152] focus:ring-1 focus:ring-[#b18152]"
              />

              <p className="text-xs text-gray-400 mt-2">
                {enquiryQuestion.length}/2000 characters
              </p>
            </div>

            {/* SUMMARY */}

            <div className="mt-10 bg-white rounded-xl shadow p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-5">
                <div>
                  <h2 className="text-xl font-semibold">
                    Total Products: {cartItems.length}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Total Quantity: {totalQuantity}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      clearCart();
                      setEnquiryQuestion("");
                    }}
                    disabled={loading}
                    className="border border-red-500 text-red-500 hover:bg-red-50 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    Clear Cart
                  </button>

                  <button
                    type="button"
                    onClick={handleSendEnquiry}
                    disabled={loading}
                    className="bg-[#b18152] hover:bg-[#936740] text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading
                      ? "Sending Enquiry..."
                      : "Send Enquiry"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DealerCart;
