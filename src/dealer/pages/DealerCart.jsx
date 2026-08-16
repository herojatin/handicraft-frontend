import { ShoppingCart, Trash2, ArrowLeft, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import BASE_URL from "../../config/api";

const API_URL = `${BASE_URL}`;

const getProductImage = (item) => {
  if (!item) return null;

  let image =
    item.image ||
    item.imageUrl ||
    item.images ||
    item.product?.image ||
    item.product?.images;

  if (Array.isArray(image)) {
    image = image[0];
  }

  if (image && typeof image === "object") {
    image = image.url || image.path || image.secure_url || null;
  }

  if (!image || typeof image !== "string") {
    return null;
  }

  let cleanImage = image.replace(/\\/g, "/").trim();

  if (
    cleanImage.startsWith("http://") ||
    cleanImage.startsWith("https://") ||
    cleanImage.startsWith("data:image/")
  ) {
    return cleanImage;
  }

  cleanImage = cleanImage.replace(/^\/+/, "");

  if (cleanImage.startsWith("uploads/")) {
    const parts = cleanImage.split("/");
    const encoded = parts.map((p) => encodeURIComponent(p)).join("/");
    return `${API_URL}/${encoded}`;
  }

  return `${API_URL}/uploads/${encodeURIComponent(cleanImage)}`;
};

const DealerCart = () => {
  const { cart, removeFromCart, clearCart, addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const decreaseQty = (item) => {
    const currentQty = Number(item.quantity || 1);
    if (currentQty > 1) {
      const targetId = item._id || item.id;
      const updatedCart = cart.map((cartItem) => {
        if (String(cartItem._id || cartItem.id) === String(targetId)) {
          return {
            ...cartItem,
            quantity: currentQty - 1,
          };
        }
        return cartItem;
      });
      localStorage.setItem("dealerCart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("storage"));
    }
  };

  const increaseQty = (item) => {
    addToCart(item);
  };

  const handleSendEnquiry = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/enquiry/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart: cart,
          orderId: `ORDER #${Math.random().toString(36).substring(2, 11)}`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Enquiry sent successfully with Excel sheet attachment!");
        clearCart(); // Clear cart after successful enquiry
      } else {
        alert(data.message || "Failed to send enquiry.");
      }
    } catch (error) {
      console.error("Enquiry submission error:", error);
      alert("Network error: Could not reach server.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e, item) => {
    console.error("CART IMAGE FAILED TO LOAD:", e.currentTarget.src);
    console.log("Raw item payload:", item);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* ================= HEADING ================= */}
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="text-[#b18152]" size={34} />
          <h1 className="text-3xl font-bold text-gray-800">
            My Enquiry Cart
          </h1>
        </div>

        {/* ================= EMPTY CART ================= */}
        {cart.length === 0 ? (
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
            {/* ================= CART ITEMS ================= */}
            <div className="space-y-6">
              {cart.map((item) => {
                const imageUrl = getProductImage(item);
                const itemId = item._id || item.id;

                return (
                  <div
                    key={itemId}
                    className="bg-white rounded-xl shadow-md p-5 flex flex-col md:flex-row items-center justify-between gap-6"
                  >
                    {/* PRODUCT */}
                    <div className="flex items-start gap-5 w-full">
                      {/* IMAGE */}
                      <div className="w-28 h-28 flex-shrink-0 rounded-lg border overflow-hidden bg-gray-100 flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={
                              item.name ||
                              item.productName ||
                              item.description ||
                              "Product"
                            }
                            className="w-full h-full object-cover"
                            onError={(e) => handleImageError(e, item)}
                          />
                        ) : (
                          <div className="text-gray-400 text-xs text-center p-2">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* DETAILS */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {item.name ||
                            item.productName ||
                            item.description ||
                            "Product"}
                        </h3>

                        <p className="text-gray-500 mt-1">
                          Product Code : {item.productCode || "-"}
                        </p>

                        {item.productId && (
                          <p className="text-sm text-gray-400 mt-1">
                            Product ID : {item.productId}
                          </p>
                        )}

                        {item.category && (
                          <p className="text-sm text-gray-400 mt-1">
                            Category : {item.category}
                          </p>
                        )}

                        {item.subCategory && (
                          <p className="text-sm text-gray-400 mt-1">
                            Sub Category :{" "}
                            {Array.isArray(item.subCategory)
                              ? item.subCategory.join(", ")
                              : item.subCategory}
                          </p>
                        )}

                        {/* COMMENT / QUESTION DISPLAY */}
                        {item.comment && (
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 flex items-start gap-2">
                            <MessageSquare
                              size={16}
                              className="text-amber-700 mt-0.5 flex-shrink-0"
                            />
                            <div>
                              <strong className="block text-xs uppercase tracking-wider text-amber-800 mb-0.5">
                                Question / Note:
                              </strong>
                              <p className="whitespace-pre-line">
                                {item.comment}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CONTROLS */}
                    <div className="flex items-center gap-6 self-center">
                      {/* QUANTITY */}
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => decreaseQty(item)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200"
                        >
                          -
                        </button>

                        <span className="px-5 min-w-[50px] text-center font-medium">
                          {item.quantity || 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => increaseQty(item)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(itemId)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove"
                      >
                        <Trash2 size={22} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ================= BOTTOM ================= */}
            <div className="mt-10 bg-white rounded-xl shadow p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-5">
                <div>
                  <h2 className="text-xl font-semibold">
                    Total Products : {cart.length}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Total Quantity :{" "}
                    {cart.reduce(
                      (total, item) =>
                        total + Number(item.quantity || 1),
                      0
                    )}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={clearCart}
                    disabled={loading}
                    className="border border-red-500 text-red-500 hover:bg-red-50 px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                  >
                    Clear Cart
                  </button>

                  <button
                    type="button"
                    onClick={handleSendEnquiry}
                    disabled={loading}
                    className={`bg-[#b18152] hover:bg-[#936740] text-white px-8 py-3 rounded-lg font-semibold transition ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Sending Excel..." : "Send Enquiry"}
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