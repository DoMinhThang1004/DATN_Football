import React, { useState, useEffect } from "react";
import { Save, Edit3, User, Phone, Mail, CheckCircle, AlertCircle, X, Key } from "lucide-react";

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("view"); 
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Dữ liệu người dùng gốc
  const [currentUser, setCurrentUser] = useState({
    name: "Minh Thắng Đỗ",
    phone: "0912345678",
    email: "thang123@gmail.com",
    gender: "Nam",
  });

  // State Form Thông tin
  const [formData, setFormData] = useState({ ...currentUser });
  
  // State Form Mật khẩu (Tách riêng để dễ quản lý)
  const [passwordData, setPasswordData] = useState({ newPass: "", confirmPass: "" });
  
  const [error, setError] = useState("");

  // Reset khi chuyển tab hoặc mở lại
  useEffect(() => {
    if (activeTab === 'edit') {
        setFormData({ ...currentUser });
        setPasswordData({ newPass: "", confirmPass: "" }); // Reset mật khẩu
        setError("");
    }
  }, [activeTab, currentUser]);

  // Handle change thông tin
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // Handle change mật khẩu
  const handlePassChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // Xử lý lưu
  const handleSave = (e) => {
    e.preventDefault();

    // --- 1. VALIDATE THÔNG TIN CƠ BẢN ---
    if (!formData.name.trim() || !formData.phone.trim()) {
        setError("Vui lòng không để trống Họ tên hoặc Số điện thoại!");
        return;
    }

    // Validate SĐT: Phải là số và đủ 10 ký tự
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
        setError("Số điện thoại không hợp lệ (phải bao gồm 10 chữ số)!");
        return;
    }

    // --- 2. VALIDATE MẬT KHẨU (Nếu người dùng có nhập) ---
    let isPasswordChanged = false;
    if (passwordData.newPass.length > 0) {
        if (passwordData.newPass.length < 6) {
            setError("Mật khẩu mới phải có ít nhất 6 ký tự!");
            return;
        }
        if (passwordData.newPass !== passwordData.confirmPass) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }
        isPasswordChanged = true; // Đánh dấu là có đổi mật khẩu
    }

    // --- 3. KIỂM TRA CÓ THAY ĐỔI GÌ KHÔNG ---
    const isInfoChanged = (
        formData.name !== currentUser.name ||
        formData.phone !== currentUser.phone ||
        formData.gender !== currentUser.gender
    );

    // Nếu KHÔNG đổi thông tin VÀ KHÔNG đổi mật khẩu -> Báo lỗi
    if (!isInfoChanged && !isPasswordChanged) {
        setError("Bạn chưa thay đổi thông tin nào so với ban đầu!");
        return;
    }

    // --- 4. THÀNH CÔNG ---
    // Cập nhật dữ liệu (Giả lập)
    setCurrentUser({ ...formData });
    
    // Nếu có đổi pass thì log ra (hoặc gọi API đổi pass riêng)
    if (isPasswordChanged) {
        console.log("Đổi mật khẩu thành:", passwordData.newPass);
    }

    setShowSuccessModal(true);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setActiveTab("view");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[500px]">
        
        {/* --- MODAL THÀNH CÔNG --- */}
        {showSuccessModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center relative">
                    <button onClick={closeSuccessModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <CheckCircle size={32}/>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Cập nhật thành công!</h3>
                    <p className="text-gray-600 mb-6 text-sm">Thông tin hồ sơ của bạn đã được lưu lại.</p>
                    <button onClick={closeSuccessModal} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">
                        Về trang hồ sơ
                    </button>
                </div>
            </div>
        )}

        {/* --- TABS HEADER --- */}
        <div className="border-b border-gray-200 flex">
            <button 
                onClick={() => setActiveTab("view")}
                className={`flex-1 py-4 text-sm font-bold text-center transition-all border-b-2 ${activeTab === 'view' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <User size={18} className="inline mr-2 mb-1"/> Hồ sơ của tôi
            </button>
            <button 
                onClick={() => setActiveTab("edit")}
                className={`flex-1 py-4 text-sm font-bold text-center transition-all border-b-2 ${activeTab === 'edit' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <Edit3 size={18} className="inline mr-2 mb-1"/> Cập nhật thông tin
            </button>
        </div>

        <div className="p-6 md:p-8">
            
            {/* === TAB 1: VIEW MODE === */}
            {activeTab === "view" ? (
                <div className="animate-fadeIn space-y-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white shadow-md overflow-hidden">
                            <img src="https://placehold.co/150" alt="Avatar" className="w-full h-full object-cover"/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{currentUser.name}</h2>
                            <p className="text-gray-500 text-sm">Thành viên thân thiết</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                        <div className="border-b border-gray-100 pb-4">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Họ và tên</p>
                            <div className="flex items-center gap-3 text-gray-900 font-medium text-lg">
                                <User size={20} className="text-blue-600"/> {currentUser.name}
                            </div>
                        </div>
                        <div className="border-b border-gray-100 pb-4">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Số điện thoại</p>
                            <div className="flex items-center gap-3 text-gray-900 font-medium text-lg">
                                <Phone size={20} className="text-blue-600"/> {currentUser.phone}
                            </div>
                        </div>
                        <div className="border-b border-gray-100 pb-4">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Email</p>
                            <div className="flex items-center gap-3 text-gray-900 font-medium text-lg">
                                <Mail size={20} className="text-blue-600"/> {currentUser.email}
                            </div>
                        </div>
                        <div className="border-b border-gray-100 pb-4">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Giới tính</p>
                            <div className="flex items-center gap-3 text-gray-900 font-medium text-lg">
                                <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">
                                    {currentUser.gender === 'Nam' ? 'M' : currentUser.gender === 'Nữ' ? 'F' : 'O'}
                                </span> 
                                {currentUser.gender}
                            </div>
                        </div>
                    </div>

                    <button onClick={() => setActiveTab("edit")} className="mt-4 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition flex items-center gap-2">
                        <Edit3 size={18}/> Chỉnh sửa hồ sơ
                    </button>
                </div>
            ) : (
                
                /* === TAB 2: EDIT MODE === */
                <form className="space-y-6 animate-fadeIn max-w-2xl mx-auto" onSubmit={handleSave}>
                    
                    {/* ERROR ALERT */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium animate-pulse">
                            <AlertCircle size={18} className="flex-shrink-0"/> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name} 
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                            <input 
                                type="text" 
                                name="phone"
                                value={formData.phone} 
                                onChange={handleChange}
                                placeholder="09xxxx (10 số)"
                                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email (Chỉ xem)</label>
                            <input 
                                type="email" 
                                value={formData.email} 
                                disabled 
                                className="w-full p-3 border border-gray-200 bg-gray-100 text-gray-500 rounded-xl cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><AlertCircle size={10}/> Email không thể thay đổi vì lý do bảo mật.</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Giới tính</label>
                            <div className="flex gap-6 p-3 border border-gray-300 rounded-xl">
                                {['Nam', 'Nữ', 'Khác'].map((g) => (
                                    <label key={g} className="flex items-center cursor-pointer gap-2">
                                        <input 
                                            type="radio" 
                                            name="gender" 
                                            value={g}
                                            checked={formData.gender === g}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                        /> 
                                        {g}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2"><Key size={18}/> Đổi mật khẩu (Không bắt buộc)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Mật khẩu mới</label>
                                <input 
                                    type="password" 
                                    name="newPass"
                                    value={passwordData.newPass}
                                    onChange={handlePassChange}
                                    placeholder="Ít nhất 6 ký tự" 
                                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 transition"
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Xác nhận</label>
                                <input 
                                    type="password" 
                                    name="confirmPass"
                                    value={passwordData.confirmPass}
                                    onChange={handlePassChange}
                                    placeholder="Nhập lại mật khẩu mới" 
                                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 transition"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button type="button" onClick={() => setActiveTab("view")} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">
                            Hủy bỏ
                        </button>
                        <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition">
                            <Save size={18}/> Lưu thay đổi
                        </button>
                    </div>
                </form>
            )}
        </div>
    </div>
  );
}