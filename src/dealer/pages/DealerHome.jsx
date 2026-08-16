import { useEffect, useState } from "react";
import axios from "axios";

import ProductCard from "../components/ProductCard";
import QuickViewModal from "../components/QuickViewModal";
import { useCart } from "../context/CartContext";
import BASE_URL from "../../config/api";

const DealerHome = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hook into the global Cart Context
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/api/products`);

      const allProducts = res.data.products || res.data || [];

      const activeProducts = allProducts.filter(
        (product) => product.status === "Active"
      );

      setProducts(activeProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // QUICK VIEW
  // ===============================

  const handleQuickView = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  // ===============================
  // ADD TO CART
  // ===============================

  const handleAddToCart = (product) => {
    try {
      // Call Context method which updates state AND localStorage
      addToCart(product);

      // Close modal if open
      setSelectedProduct(null);
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Unable to add product to cart");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800">
            Ready Stock Products
          </h1>

          <p className="text-gray-500 mt-3">
            Browse our currently available products
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center mt-20">
            <p className="text-xl text-gray-500">Loading Products...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && products.length === 0 && (
          <div className="text-center mt-20">
            <h2 className="text-2xl font-semibold text-gray-700">
              No Products Available
            </h2>

            <p className="text-gray-500 mt-2">
              There are currently no active ready-stock products.
            </p>
          </div>
        )}

        {/* Products */}
        {!loading && products.length > 0 && (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              gap-8
            "
          >
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={handleQuickView}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick View */}
      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={closeModal}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

export default DealerHome;