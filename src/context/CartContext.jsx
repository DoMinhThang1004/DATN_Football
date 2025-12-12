import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  //tạo state từ localstorage
  // check xem kho có hàng chưa
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem("shoppingCart");
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Lỗi đọc giỏ hàng:", error);
      return [];
    }
  });

  // lưu vào localstorage khi giỏ hàng thay đổi
  useEffect(() => {
    localStorage.setItem("shoppingCart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (newItems) => {
    setCartItems((prev) => {
      //check trùng lặp 
      const uniqueItems = newItems.filter(
        (newItem) => !prev.some((item) => item.id === newItem.id)
      );
      return [...prev, ...uniqueItems];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("shoppingCart");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
      }} >
      {children}
    </CartContext.Provider>
  );
};