import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Load initial cart state from localStorage using 'dealerCart'
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("dealerCart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart:", error);
      return [];
    }
  });

  // Keep localStorage updated whenever cart state changes
  useEffect(() => {
    try {
      localStorage.setItem("dealerCart", JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }, [cart]);

  // Unified Add to Cart
  const addToCart = (product) => {
    if (!product || (!product._id && !product.id)) {
      console.error("Invalid product data:", product);
      return;
    }

    const productId = product._id || product.id;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => String(item._id || item.id) === String(productId)
      );

      if (existingIndex !== -1) {
        return prevCart.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: Number(item.quantity || 1) + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });

    alert(`${product.productCode || product.name || "Product"} added to cart!`);
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => String(item._id || item.id) !== String(productId))
    );
  };

  const clearCart = () => setCart([]);

  // Calculate total item count across all products
  const totalCartCount = cart.reduce(
    (acc, item) => acc + Number(item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);