import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Load cart from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("dealerCart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart:", error);
      return [];
    }
  });

  // Keep localStorage updated
  useEffect(() => {
    try {
      localStorage.setItem("dealerCart", JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }, [cart]);

  /*
   * Add product to cart
   *
   * Usage:
   * addToCart(product)
   *
   * OR:
   * addToCart(product, question)
   */
  const addToCart = (product, question = "") => {
    if (!product || (!product._id && !product.id)) {
      console.error("Invalid product data:", product);
      return;
    }

    const productId = product._id || product.id;

    const trimmedQuestion =
      typeof question === "string" ? question.trim() : "";

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          String(item._id || item.id) === String(productId)
      );

      if (existingIndex !== -1) {
        return prevCart.map((item, index) => {
          if (index !== existingIndex) {
            return item;
          }

          return {
            ...item,
            quantity: Number(item.quantity || 1) + 1,

            // Update question only when a new question is provided
            ...(trimmedQuestion
              ? {
                  question: trimmedQuestion,
                }
              : {}),
          };
        });
      }

      return [
        ...prevCart,
        {
          ...product,
          quantity: 1,

          // Store question with the product
          question: trimmedQuestion,
        },
      ];
    });

    alert(
      `${product.productCode || product.name || "Product"} added to cart!`
    );
  };

  // Remove product
  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          String(item._id || item.id) !== String(productId)
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Increase quantity
  const increaseQty = (item) => {
    setCart((prevCart) => {
      const targetId = item._id || item.id;

      return prevCart.map((cartItem) => {
        const cartItemId = cartItem._id || cartItem.id;

        if (String(cartItemId) === String(targetId)) {
          return {
            ...cartItem,
            quantity: Number(cartItem.quantity || 1) + 1,
          };
        }

        return cartItem;
      });
    });
  };

  // Decrease quantity
  const decreaseQty = (item) => {
    setCart((prevCart) => {
      const targetId = item._id || item.id;

      return prevCart.map((cartItem) => {
        const cartItemId = cartItem._id || cartItem.id;

        if (String(cartItemId) === String(targetId)) {
          const currentQty = Number(cartItem.quantity || 1);

          return {
            ...cartItem,
            quantity: Math.max(1, currentQty - 1),
          };
        }

        return cartItem;
      });
    });
  };

  // Total quantity
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
        increaseQty,
        decreaseQty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);