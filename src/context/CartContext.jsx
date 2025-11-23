import React, { createContext, useState, useContext } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Thêm vé vào giỏ
  const addToCart = (items) => {
    // items là một mảng các vé (selectedSeats)
    setCartItems((prev) => [...prev, ...items]);
  };

  // Xóa vé khỏi giỏ
  const removeFromCart = (seatId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== seatId));
  };

  // Xóa sạch giỏ
  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};