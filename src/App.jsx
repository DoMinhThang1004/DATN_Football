import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router/index.jsx";
import { CartProvider } from "./context/CartContext.jsx";

export default function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
}
