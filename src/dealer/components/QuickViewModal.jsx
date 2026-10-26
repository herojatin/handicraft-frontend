
import { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import BASE_URL from "../../config/api";

const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState("");
  const [showQuestionBox, setShowQuestionBox] = useState(false);
  const [sendingQuestion, setSendingQuestion] = useState(false);

  if (!product) return null;

  // ADD TO CART
  const handleCart = () => {
    const finalQuantity =
      quantity === "" || Number(quantity) < 1
        ? 1
        : Number(quantity);

    onAddToCart({
      ...product,
      quantity: finalQuantity,
      comment: comment.trim(),
    });

    onClose();
  };

  // ASK QUESTION
const handleSendQuestion = async () => {
  const question = comment.trim();

  // =====================================================
  // VALIDATION
  // =====================================================

  if (!question) {
    alert("Please enter your question.");
    return;
  }

  if (!product?._id) {
    alert("Product information is missing.");
    return;
  }

  try {
    setSendingQuestion(true);

    // =====================================================
    // GET LOGGED-IN DEALER
    // =====================================================

    const storedDealer = localStorage.getItem("dealer");

    let dealer = null;

    if (storedDealer) {
      try {
        dealer = JSON.parse(storedDealer);
      } catch (error) {
        console.error(
          "Unable to parse dealer information:",
          error
        );
      }
    }

    // =====================================================
    // PREPARE DEALER NAME
    // =====================================================

    const dealerName = dealer
      ? `${dealer.firstName || ""} ${
          dealer.lastName || ""
        }`.trim()
      : "";

    // =====================================================
    // PREPARE PRODUCT IMAGE
    // =====================================================

    const productImage =
      product.images?.[0] || "";

    // =====================================================
    // SEND QUESTION DIRECTLY TO FAQ
    // =====================================================

    const response = await axios.post(
      `${BASE_URL}/api/faqs`,
      {
        // PRODUCT DETAILS
        productId: product._id,

        productCode:
          product.productCode || "",

        productName:
          product.name || "",

        productImage,

        // DEALER DETAILS
        dealer:
          dealer?._id || dealer?.id || null,

        dealerName,

        dealerEmail:
          dealer?.email || "",

        dealerCompany:
          dealer?.companyName ||
          dealer?.company ||
          "",

        // QUESTION
        question,
      }
    );

    // =====================================================
    // CHECK RESPONSE
    // =====================================================

    if (!response.data?.success) {
      throw new Error(
        response.data?.message ||
          "Unable to submit your question."
      );
    }

    alert(
      response.data?.message ||
        "Your question has been sent to the admin."
    );

    // =====================================================
    // RESET QUESTION BOX
    // =====================================================

    setComment("");
    setShowQuestionBox(false);
  } catch (error) {
    console.error(
      "Error sending question:",
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
        error.message ||
        "Failed to send your question. Please try again."
    );
  } finally {
    setSendingQuestion(false);
  }
};

  // DIMENSIONS: CM TO INCHES
  const convertToInch = (value) => {
    if (value === undefined || value === null || value === "") {
      return "-";
    }

    const number = Number(value);

    return Number.isFinite(number)
      ? (number / 2.54).toFixed(2)
      : "-";
  };

  // CALCULATE CBM FROM CENTIMETRES
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

  // SUPPORT ADMIN DIMENSIONS IN MULTIPLE STRUCTURES
  const productSizes =
    Array.isArray(product.sizes) && product.sizes.length > 0
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

  // DISPLAY EMPTY VALUES CORRECTLY
  const displayValue = (value) =>
    value !== undefined && value !== null && value !== ""
      ? value
      : "-";

  // IMAGE URL
  const imageUrl = (image) => {
    if (!image) return "/no-image.png";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${BASE_URL}/uploads/${image.replace(/^\/?uploads\//, "")}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl w-full max-w-7xl max-h-[95vh] overflow-y-auto shadow-2xl mt-2 sm:mt-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-5 right-5 z-[100] w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-300 text-gray-700 shadow-sm hover:bg-[#b18152] hover:text-white transition"
        >
          <X size={21} />
        </button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 p-6 sm:p-8 lg:p-10 pt-20 lg:pt-10">
          {/* LEFT: PRODUCT IMAGE */}
          <div className="lg:sticky lg:top-6 self-start">
            <img
              src={
                product.images?.length
                  ? imageUrl(product.images[0])
                  : "/no-image.png"
              }
              alt={product.productCode || "Product"}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/no-image.png";
              }}
              className="w-full h-[400px] lg:h-[550px] object-contain rounded-lg border bg-gray-50"
            />
          </div>

          {/* RIGHT: PRODUCT DETAILS */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-5 pr-12">
              {product.productCode || "Product"}
            </h1>

            {product.description && (
              <p className="text-gray-600 mb-7 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            )}

            {/* PRODUCT INFORMATION */}
            <div className="space-y-3 text-lg border-b pb-6">
              <p>
                <strong>Category:</strong>{" "}
                {product.category || "-"}
              </p>

              <p>
                <strong>Sub Categories:</strong>{" "}
                {Array.isArray(product.subCategory)
                  ? product.subCategory.join(", ")
                  : product.subCategory || "-"}
              </p>

              <p>
                <strong>Available Quantity:</strong>{" "}
                {displayValue(product.quantity)}
              </p>
            </div>

            {/* PRODUCT SIZES AND CBM */}
            <div className="mt-7">
              <h2 className="text-2xl font-semibold mb-4">
                Product Sizes
              </h2>

              {productSizes.length > 0 ? (
                <div className="space-y-5">
                  {productSizes.map((size, index) => (
                    <div
                      key={size._id || index}
                      className="border rounded-lg p-5 bg-gray-50"
                    >
                      <p className="font-semibold mb-4">
                        Size {index + 1}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* CENTIMETRES */}
                        <div>
                          <h4 className="font-semibold mb-2">
                            Dimensions (CM)
                          </h4>

                          <p>
                            Length: {displayValue(size.length)} cm
                          </p>

                          <p>
                            Width: {displayValue(size.width)} cm
                          </p>

                          <p>
                            Height: {displayValue(size.height)} cm
                          </p>
                        </div>

                        {/* INCHES */}
                        <div>
                          <h4 className="font-semibold mb-2">
                            Dimensions (Inches)
                          </h4>

                          <p>
                            Length: {convertToInch(size.length)} in
                          </p>

                          <p>
                            Width: {convertToInch(size.width)} in
                          </p>

                          <p>
                            Height: {convertToInch(size.height)} in
                          </p>
                        </div>
                      </div>

                      {/* CBM */}
                      <div className="mt-4 bg-white border rounded-lg p-4">
                        <div className="flex items-center justify-between gap-3">
                          <strong className="text-gray-800">
                            Volume (CBM)
                          </strong>

                          <span className="text-lg font-bold text-[#8b603b]">
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
                <p className="text-gray-500 border rounded-lg p-4 bg-gray-50">
                  No size information available.
                </p>
              )}
            </div>

            {/* QUANTITY */}
            <div className="mt-7">
              <label className="block font-semibold mb-3 text-lg">
                Enter Quantity
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    setQuantity("");
                  } else if (
                    Number.isInteger(Number(value)) &&
                    Number(value) >= 1
                  ) {
                    setQuantity(Number(value));
                  }
                }}
                onBlur={() => {
                  if (quantity === "" || Number(quantity) < 1) {
                    setQuantity(1);
                  }
                }}
                className="w-28 h-12 border rounded-lg text-center text-lg outline-none focus:ring-2 focus:ring-[#b18152]"
              />
            </div>

            {/* ASK A QUESTION */}
            <div className="mt-8 border-t pt-7">
              <h3 className="text-xl font-semibold mb-3">
                Need More Information?
              </h3>

              <p className="text-gray-500 mb-4">
                Have a question about this product? Send it directly
                to our team.
              </p>

              <button
                type="button"
                onClick={() => setShowQuestionBox((prev) => !prev)}
                className="bg-[#c79a63] hover:bg-[#a97b48] text-white px-6 py-3 rounded-md font-semibold transition"
              >
                {showQuestionBox
                  ? "Hide Question Box"
                  : "Ask a Question"}
              </button>

              {showQuestionBox && (
                <div className="mt-4">
                  <textarea
                    rows={5}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your question about this product..."
                    className="w-full border rounded-lg p-4 resize-none outline-none focus:ring-2 focus:ring-[#c79a63]"
                  />

                  <button
                    type="button"
                    onClick={handleSendQuestion}
                    disabled={!comment.trim() || sendingQuestion}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md font-semibold transition"
                  >
                    {sendingQuestion
                      ? "Sending..."
                      : "Send Question to Admin"}
                  </button>
                </div>
              )}
            </div>

            {/* ADD TO CART */}
            <div className="mt-8 pb-4">
              <button
                type="button"
                onClick={handleCart}
                className="w-full sm:w-auto bg-[#b18152] hover:bg-[#94663c] text-white px-10 py-3 rounded-lg font-semibold transition"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;