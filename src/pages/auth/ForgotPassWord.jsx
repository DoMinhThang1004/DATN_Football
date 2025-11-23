import React, { useState, useEffect } from "react";
import { Mail, ArrowLeft, CheckCircle, ArrowRight, Smartphone, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout.jsx"; 

export default function ForgotPassword() {
  const [method, setMethod] = useState("email"); 
  const [inputValue, setInputValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setInputValue("");
    setError("");
  }, [method]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 1. Validate Email
    if (method === "email") {
        if (!inputValue.trim()) {
            setError("Vui lòng nhập địa chỉ email!");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(inputValue)) {
            setError("Email không hợp lệ!");
            return;
        }
    }

    // 2. Validate SMS (Cập nhật Regex chuẩn Việt Nam)
    if (method === "sms") {
        if (!inputValue.trim()) {
            setError("Vui lòng nhập số điện thoại!");
            return;
        }
        // Regex: Bắt đầu bằng 0, theo sau là 3,5,7,8,9 và 8 số bất kỳ
        const phoneRegex = /^0[3|5|7|8|9][0-9]{8}$/; 
        
        if (!phoneRegex.test(inputValue)) {
            setError("SĐT không hợp lệ (phải là 10 số, đầu 03, 05, 07, 08, 09)!");
            return;
        }
    }

    setIsSubmitted(true);
    setError("");
  };

  return (
    <UserLayout>
        {/* --- CONTAINER BAO NGOÀI (Tạo hiệu ứng nền mờ) --- */}
        <div className="min-h-[calc(100vh-80px)] relative flex items-center justify-center overflow-hidden">
            
            {/* 1. Ảnh nền (Giống trang Login) */}
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://placehold.co/1000x1000/1e293b/FFFFFF?text=Football+Stadium')" }}
            ></div>

            {/* 2. Lớp phủ màu đen mờ (Backdrop Blur) */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            {/* --- CARD FORM (Nổi lên trên) --- */}
            <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl border border-gray-100 relative z-10 mx-4 animate-fadeIn">
                
                <Link to="/login" className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft size={20}/> Quay lại
                </Link>

                <div className="text-center mb-8 mt-6">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        {isSubmitted ? (
                            <CheckCircle size={32}/>
                        ) : (
                            method === 'email' ? <Mail size={32}/> : <Smartphone size={32}/>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isSubmitted ? "Đã gửi mã xác nhận" : "Quên mật khẩu?"}
                    </h2>
                    <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
                        {isSubmitted 
                            ? `Chúng tôi đã gửi mã khôi phục đến ${method === 'email' ? 'email' : 'số điện thoại'} của bạn.` 
                            : "Chọn phương thức để nhận mã OTP đặt lại mật khẩu."}
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Chọn phương thức */}
                        <div className="grid grid-cols-2 gap-4">
                            <div 
                                onClick={() => setMethod("email")}
                                className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${method === 'email' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-600'}`}
                            >
                                <Mail size={24}/>
                                <span className="text-sm font-bold">Email</span>
                            </div>
                            <div 
                                onClick={() => setMethod("sms")}
                                className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${method === 'sms' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-600'}`}
                            >
                                <MessageSquare size={24}/>
                                <span className="text-sm font-bold">SMS</span>
                            </div>
                        </div>

                        {/* Input */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                {method === 'email' ? 'Địa chỉ Email' : 'Số điện thoại'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    {method === 'email' ? <Mail className="h-5 w-5 text-gray-400" /> : <Smartphone className="h-5 w-5 text-gray-400" />}
                                </div>
                                <input 
                                    type={method === 'email' ? "email" : "text"}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={method === 'email' ? "name@example.com" : "09xxxx (10 số)"}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm mt-2 animate-pulse flex items-center gap-1"><ArrowRight size={14} className="rotate-45"/> {error}</p>}
                        </div>

                        <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                            Gửi mã xác nhận <ArrowRight size={18}/>
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200">
                            <p className="text-sm text-gray-500 mb-1">Đã gửi đến:</p>
                            <p className="text-lg font-bold text-gray-900">{inputValue}</p>
                        </div>

                        {method === 'email' ? (
                            <button onClick={() => window.location.href = 'mailto:'} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition">
                                Mở hộp thư Email
                            </button>
                        ) : (
                            <div className="text-center p-4 bg-blue-50 rounded-xl text-blue-700 text-sm">
                                Vui lòng kiểm tra tin nhắn SMS trên điện thoại.
                            </div>
                        )}
                        
                        <p className="text-center text-sm text-gray-500 pt-2">
                            Chưa nhận được? <button onClick={() => setIsSubmitted(false)} className="text-blue-600 font-bold hover:underline">Gửi lại</button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    </UserLayout>
  );
}