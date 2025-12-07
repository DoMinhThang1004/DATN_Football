import React from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

export default function CheckoutSteps({ currentStep = 1 }) {
  // tính độ dài thanh màu đỏ chạy 3 bước
  const progressWidth = currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%";

  return (
    <div className="max-w-3xl mx-auto mb-10 px-4">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-300 z-0"></div>
        <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-red-600 z-0 transition-all duration-700 ease-in-out" >
        </div>
        <Link to="/cart" className="relative z-10 flex flex-col items-center bg-gray-50 px-2">
             {/* vòng tròn số */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 border-2 
                ${currentStep >= 1 ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                {currentStep > 1 ? <Check size={20} /> : "1"}
            </div>
            <span className={`text-sm font-bold mt-2 ${currentStep >= 1 ? 'text-red-600' : 'text-gray-400'}`}>Giỏ hàng</span>
        </Link>

        {/* bước 2*/}
        <div className="relative z-10 flex flex-col items-center bg-gray-50 px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 border-2 
                ${currentStep >= 2 ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                {currentStep > 2 ? <Check size={20} /> : "2"}
            </div>
            <span className={`text-sm font-bold mt-2 ${currentStep >= 2 ? 'text-red-600' : 'text-gray-400'}`}>Thanh toán</span>
        </div>

        {/* bước 3*/}
        <div className="relative z-10 flex flex-col items-center bg-gray-50 px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 border-2 
                ${currentStep >= 3 ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                {currentStep === 3 ? <Check size={20} /> : "3"}
            </div>
            <span className={`text-sm font-bold mt-2 ${currentStep >= 3 ? 'text-red-600' : 'text-gray-400'}`}>Hoàn tất</span>
        </div>
      </div>
    </div>
  );
}