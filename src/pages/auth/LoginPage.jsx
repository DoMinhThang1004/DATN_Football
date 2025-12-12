import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, Smartphone, AlertCircle, X, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout.jsx";


const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const LOGIN_API = `${API_BASE}/api/users/login`;
const BANNER_IMG = `${API_BASE}/uploads/banner-1.jpg`;

export default function LoginPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //model quên mk
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotMethod, setForgotMethod] = useState("email");
  const [forgotInput, setForgotInput] = useState("");
  const [isForgotSubmitted, setIsForgotSubmitted] = useState(false);
  const [forgotError, setForgotError] = useState("");

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
        //api dn
        const res = await fetch(LOGIN_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Đăng nhập thất bại");
        }

        // xl lưu tt nd
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        
        //lưu vào token
        if (data.token) {
            localStorage.setItem("token", data.token);
        }
        window.dispatchEvent(new Event("storage"));
        
        setIsLoginSuccess(true);
        
        //chuyển
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

  //xl quên mk
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (forgotMethod === "email") {
        if (!forgotInput.trim()) { setForgotError("Vui lòng nhập email!"); return; }
        if (!/\S+@\S+\.\S+/.test(forgotInput)) { setForgotError("Email không hợp lệ!"); return; }
    }
    if (forgotMethod === "sms") {
        if (!forgotInput.trim()) { setForgotError("Vui lòng nhập số điện thoại!"); return; }
        if (!/^0[3|5|7|8|9][0-9]{8}$/.test(forgotInput)) { setForgotError("SĐT không hợp lệ (10 số)!"); return; }
    }
    setIsForgotSubmitted(true);
    setForgotError("");
  };

  const toggleForgotModal = () => {
    setShowForgotModal(!showForgotModal);
    setIsForgotSubmitted(false);
    setForgotInput("");
    setForgotError("");
  };

  return (
    <UserLayout>
      <div className="min-h-screen flex w-full relative bg-gray-50">
        <div className="hidden lg:flex w-1/2 relative justify-center items-center overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105" 
                style={{ backgroundImage: `url('${BANNER_IMG}')` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-black/50 to-black/30"></div>
            <div className="relative z-10 text-center px-12 animate-in slide-in-from-bottom-10 duration-700">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-red-600 rounded-full mb-8 shadow-2xl border-4 border-white/20 backdrop-blur-sm">
                    <span className="text-5xl font-black text-white">F</span>
                </div>
                <h2 className="text-5xl font-black text-white mb-6 leading-tight drop-shadow-lg">
                    SĂN VÉ TRẬN CẦU <br/> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">ĐỈNH CAO</span>
                </h2>
                <p className="text-gray-300 text-lg font-light max-w-md mx-auto">
                    Trải nghiệm không khí bóng đá sôi động ngay tại sân vận động. Đặt vé nhanh chóng, thanh toán an toàn.
                </p>
            </div>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 relative">
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
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-sm font-bold text-gray-700">Mật khẩu</label>
                            <Link to="/forgot-password" type="button" className="text-sm font-semibold text-blue-600 hover:underline">Quên mật khẩu?</Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input 
                                type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleLoginChange} 
                                placeholder="••••••••" 
                                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
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
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>

                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-bold text-gray-700 shadow-sm group">
                            <svg className="w-5 h-5 text-[#1877F2] fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Chưa có tài khoản? <Link to="/register" className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition">Đăng ký ngay</Link>
                    </p>
                </div>
            </div>
        </div>

        {showForgotModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleForgotModal}></div>
                <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl relative z-10 scale-100">
                    <button onClick={toggleForgotModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><X size={24} /></button>
                    <div className="text-center mb-6 mt-2">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            {isForgotSubmitted ? <CheckCircle size={32}/> : (forgotMethod === 'email' ? <Mail size={32}/> : <Smartphone size={32}/>)}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{isForgotSubmitted ? "Đã gửi mã xác nhận" : "Quên mật khẩu?"}</h2>
                        <p className="text-gray-500 text-sm mt-2">
                            {isForgotSubmitted ? `Mã xác nhận đã được gửi tới ${forgotMethod === 'email' ? 'email' : 'SĐT'} của bạn.` : "Chọn phương thức để nhận mã OTP đặt lại mật khẩu."}
                        </p>
                    </div>
                    {!isForgotSubmitted ? (
                        <form onSubmit={handleForgotSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div onClick={() => setForgotMethod("email")} className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${forgotMethod === 'email' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-600'}`}>
                                    <Mail size={24}/> <span className="text-sm font-bold">Email</span>
                                </div>
                                <div onClick={() => setForgotMethod("sms")} className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${forgotMethod === 'sms' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-600'}`}>
                                    <Smartphone size={24}/> <span className="text-sm font-bold">SMS</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{forgotMethod === 'email' ? 'Địa chỉ Email' : 'Số điện thoại'}</label>
                                <input type={forgotMethod === 'email' ? "email" : "text"} value={forgotInput} onChange={(e) => setForgotInput(e.target.value)} placeholder={forgotMethod === 'email' ? "name@example.com" : "09xxxx (10 số)"} className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition ${forgotError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                                {forgotError && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle size={14}/> {forgotError}</p>}
                            </div>
                            <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200">Gửi mã xác nhận <ArrowRight size={18}/></button>
                        </form>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200">
                                <p className="text-sm text-gray-500 mb-1">Gửi đến:</p>
                                <p className="text-lg font-bold text-gray-900">{forgotInput}</p>
                            </div>
                            <button onClick={toggleForgotModal} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition">Quay lại đăng nhập</button>
                            <p className="text-center text-sm text-gray-500 pt-2">Chưa nhận được? <button onClick={() => setIsForgotSubmitted(false)} className="text-blue-600 font-bold hover:underline">Gửi lại</button></p>
                        </div>
                    )}
                </div>
            </div>
        )}

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