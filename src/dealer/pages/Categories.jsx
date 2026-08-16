import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import QuickViewModal from "../components/QuickViewModal";
import { useCart } from "../context/CartContext"; // 1. Import useCart context
import BASE_URL from "../../config/api";

const Categories = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  const { addToCart } = useCart(); // 2. Consume global addToCart method

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/products`);

      const activeProducts = res.data.products.filter(
        (item) => item.status === "Active"
      );

      setProducts(activeProducts);

      if (activeProducts.length > 0) {
        const firstCategory = activeProducts[0].category;

        setSelectedCategory(firstCategory);

        const firstSub = activeProducts[0].subCategory?.[0] || "";

        setSelectedSubCategory(firstSub);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // All Categories
  const categories = [...new Set(products.map((p) => p.category))];

  // All Sub Categories
  const subCategories = [
    ...new Set(
      products
        .filter((p) => p.category === selectedCategory)
        .flatMap((p) => p.subCategory || [])
    )
  ];

  // Products according to selected category/subcategory
  const filteredProducts = products.filter(
    (product) =>
      product.category === selectedCategory &&
      product.subCategory?.includes(selectedSubCategory)
  );

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
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <div className="w-72 bg-white border-r shadow-sm min-h-screen p-6">
          <h2 className="text-2xl font-bold mb-8">Categories</h2>

          {categories.map((category) => (
            <div key={category} className="mb-6">
              <button
                onClick={() => {
                  setSelectedCategory(category);

                  const firstSub =
                    products.find((item) => item.category === category)
                      ?.subCategory?.[0] || "";

                  setSelectedSubCategory(firstSub);
                }}
                className={`w-full text-left text-lg font-semibold transition ${
                  selectedCategory === category
                    ? "text-[#b18152]"
                    : "text-gray-800"
                }`}
              >
                {category}
              </button>

              {selectedCategory === category && (
                <div className="ml-5 mt-3 space-y-2">
                  {subCategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubCategory(sub)}
                      className={`block text-left transition ${
                        selectedSubCategory === sub
                          ? "text-[#b18152] font-semibold"
                          : "text-gray-600 hover:text-[#b18152]"
                      }`}
                    >
                      • {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div className="flex-1 p-10">
          <h1 className="text-3xl font-bold mb-8">
            {selectedSubCategory || "Products"}
          </h1>

          {filteredProducts.length === 0 ? (
            <div className="text-gray-500 text-lg">
              No Products Available
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
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

export default Categories;