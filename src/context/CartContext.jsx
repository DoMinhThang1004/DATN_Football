import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // khởi tạo state từ localstorage
  // kiểm tra xem trong kho có hàng chưa
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem("shoppingCart");
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Lỗi đọc giỏ hàng:", error);
      return [];
    }
  });

  //tự động lưu vào localstorage khi giỏ hàng thay đổi
  useEffect(() => {
    localStorage.setItem("shoppingCart", JSON.stringify(cartItems));
  }, [cartItems]);

  // các hàm xử lý
  const addToCart = (newItems) => {
    setCartItems((prev) => {
      // kiểm tra trùng lặp 
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
    localStorage.removeItem("shoppingCart"); // xóa sạch kho
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