import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import QuickViewModal from "../components/QuickViewModal";
import { useCart } from "../context/CartContext"; // 1. Import useCart context
import BASE_URL from "../../config/api";

const ExclusiveProducts = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { addToCart } = useCart(); // 2. Consume global addToCart method

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/catalogue/products`
      );

      const activeProducts = (res.data.products || []).filter(
        (item) => item.status === "Active"
      );

      setProducts(activeProducts);
    } catch (error) {
      console.log(error);
    }
  };

  const handleQuickView = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  // 3. Delegate cart updates directly to CartContext
  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-center mb-10">
          Catalogue Products
        </h1>

        {products.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">
            No Catalogue Products Available
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
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

export default ExclusiveProducts;