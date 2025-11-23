import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      {/* Icon hoặc Ảnh minh họa */}
      <div className="relative mb-8">
        <div className="w-40 h-40 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-9xl">⚽</span>
        </div>
        <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border border-gray-200">
            <span className="text-4xl">❌</span>
        </div>
      </div>

      <h1 className="text-6xl font-black text-gray-900 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Lạc mất bóng rồi!</h2>
      <p className="text-gray-500 max-w-md mb-8">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị dời đi chỗ khác. 
        Giống như một cú sút penalty lên trời vậy.
      </p>

      <div className="flex gap-4">
        <button onClick={() => window.history.back()} className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 flex items-center gap-2 transition">
            <ArrowLeft size={18}/> Quay lại
        </button>
        <Link to="/home" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 flex items-center gap-2 transition shadow-lg shadow-red-200">
            <Home size={18}/> Về trang chủ
        </Link>
      </div>
    </div>
  );
}