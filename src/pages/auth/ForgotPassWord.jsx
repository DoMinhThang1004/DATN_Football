import React, { useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle, Loader2, AlertTriangle, Mail, Key, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout.jsx";
import emailjs from '@emailjs/browser';

// gọi biến môi trường
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const RESET_API_DIRECT = "http://localhost:5000/api/users/reset-password-direct";

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  // state từng bước: 1. nhập email \ 2. nhập otp \ 3. tb thành công
  const [step, setStep] = useState(1); 
  
  const [email, setEmail] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null); 
  const [inputOtp, setInputOtp] = useState(""); 
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // xử lý mail gửi otp
  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError("Vui lòng nhập email!");
    
    setIsLoading(true);
    setError("");
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode); 
    console.log("Mã OTP (Debug):", otpCode); //debug coi lỗi k

    const templateParams = {
        email: email, 
        otp: otpCode, 
        to_name: email.split('@')[0], 
    };

    try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        setStep(2); // qua bước nhập otp
    } catch (err) {
        console.error("Lỗi EmailJS:", err);
        setError("Gửi mail thất bại. Vui lòng thử lại sau.");
    } finally {
        setIsLoading(false);
    }
  };

  // xử lý đổi mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (inputOtp !== generatedOtp) return setError("Mã xác nhận không chính xác!");
    if (newPassword.length < 6) return setError("Mật khẩu mới phải từ 6 ký tự!");
    if (newPassword !== confirmPassword) return setError("Mật khẩu nhập lại không khớp!");

    setIsLoading(true);
    setError("");

    try {
        const res = await fetch(RESET_API_DIRECT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPassword })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Đổi mật khẩu thất bại");

        // chuyển sang bước 3
        setStep(3); 
        
        // đợi 3s mới chuyển trang
        setTimeout(() => {
            navigate("/login");
        }, 3000);

    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
                {step !== 3 && (
                    <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {step === 1 ? "Khôi phục tài khoản" : "Đặt lại mật khẩu"}
                            </h2>
                            <p className="text-gray-500 text-xs mt-1">Bước {step} / 2</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                            {step === 1 ? <Mail size={20}/> : <Lock size={20}/>}
                        </div>
                    </div>
                )}

                <div className="p-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 mb-5 flex items-start gap-3 animate-pulse">
                            <AlertTriangle size={18} className="mt-0.5 shrink-0"/> <span>{error}</span>
                        </div>
                    )}

                    {/* logic 3 bước*/}
                    
                    {/* b1 nhập email */}
                    {step === 1 && (
                        <form onSubmit={handleSendEmail} className="space-y-5">
                            <p className="text-gray-600 text-sm mb-2">Nhập email để nhận mã xác thực:</p>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" required />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex justify-center items-center gap-2">
                                {isLoading ? <Loader2 className="animate-spin"/> : <>Gửi mã xác nhận <ArrowRight size={18}/></>}
                            </button>
                            <div className="text-center mt-4">
                                <Link to="/login" className="text-sm text-gray-500 hover:text-blue-600 font-medium">Quay lại đăng nhập</Link>
                            </div>
                        </form>
                    )}

                    {/*b2 nhập otp đổi mk */}
                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-5 animate-in fade-in slide-in-from-right-4">
                            <p className="text-gray-600 text-sm">Mã OTP đã gửi tới <span className="font-bold">{email}</span></p>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Mã OTP (6 số)</label>
                                <input type="text" value={inputOtp} onChange={(e) => setInputOtp(e.target.value)} placeholder="XXXXXX" className="w-full p-3.5 border border-gray-200 rounded-xl text-center tracking-[0.5em] font-bold text-xl outline-none focus:border-blue-500" maxLength={6} required />
                            </div>
                            <div className="grid gap-4">
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mật khẩu mới" className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500" required />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu" className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500" required />
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all flex justify-center items-center gap-2">
                                {isLoading ? <Loader2 className="animate-spin"/> : "Xác nhận đổi mật khẩu"}
                            </button>
                            <div className="text-center mt-4">
                                <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-blue-600">Gửi lại mã?</button>
                            </div>
                        </form>
                    )}

                    {/* b3 thành công*/}
                    {step === 3 && (
                        <div className="text-center py-8 animate-in zoom-in duration-300">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={48} strokeWidth={3} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thành công!</h2>
                            <p className="text-gray-500 mb-8">Mật khẩu của bạn đã được cập nhật.<br/>Đang chuyển hướng về trang đăng nhập...</p>
                            
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-6">
                                <div className="h-full bg-green-500 animate-[loading_3s_ease-in-out_forwards] w-0"></div>
                            </div>
                            <style>{`@keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }`}</style>

                            <Link to="/login" className="inline-block px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition">
                                Đăng nhập ngay
                            </Link>
                        </div>
                    )}
                </div>
            </div>
      </div>
    </UserLayout>
  );
}