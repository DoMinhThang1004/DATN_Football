import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router/index.jsx"; 

// 1. Import CartProvider (Kiểm tra đường dẫn đúng với máy bạn)
import { CartProvider } from "./context/CartContext.jsx"; 

function App() {
  return (
    // 2. Bọc CartProvider ra ngoài RouterProvider
    // Như vậy tất cả các trang (Home, MatchDetail, Header...) đều dùng được giỏ hàng
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
}

export default App;