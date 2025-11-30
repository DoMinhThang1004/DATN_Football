import React, { useState, useEffect } from "react";
import { Save, Edit3, User, Phone, Mail, CheckCircle, AlertCircle, X, Key, Loader2, AlertTriangle } from "lucide-react";

const API_URL = "http://localhost:5000/api/users";

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("view"); 
  const [isLoading, setIsLoading] = useState(true);
  
  // --- STATE USER & FORM ---
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
      full_name: "", phone: "", email: "", gender: "Nam", // Thêm giới tính nếu muốn mở rộng DB sau này
      password: "", confirmPassword: ""
  });
  
  const [notification, setNotification] = useState(null);

  // --- HELPERS ---
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            // Lấy user từ localStorage (để lấy ID)
            const storedUser = JSON.parse(localStorage.getItem("currentUser"));
            if (!storedUser) return;

            // Gọi API lấy thông tin mới nhất từ DB
            const res = await fetch(`${API_URL}`); // API này đang trả về ALL users, nên cần lọc (hoặc viết API getById)
            // Trong thực tế nên dùng: fetch(`${API_URL}/${storedUser.id}`)
            
            const data = await res.json();
            // Tìm user hiện tại trong danh sách (Tạm thời)
            const myUser = data.find(u => u.id === storedUser.id);

            if (myUser) {
                setCurrentUser(myUser);
                setFormData({
                    full_name: myUser.full_name,
                    email: myUser.email,
                    phone: myUser.phone,
                    gender: "Nam", // DB chưa có cột này, để mặc định
                    password: "",
                    confirmPassword: ""
                });
            }
        } catch (error) {
            console.error("Lỗi tải thông tin:", error);
            showNotification("Không thể tải thông tin cá nhân", "error");
        } finally {
            setIsLoading(false);
        }
    };

    fetchUserData();
  }, []);

  // Reset form khi chuyển tab
  useEffect(() => {
    if (activeTab === 'edit' && currentUser) {
        setFormData(prev => ({
            ...prev,
            full_name: currentUser.full_name,
            phone: currentUser.phone,
            password: "",
            confirmPassword: ""
        }));
    }
  }, [activeTab, currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 2. UPDATE DATA ---
  const handleSave = async (e) => {
    e.preventDefault();

    // VALIDATE
    if (!formData.full_name.trim() || !formData.phone.trim()) {
        showNotification("Vui lòng không để trống Họ tên hoặc Số điện thoại!", "error");
        return;
    }
    if (!/^0\d{9}$/.test(formData.phone)) {
        showNotification("Số điện thoại không hợp lệ (10 số)!", "error");
        return;
    }

    // Logic đổi mật khẩu (nếu có nhập)
    let payload = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        role: currentUser.role,      // Giữ nguyên quyền
        status: currentUser.status,  // Giữ nguyên trạng thái
        avatar_url: currentUser.avatar_url
    };

    // Nếu nhập mật khẩu mới
    /* Lưu ý: API hiện tại chưa hỗ trợ đổi pass riêng, 
       nhưng nếu bạn muốn gửi password lên thì bỏ comment dòng dưới */
    // if (formData.password) {
    //    if (formData.password.length < 6) {
    //        showNotification("Mật khẩu mới phải từ 6 ký tự!", "error"); return;
    //    }
    //    if (formData.password !== formData.confirmPassword) {
    //        showNotification("Mật khẩu xác nhận không khớp!", "error"); return;
    //    }
    //    payload.password = formData.password;
    // }

    try {
        const res = await fetch(`${API_URL}/${currentUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showNotification("Cập nhật hồ sơ thành công!");
            
            // Cập nhật lại state và localStorage
            const updatedUser = { ...currentUser, ...payload };
            setCurrentUser(updatedUser);
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            
            // Báo cho Header cập nhật tên
            window.dispatchEvent(new Event("storage"));
            
            setActiveTab("view");
        } else {
            showNotification("Lỗi khi cập nhật!", "error");
        }
    } catch (error) {
        showNotification("Lỗi kết nối Server!", "error");
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600"/></div>;
  if (!currentUser) return <div className="text-center p-10">Không tìm thấy thông tin người dùng.</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[500px]">
        
        {/* --- TOAST NOTIFICATION --- */}
        {notification && (
            <div className={`fixed top-24 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                <span className="font-medium">{notification.message}</span>
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
                        <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white shadow-md overflow-hidden flex items-center justify-center text-3xl font-bold text-gray-400">
                            {currentUser.avatar_url ? <img src={currentUser.avatar_url} className="w-full h-full object-cover"/> : currentUser.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{currentUser.full_name}</h2>
                            <p className="text-gray-500 text-sm">Thành viên thân thiết</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                        <div className="border-b border-gray-100 pb-4">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Họ và tên</p>
                            <div className="flex items-center gap-3 text-gray-900 font-medium text-lg">
                                <User size={20} className="text-blue-600"/> {currentUser.full_name}
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
                                    {formData.gender === 'Nam' ? 'M' : formData.gender === 'Nữ' ? 'F' : 'O'}
                                </span> 
                                {formData.gender}
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                            <input 
                                type="text" name="full_name"
                                value={formData.full_name} onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                            <input 
                                type="text" name="phone"
                                value={formData.phone} onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email (Chỉ xem)</label>
                            <input type="email" value={formData.email} disabled className="w-full p-3 border border-gray-200 bg-gray-100 text-gray-500 rounded-xl cursor-not-allowed" />
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><AlertCircle size={10}/> Email không thể thay đổi.</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Giới tính</label>
                            <div className="flex gap-6 p-3 border border-gray-300 rounded-xl">
                                {['Nam', 'Nữ', 'Khác'].map((g) => (
                                    <label key={g} className="flex items-center cursor-pointer gap-2">
                                        <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleChange} className="w-5 h-5 text-blue-600 focus:ring-blue-500" /> 
                                        {g}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* PHẦN ĐỔI MẬT KHẨU (UI ONLY - VÌ API CHƯA HỖ TRỢ) */}
                    <div className="pt-6 border-t border-gray-100 opacity-50 pointer-events-none" title="Tính năng đang phát triển">
                        <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2"><Key size={18}/> Đổi mật khẩu (Sắp ra mắt)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Mật khẩu mới</label>
                                <input type="password" name="password" disabled className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50" />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Xác nhận</label>
                                <input type="password" name="confirmPassword" disabled className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50" />
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