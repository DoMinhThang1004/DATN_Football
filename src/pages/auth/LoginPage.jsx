import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Facebook, CheckCircle, Smartphone, MessageSquare, X, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout.jsx";

// API URL (Backend thật)
const LOGIN_API = "http://localhost:5000/api/users/login";

export default function LoginPage() {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State Modal Quên mật khẩu
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotMethod, setForgotMethod] = useState("email");
  const [forgotInput, setForgotInput] = useState("");
  const [isForgotSubmitted, setIsForgotSubmitted] = useState(false);
  const [forgotError, setForgotError] = useState("");

  // --- HANDLERS ---
  const handleLoginChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (loginError) setLoginError(""); 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // 1. Validate cơ bản
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
        // 2. GỌI API ĐĂNG NHẬP THẬT
        const res = await fetch(LOGIN_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (!res.ok) {
            // Nếu lỗi (401, 404, 500...) -> Ném ra lỗi để catch bắt được
            throw new Error(data.message || "Đăng nhập thất bại");
        }

        // 3. XỬ LÝ THÀNH CÔNG
        // Lưu thông tin user vào localStorage
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        
        // Hiển thị modal thành công
        setIsLoginSuccess(true);
        
        // 4. PHÂN QUYỀN CHUYỂN HƯỚNG
        setTimeout(() => {
            if (data.user.role === 'ADMIN' || data.user.role === 'STAFF') {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }
        }, 1500);

    } catch (err) {
        // Hiển thị lỗi từ Server trả về (VD: Sai mật khẩu)
        setLoginError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  // --- XỬ LÝ QUÊN MẬT KHẨU (GIỮ NGUYÊN LOGIC CŨ VÌ CHƯA CÓ API NÀY) ---
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
    // TODO: Gọi API forgot-password thật sau này
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
        
        {/* Modal Quên Mật Khẩu */}
        {showForgotModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleForgotModal}></div>
                <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl relative z-10 animate-fadeIn">
                    <button onClick={toggleForgotModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"><X size={24} /></button>
                    <div className="text-center mb-6 mt-2">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
                                    <MessageSquare size={24}/> <span className="text-sm font-bold">SMS</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{forgotMethod === 'email' ? 'Địa chỉ Email' : 'Số điện thoại'}</label>
                                <input type={forgotMethod === 'email' ? "email" : "text"} value={forgotInput} onChange={(e) => setForgotInput(e.target.value)} placeholder={forgotMethod === 'email' ? "name@example.com" : "09xxxx (10 số)"} className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition ${forgotError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                                {forgotError && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><ArrowRight size={14} className="rotate-45"/> {forgotError}</p>}
                            </div>
                            <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200">Gửi mã xác nhận <ArrowRight size={18}/></button>
                        </form>
                    ) : (
                        <div className="space-y-4 animate-fadeIn">
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

        {/* Giao diện chính */}
        <div className="hidden lg:flex w-1/2 bg-gray-900 relative justify-center items-center overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://placehold.co/1000x1000/1e293b/FFFFFF?text=Football+Stadium')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-black/50"></div>
            <div className="relative z-10 text-center px-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-6 shadow-xl"><span className="text-4xl font-extrabold text-white">B</span></div>
                <h2 className="text-4xl font-extrabold text-white mb-4">Săn vé trận cầu <br/> <span className="text-red-500">Đỉnh Cao</span></h2>
            </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6 relative">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-xl p-8 md:p-10">
                <div className="mb-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
                    <p className="text-gray-500 text-sm">Chào mừng trở lại! Vui lòng nhập thông tin.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="email" name="email" value={formData.email} onChange={handleLoginChange} placeholder="example@gmail.com" className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleLoginChange} placeholder="••••••••" className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        <div className="flex justify-end mt-2">
                            <button type="button" onClick={() => setShowForgotModal(true)} className="text-sm font-medium text-blue-600 hover:underline">Quên mật khẩu?</button>
                        </div>
                    </div>

                    {loginError && <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center border border-red-100">{loginError}</div>}

                    <button type="submit" disabled={isLoading} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-70">
                        {isLoading ? <Loader2 className="animate-spin"/> : <>Đăng nhập <ArrowRight size={18}/></>}
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative flex py-2 items-center"><div className="flex-grow border-t border-gray-200"></div><span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Hoặc</span><div className="flex-grow border-t border-gray-200"></div></div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50 transition text-sm font-medium">Google</button>
                        <button className="flex items-center justify-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50 transition text-sm font-medium text-blue-600"><Facebook size={18}/> Facebook</button>
                    </div>
                    <p className="mt-6 text-center text-sm text-gray-600">Chưa có tài khoản? <Link to="/register" className="font-bold text-blue-600 hover:underline">Đăng ký ngay</Link></p>
                </div>
            </div>
        </div>

        {/* Modal Success */}
        {isLoginSuccess && (
            <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm animate-fadeIn">
                <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm w-full mx-4">
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