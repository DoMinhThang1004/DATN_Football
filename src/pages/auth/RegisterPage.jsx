import React, { useState } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// api đk
const REGISTER_API = `${API_BASE}/api/users/register`;

// url ảnh
const BANNER_IMG = `${API_BASE}/uploads/banner-2.jpg`;

export default function RegisterPage() {
  const navigate = useNavigate();

  // state
  const [formData, setFormData] = useState({
    fullName: "", 
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
  
  // state toast thông báo
  const [notification, setNotification] = useState(null);

  // hiển thị tb
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

    if (!formData.fullName.trim()) return setError("Vui lòng nhập họ và tên!");
    if (!formData.email.trim()) return setError("Vui lòng nhập email!");
    if (!formData.phone.trim()) return setError("Vui lòng nhập số điện thoại!");
    
    // cảnh báo sdt chuẩn 10 số
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
        // gọi api để đk
        const res = await fetch(REGISTER_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                // map dl cho khớp với data
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: 'USER', 
                status: 'ACTIVE'
            })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || "Đăng ký thất bại!");
        }

        // tb thành công
        showNotification("Đăng ký thành công! Đang chuyển hướng...", "success");
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
      <div className="min-h-screen flex w-full relative bg-gray-50">
        {notification && (
            <div className={`fixed top-24 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                <span className="font-medium">{notification.message}</span>
            </div>
        )}
        <div className="hidden lg:flex w-1/2 relative justify-center items-center overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105" 
                style={{ backgroundImage: `url('${BANNER_IMG}')` }}>

            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 via-black/50 to-black/30"></div>
            <div className="relative z-10 text-center px-12 animate-in slide-in-from-bottom-10 duration-700">
                <h2 className="text-5xl font-black text-white mb-6 leading-tight drop-shadow-lg">
                    GIA NHẬP CỘNG ĐỒNG <br/> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">BÓNG ĐÁ SỐ 1</span>
                </h2>
                <p className="text-gray-300 text-lg font-light max-w-md mx-auto">
                    Tạo tài khoản ngay để không bỏ lỡ bất kỳ trận cầu đỉnh cao nào. Ưu đãi độc quyền cho thành viên mới!
                </p>
            </div>
        </div>


        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 relative overflow-y-auto"> 
            
            <div className="w-full max-w-md border border-gray-200 rounded-3xl shadow-2xl p-8 md:p-10 my-10 lg:my-0 animate-in slide-in-from-right-10 duration-500">
                
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản</h2>
                    <p className="text-gray-500 text-sm">Điền thông tin để bắt đầu hành trình.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    
                    {/*trường 1 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Họ và tên</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"name="fullName"value={formData.fullName}
                                onChange={handleChange} placeholder="Nguyễn Văn A"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                        </div>
                    </div>

                    {/* trường 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email" name="email"
                                    value={formData.email} onChange={handleChange}
                                    placeholder="email@vidu.com"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Số điện thoại</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text" name="phone"
                                    value={formData.phone} onChange={handleChange}
                                    placeholder="09xxxx (10 số)"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                            </div>
                        </div>
                    </div>

                    {/* mk*/}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Mật khẩu</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}name="password"
                                value={formData.password} onChange={handleChange}
                                placeholder="Ít nhất 6 ký tự"
                                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                            <button
                                type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 bg-transparent border-none outline-none"
                                tabIndex="-1">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* nhập lại mk */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Nhập lại mật khẩu</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword" value={formData.confirmPassword}
                                onChange={handleChange} placeholder="Nhập lại mật khẩu trên"
                                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                            <button
                                type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 bg-transparent border-none outline-none"
                                tabIndex="-1" >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* điều khoản */}
                    <div className="flex items-start pt-2">
                        <input
                            id="terms" type="checkbox"
                            checked={agreed} onChange={(e) => {
                                setAgreed(e.target.checked);
                                if(e.target.checked) setError("");
                            }}
                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer accent-blue-600"/>
                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
                            Tôi đồng ý với <a href="faq" className="text-blue-600 hover:underline font-bold">Điều khoản sử dụng</a> và <a href="policy" className="text-blue-600 hover:underline font-bold">Chính sách bảo mật</a>.
                        </label>
                    </div>

                    {/* lỗi */}
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow-lg shadow-gray-400 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95">
                        {isLoading ? <Loader2 className="animate-spin"/> : <>Đăng ký tài khoản <ArrowRight size={18} /></>}
                    </button>
                </form>
            
                <div className="mt-8">
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold tracking-wider">Hoặc đăng ký với</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        {/* GG */}
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-bold text-gray-700 shadow-sm group">
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>

                        {/* FB*/}
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-bold text-gray-700 shadow-sm group">
                            <svg className="w-5 h-5 text-[#1877F2] fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </button>
                    </div>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Đã có tài khoản?{" "}
                        <Link to="/login" className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </UserLayout>
  );
}