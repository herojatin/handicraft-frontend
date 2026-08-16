import { Eye, ShoppingCart } from "lucide-react";
import BASE_URL from "../../config/api";

const API_URL = `${BASE_URL}`;

const getImageUrl = (image) => {
  if (!image) return null;

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `${API_URL}/uploads/${encodeURIComponent(
    image.replace(/^\/+/, "")
  )}`;
};

const ProductCard = ({
  product,
  onQuickView,
  onAddToCart,
}) => {
  const images =
    product.images?.length
      ? product.images
      : product.image
      ? [product.image]
      : [];

  const imageUrl = getImageUrl(
    images[0]
  );

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">

      <div className="relative overflow-hidden">

        {imageUrl ? (

          <img
            src={imageUrl}
            alt={
              product.description ||
              "Product"
            }
            className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              console.error(
                "Product image failed:",
                e.currentTarget.src
              );
            }}
          />

        ) : (

          <div className="w-full h-72 bg-gray-100 flex items-center justify-center text-gray-400">
            No Image
          </div>

        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-center items-center gap-4">

          <button
            type="button"
            onClick={() =>
              onQuickView(product)
            }
            className="bg-white text-gray-800 px-5 py-2 rounded-full flex items-center gap-2 hover:bg-[#b18152] hover:text-white transition"
          >
            <Eye size={18} />
            Quick View
          </button>

          <button
            type="button"
            onClick={() =>
              onAddToCart(product)
            }
            className="bg-[#b18152] text-white px-5 py-2 rounded-full flex items-center gap-2 hover:bg-[#936740] transition"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>

        </div>

      </div>

      <div className="p-4">

        <h3 className="font-semibold text-lg">
          {product.description ||
            "Product"}
        </h3>

        <p className="text-gray-500 text-sm">
          Code :{" "}
          {product.productCode || "-"}
        </p>

        <p className="text-sm text-[#b18152] mt-2">
          {product.category ||
            "Uncategorized"}
        </p>

      </div>

    </div>
  );
};

export default ProductCard;