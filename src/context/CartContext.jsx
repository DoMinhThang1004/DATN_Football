import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // 1. KHỞI TẠO STATE TỪ LOCALSTORAGE (Quan trọng)
  // Thay vì useState([]), ta kiểm tra xem trong kho có hàng chưa
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem("shoppingCart");
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Lỗi đọc giỏ hàng:", error);
      return [];
    }
  });

  // 2. TỰ ĐỘNG LƯU VÀO LOCALSTORAGE KHI GIỎ HÀNG THAY ĐỔI
  useEffect(() => {
    localStorage.setItem("shoppingCart", JSON.stringify(cartItems));
  }, [cartItems]);

  // --- CÁC HÀM XỬ LÝ ---

  const addToCart = (newItems) => {
    setCartItems((prev) => {
      // Kiểm tra trùng lặp (nếu cần)
      // Ở đây mình gộp mảng cũ + mới
      // Nếu muốn chặn trùng ghế thì có thể filter trước
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
    localStorage.removeItem("shoppingCart"); // Xóa sạch trong kho luôn
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};