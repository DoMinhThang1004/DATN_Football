import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// api đăng nhập
const LOGIN_API = `${API_BASE}/api/users/login`;

// url ản
const BANNER_IMG = `${API_BASE}/uploads/banner-1.jpg`;


export default function LoginPage() {
  const navigate = useNavigate();
  
  // state
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (loginError) setLoginError(""); 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password) {
        setLoginError("Vui lòng nhập đầy đủ email và mật khẩu!");
        return;
    }
    if (formData.password.length < 6) {
        setLoginError("Mật khẩu phải có ít nhất 6 ký tự!");
        return;
    }

    setIsLoading(true);
    try {
        const res = await fetch(LOGIN_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Đăng nhập thất bại");
        }

        // lưu ttuser vào localStorage
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        
        setIsLoginSuccess(true);
        setTimeout(() => {
            if (data.user.role === 'ADMIN' || data.user.role === 'STAFF') {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }
        }, 1500);

    } catch (err) {
        setLoginError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="min-h-screen flex w-full relative bg-gray-50">
        <div className="hidden lg:flex w-1/2 relative justify-center items-center overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105" 
                style={{ backgroundImage: `url('${BANNER_IMG}')` }}>

            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-black/50 to-black/30"></div>
            <div className="relative z-10 text-center px-12 animate-in slide-in-from-bottom-10 duration-700">
                <h2 className="text-5xl font-black text-white mb-6 leading-tight drop-shadow-lg">
                    SĂN VÉ TRẬN CẦU <br/> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">ĐỈNH CAO</span>
                </h2>
                <p className="text-gray-300 text-lg font-light max-w-md mx-auto">
                    Trải nghiệm không khí bóng đá sôi động ngay tại sân vận động. Đặt vé nhanh chóng, thanh toán an toàn.
                </p>
            </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6 relative">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl p-8 md:p-10 animate-in slide-in-from-right-10 duration-500">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại! 👋</h2>
                    <p className="text-gray-500 text-sm">Vui lòng nhập thông tin để đăng nhập.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input 
                                type="email" name="email" value={formData.email} onChange={handleLoginChange} 
                                placeholder="example@gmail.com" 
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-sm font-bold text-gray-700">Mật khẩu</label>
                            
                            {/* chuyển tới đổi pass */}
                            <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:underline">
                                Quên mật khẩu?
                            </Link>

                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input 
                                type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleLoginChange} 
                                placeholder="••••••••" 
                                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {loginError && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={16} /> {loginError}
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95">
                        {isLoading ? <Loader2 className="animate-spin"/> : <>Đăng nhập <ArrowRight size={18}/></>}
                    </button>
                </form>

                <div className="mt-8">
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold tracking-wider">Hoặc tiếp tục với</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-bold text-gray-700 shadow-sm group">
                             <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google"/>
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-bold text-gray-700 shadow-sm group">
                             <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="facebook"/>
                            Facebook
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Chưa có tài khoản? <Link to="/register" className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition">Đăng ký ngay</Link>
                    </p>
                </div>
            </div>
        </div>

        {isLoginSuccess && (
            <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm w-full mx-4 transform scale-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce"><CheckCircle size={40} className="text-green-600" /></div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập thành công!</h3>
                    <p className="text-gray-500 mb-4">Hệ thống đang chuyển hướng...</p>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden"><div className="h-full bg-green-500 animate-[loading_1.5s_ease-in-out_forwards] w-0"></div></div>
                    <style>{`@keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }`}</style>
                </div>
            </div>
        )}
      </div>
    </UserLayout>
  );
}