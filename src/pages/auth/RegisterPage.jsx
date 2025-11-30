import React, { useState } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout.jsx";

// API URL
const REGISTER_API = "http://localhost:5000/api/users/register";

export default function RegisterPage() {
  const navigate = useNavigate();

  // --- STATE ---
  const [formData, setFormData] = useState({
    fullName: "", // Frontend dùng camelCase
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State cho thông báo (Toast)
  const [notification, setNotification] = useState(null);

  // Helper hiển thị thông báo
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); 
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // --- 1. VALIDATION ---
    if (!formData.fullName.trim()) return setError("Vui lòng nhập họ và tên!");
    if (!formData.email.trim()) return setError("Vui lòng nhập email!");
    if (!formData.phone.trim()) return setError("Vui lòng nhập số điện thoại!");
    
    // Validate SĐT (10 số, bắt đầu bằng 0)
    if (!/^0\d{9}$/.test(formData.phone)) {
        return setError("Số điện thoại không hợp lệ (10 số)!");
    }

    if (!formData.password) return setError("Vui lòng nhập mật khẩu!");
    if (formData.password.length < 6) return setError("Mật khẩu phải có ít nhất 6 ký tự!");
    
    if (formData.password !== formData.confirmPassword) {
      return setError("Mật khẩu nhập lại không khớp!");
    }

    if (!agreed) {
      return setError("Bạn cần đồng ý với điều khoản để đăng ký.");
    }

    setIsLoading(true);

    try {
        // --- 2. GỌI API ĐĂNG KÝ ---
        const res = await fetch(REGISTER_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                // Map dữ liệu cho khớp với Backend (snake_case)
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: 'USER', // Mặc định là khách hàng
                status: 'ACTIVE'
            })
        });

        const data = await res.json();

        if (!res.ok) {
            // Nếu lỗi (ví dụ Email trùng)
            throw new Error(data.message || "Đăng ký thất bại!");
        }

        // --- 3. THÀNH CÔNG ---
        showNotification("Đăng ký thành công! Đang chuyển hướng...", "success");
        
        // Chuyển qua trang login sau 1.5s
        setTimeout(() => navigate("/login"), 1500);

    } catch (err) {
        setError(err.message);
        showNotification(err.message, "error");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="min-h-screen flex w-full relative">
        
        {/* --- TOAST NOTIFICATION (Góc phải trên) --- */}
        {notification && (
            <div className={`fixed top-24 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                <span className="font-medium">{notification.message}</span>
            </div>
        )}
      
        {/* ================= CỘT TRÁI: BRANDING ================= */}
        <div className="hidden lg:flex w-1/2 bg-gray-900 relative justify-center items-center overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://placehold.co/1000x1000/0f172a/FFFFFF?text=Fans+Cheering')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 to-black/50"></div>
            <div className="relative z-10 text-center px-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-xl">
                    <span className="text-4xl font-extrabold text-red-600">B</span>
                </div>
                <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
                    Gia nhập cộng đồng <br/> <span className="text-yellow-400">Bóng Đá Số 1</span>
                </h2>
                <p className="text-gray-200 text-lg max-w-md mx-auto leading-relaxed">
                    Tạo tài khoản ngay để không bỏ lỡ bất kỳ trận cầu đỉnh cao nào. Ưu đãi độc quyền cho thành viên mới!
                </p>
            </div>
        </div>

        {/* ================= CỘT PHẢI: FORM ĐĂNG KÝ ================= */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6 relative overflow-y-auto"> 
            
            <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium z-10">
                <ArrowLeft size={18} /> Trang chủ
            </Link>

            <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-xl p-8 relative my-10 lg:my-0">
                
                <div className="mb-2 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản</h2>
                    <p className="text-gray-500 text-sm">Điền thông tin để bắt đầu hành trình.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    
                    {/* Họ tên */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Nguyễn Văn A"
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Email & SĐT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@vidu.com"
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none sm:text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="09xxxx (10 số)"
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mật khẩu */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Ít nhất 6 ký tự"
                                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none sm:text-sm"
                            />
                            <button
                                type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 bg-transparent border-none outline-none"
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Nhập lại Mật khẩu */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Nhập lại mật khẩu trên"
                                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none sm:text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 bg-transparent border-none outline-none"
                                tabIndex="-1"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Điều khoản */}
                    <div className="flex items-start pt-2">
                        <input
                            id="terms"
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => {
                                setAgreed(e.target.checked);
                                if(e.target.checked) setError("");
                            }}
                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
                            Tôi đồng ý với <a href="#" className="text-blue-600 hover:underline font-medium">Điều khoản sử dụng</a> và <a href="#" className="text-blue-600 hover:underline font-medium">Chính sách bảo mật</a>.
                        </label>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <p className="text-red-500 text-sm font-medium bg-red-50 px-3 py-2 rounded-md border border-red-100 w-full text-center animate-pulse">
                            {error}
                        </p>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="animate-spin"/> : <>Đăng ký tài khoản <ArrowRight size={18} /></>}
                    </button>
                </form>
                
                <p className="mt-6 text-center text-sm text-gray-600">
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="font-bold text-blue-600 hover:underline transition-colors">
                        Đăng nhập ngay
                    </Link>
                </p>
            </div>
        </div>
      </div>
    </UserLayout>
  );
}