import React, { useState } from "react";
import { MapPin, Phone, Mail, Send, Facebook, Instagram, Youtube, AlertCircle, Check } from "lucide-react";
import { Link } from "react-router-dom"; // Thêm import Link
import UserLayout from "../../layouts/UserLayout.jsx";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", issue: "Tư vấn mua vé", message: "" });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập họ và tên.";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ.";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại.";
    if (!formData.message.trim()) newErrors.message = "Vui lòng nhập nội dung.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) setShowSuccess(true);
  };

  const handleClosePopup = () => {
    setShowSuccess(false);
    setFormData({ name: "", email: "", phone: "", issue: "Tư vấn mua vé", message: "" });
  };

  return (
    <UserLayout>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Liên hệ với chúng tôi</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Chúng tôi luôn sẵn sàng lắng nghe bạn.</p>
            
            {/* --- ĐOẠN THÊM MỚI --- */}
            <p className="text-gray-500 mt-2 text-sm">
                Bạn có thắc mắc? Hãy thử xem qua trang{" "}
                <Link to="/faq" className="text-blue-600 font-bold hover:underline">Câu hỏi thường gặp (FAQ)</Link>
                {" "}hoặc{" "}
                <Link to="/policy" className="text-blue-600 font-bold hover:underline">Chính sách</Link>
                {" "}trước khi gửi tin nhắn nhé!
            </p>
            {/* ------------------- */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Thông tin liên hệ */}
            <div className="bg-blue-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-500 opacity-20 rounded-tr-full"></div>
                <div>
                    <h3 className="text-xl font-bold mb-6 border-b border-blue-700 pb-4">Thông tin liên hệ</h3>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-white/20 p-3 rounded-lg"><MapPin size={20} /></div>
                            <div><p className="font-bold text-blue-200 text-xs uppercase mb-1">Địa chỉ</p><p className="text-sm">Số 1 Phạm Hùng, Hà Nội</p></div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-white/20 p-3 rounded-lg"><Phone size={20} /></div>
                            <div><p className="font-bold text-blue-200 text-xs uppercase mb-1">Hotline</p><p className="font-bold text-xl">1900 123 456</p></div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-white/20 p-3 rounded-lg"><Mail size={20} /></div>
                            <div><p className="font-bold text-blue-200 text-xs uppercase mb-1">Email</p><p className="text-sm">hotro@bongdaticket.vn</p></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Gửi tin nhắn</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên <span className="text-red-500">*</span></label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nhập tên" className={`w-full px-4 py-3 rounded-lg bg-gray-50 border outline-none ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`}/>
                            {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                            <input type="text" name="email" value={formData.email} onChange={handleChange} placeholder="example@gmail.com" className={`w-full px-4 py-3 rounded-lg bg-gray-50 border outline-none ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`}/>
                            {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.email}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">SĐT <span className="text-red-500">*</span></label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="09xx..." className={`w-full px-4 py-3 rounded-lg bg-gray-50 border outline-none ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`}/>
                             {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.phone}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Vấn đề</label>
                            <select name="issue" value={formData.issue} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none cursor-pointer">
                                <option>Tư vấn mua vé</option><option>Báo lỗi thanh toán</option><option>Khiếu nại</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung <span className="text-red-500">*</span></label>
                        <textarea rows="4" name="message" value={formData.message} onChange={handleChange} placeholder="Chi tiết..." className={`w-full px-4 py-3 rounded-lg bg-gray-50 border outline-none ${errors.message ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`}></textarea>
                         {errors.message && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.message}</p>}
                    </div>
                    <button type="submit" className="bg-red-600 text-black px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition flex items-center gap-2 shadow-lg transform active:scale-95"><Send size={18}/> Gửi ngay</button>
                </form>
            </div>
          </div>
        </div>

        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all scale-100">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"><Check size={40} className="text-green-600"/></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Gửi thành công!</h3>
              <p className="text-gray-600 mb-8">Cảm ơn <strong>{formData.name}</strong>, chúng tôi sẽ phản hồi sớm nhất.</p>
              <button onClick={handleClosePopup} className="w-full bg-green-600 text-black py-3.5 rounded-xl font-bold hover:bg-green-700 transition shadow-lg">Đóng</button>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}