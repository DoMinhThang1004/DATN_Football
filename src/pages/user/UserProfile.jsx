import React, { useState, useEffect } from "react";
import { Save, Edit3, User, Phone, Mail, CheckCircle, AlertCircle, X, Key, Loader2, AlertTriangle, Eye, EyeOff, Trash2, Info, Calendar, Shield, Hash, Activity, Cake } from "lucide-react";
import { useNavigate } from "react-router-dom";

//api url
const API_URL = "http://localhost:5000/api/users";

export default function UserProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("view"); 
  const [isLoading, setIsLoading] = useState(true);
  
  // state user và form
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
      full_name: "", phone: "", email: "", 
      gender: "Nam", birth_date: "", 
      password: "", confirmPassword: ""
  });
  
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // state cho modal xóa tài khoản
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  //ormat ngày cho input date (yyyy-mm--dd)
  const formatDateForInput = (isoString) => {
      if (!isoString) return "";
      const date = new Date(isoString);
      return date.toISOString().split('T')[0];
  };

  // format ngày hiển thị (dd-mm-yyyy)
  const formatDateDisplay = (isoString) => {
      if (!isoString) return "Chưa cập nhật";
      return new Date(isoString).toLocaleDateString('vi-VN');
  };

  // data
  useEffect(() => {
    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            const storedUserStr = localStorage.getItem("currentUser");
            if (!storedUserStr) return;
            
            const storedUser = JSON.parse(storedUserStr);
            const res = await fetch(`${API_URL}`); 
            const data = await res.json();
            const myUser = data.find(u => String(u.id) === String(storedUser.id));

            if (myUser) {
                setCurrentUser(myUser);
                setFormData({
                    full_name: myUser.full_name || "",
                    email: myUser.email || "",
                    phone: myUser.phone || "",
                    gender: myUser.gender || "Nam", 
                    birth_date: formatDateForInput(myUser.birth_date), 
                    password: "",
                    confirmPassword: ""
                });
            } else {
                setCurrentUser(storedUser);
            }
        } catch (error) {
            console.error("Lỗi tải thông tin:", error);
            showNotification("Không thể tải thông tin mới nhất", "error");
        } finally {
            setIsLoading(false);
        }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (activeTab === 'edit' && currentUser) {
        setFormData(prev => ({
            ...prev,
            full_name: currentUser.full_name,
            phone: currentUser.phone,
            gender: currentUser.gender || "Nam",
            birth_date: formatDateForInput(currentUser.birth_date),
            password: "",
            confirmPassword: ""
        }));
    }
  }, [activeTab, currentUser]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // câp nhật dl
  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.full_name.trim() || !formData.phone.trim()) {
        showNotification("Vui lòng không để trống thông tin!", "error"); return;
    }
    let payload = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,      
        birth_date: formData.birth_date, 
        role: currentUser.role,      
        status: currentUser.status,  
        avatar_url: currentUser.avatar_url
    };

    if (formData.password.trim() !== "") {
       if (formData.password.length < 6) { showNotification("Mật khẩu quá ngắn!", "error"); return; }
       if (formData.password !== formData.confirmPassword) { showNotification("Mật khẩu không khớp!", "error"); return; }
       payload.password = formData.password;
    }
    try {
        const res = await fetch(`${API_URL}/${currentUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showNotification("Cập nhật hồ sơ thành công!");
            const { password, ...userToStore } = { ...currentUser, ...payload };
            
            setCurrentUser(userToStore);
            localStorage.setItem("currentUser", JSON.stringify(userToStore));
            window.dispatchEvent(new Event("storage")); 
            
            setActiveTab("view");
        } else {
            showNotification("Lỗi khi cập nhật!", "error");
        }
    } catch (error) {
        showNotification("Lỗi kết nối Server!", "error");
    }
  };

  // xóa tk
  const handleDeleteAccount = async () => {
      try {
          const res = await fetch(`${API_URL}/${currentUser.id}`, { method: 'DELETE' });
          
          if (res.ok) {
              setShowDeleteModal(false);
              localStorage.removeItem("currentUser");
              localStorage.removeItem("token");
              window.dispatchEvent(new Event("storage"));
              
              // xóa tạm thời và cho tg đăng xuất
              showNotification("Tài khoản đã xóa tạm thời. Đang đăng xuất...", "success");

              setTimeout(() => {
                  navigate("/login");
              }, 3000); //3s chuyển ra login
              
          } else {
              showNotification("Lỗi khi xóa tài khoản", "error");
          }
      } catch (error) {
          showNotification("Lỗi kết nối!", "error");
        }
    };

    const getStatusInfo = (status) => {
        if (!status) return { text: "Không xác định", color: "bg-gray-100 text-gray-500", dot: "bg-gray-400" };
        const s = status.toUpperCase(); 
        if (s === 'ACTIVE') return { text: "Hoạt động", color: "bg-green-50 text-green-600 border-green-100", dot: "bg-green-500" };
        if (s === 'BANNED') return { text: "Bị khóa", color: "bg-red-50 text-red-600 border-red-100", dot: "bg-red-500" };
        if (s === 'DELETED') return { text: "Đã xóa", color: "bg-gray-100 text-gray-500 border-gray-200", dot: "bg-gray-400" };
        return { text: status, color: "bg-blue-50 text-blue-600 border-blue-100", dot: "bg-blue-500" };
    };

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={32}/></div>;
    if (!currentUser) return <div className="text-center p-20 text-gray-500 text-sm">Không tìm thấy thông tin người dùng.</div>;
    
    const statusInfo = getStatusInfo(currentUser.status);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[500px] max-w-4xl mx-auto">
        {notification && (
            <div className={`fixed top-24 right-4 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
                <span className="font-medium text-xs">{notification.message}</span>
            </div>
        )}
        <div className="flex border-b border-gray-100">
            <button 
                onClick={() => setActiveTab("view")}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center transition-all border-b-2 ${activeTab === 'view' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                <div className="flex items-center justify-center gap-2">
                    <User size={16}/> <span>Hồ sơ của tôi</span>
                </div>
            </button>
            <button 
                onClick={() => setActiveTab("edit")}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center transition-all border-b-2 ${activeTab === 'edit' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                <div className="flex items-center justify-center gap-2">
                    <Edit3 size={16}/> <span>Cập nhật thông tin</span>
                </div>
            </button>
        </div>

        <div className="p-6 md:p-8">
            {activeTab === "view" ? (
                <div className="animate-fadeIn space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100">
                        <div className="w-20 h-20 rounded-full border-4 border-white shadow-sm overflow-hidden bg-white flex items-center justify-center text-2xl font-bold text-gray-300 shrink-0">
                            {currentUser.avatar_url ? <img src={currentUser.avatar_url} className="w-full h-full object-cover"/> : currentUser.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">{currentUser.full_name}</h2>
                            <p className="text-blue-600 font-medium text-xs bg-blue-50 px-2.5 py-0.5 rounded-full inline-block border border-blue-100">
                                {currentUser.role === 'ADMIN' ? 'Quản trị viên' : currentUser.role === 'STAFF' ? 'Nhân viên' : 'Thành viên thân thiết'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><User size={12}/> Họ và tên</p>
                            <div className="text-gray-800 font-medium text-sm p-2.5 bg-gray-50/50 rounded-lg border border-gray-100">
                                {currentUser.full_name}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Phone size={12}/> Số điện thoại</p>
                            <div className="text-gray-800 font-medium text-sm p-2.5 bg-gray-50/50 rounded-lg border border-gray-100">
                                {currentUser.phone}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Mail size={12}/> Email</p>
                            <div className="text-gray-800 font-medium text-sm p-2.5 bg-gray-50/50 rounded-lg border border-gray-100">
                                {currentUser.email}
                            </div>
                        </div>
                        
                        {/* giới tính */}
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Info size={12}/> Giới tính</p>
                            <div className="flex items-center gap-2 text-gray-800 font-medium text-sm p-2.5 bg-gray-50/50 rounded-lg border border-gray-100">
                                <span className={`inline-flex w-5 h-5 rounded-full ${formData.gender === 'Nam' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'} text-[10px] items-center justify-center font-bold`}>
                                    {formData.gender === 'Nam' ? 'M' : formData.gender === 'Nữ' ? 'F' : 'O'}
                                </span> 
                                {currentUser.gender || "Chưa cập nhật"}
                            </div>
                        </div>
                        
                        {/* ns */}
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Cake size={12}/> Ngày sinh</p>
                            <div className="text-gray-800 font-medium text-sm p-2.5 bg-gray-50/50 rounded-lg border border-gray-100">
                                {formatDateDisplay(currentUser.birth_date)}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Hash size={12}/> Mã thành viên</p>
                            <div className="text-gray-500 font-mono font-medium text-xs p-2.5 bg-gray-50/50 rounded-lg border border-gray-100">
                                #{currentUser.id}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Calendar size={12}/> Ngày tham gia</p>
                            <div className="text-gray-800 font-medium text-sm p-2.5 bg-gray-50/50 rounded-lg border border-gray-100">
                                {currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString('vi-VN') : "N/A"}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Activity size={12}/> Trạng thái</p>
                            <div className="p-2.5 bg-gray-50/50 rounded-lg border border-gray-100">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border ${statusInfo.color}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></div>
                                    {statusInfo.text}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-fadeIn max-w-2xl mx-auto">
                    <form className="space-y-6" onSubmit={handleSave}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-600">Họ và tên</label>
                                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full p-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"/>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-600">Số điện thoại</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"/>
                            </div>

                            {/* nhập ngày sinh */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-600">Ngày sinh</label>
                                <input 
                                    type="date" 
                                    name="birth_date" 
                                    value={formData.birth_date} 
                                    onChange={handleChange} 
                                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"/>
                            </div>

                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-xs font-bold text-gray-600">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                                    <input type="email" value={formData.email} disabled className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed font-medium" />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-xs font-bold text-gray-600">Giới tính</label>
                                <div className="flex gap-4">
                                    {['Nam', 'Nữ', 'Khác'].map((g) => (
                                        <label key={g} className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm ${formData.gender === g ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                                            <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleChange} className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 accent-blue-600" /> 
                                            {g}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-md flex items-center justify-center"><Key size={14}/></div> Đổi mật khẩu</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-600">Mật khẩu mới</label>
                                    <div className="relative">
                                        <input type={showPass ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Nhập mật khẩu mới..." className="w-full p-2.5 text-sm pr-9 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-600">Xác nhận mật khẩu</label>
                                    <div className="relative">
                                        <input type={showConfirmPass ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu..." className="w-full p-2.5 text-sm pr-9 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                                        <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showConfirmPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 pb-2 border-b border-gray-100">
                            <button type="button" onClick={() => setActiveTab("view")} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition">Hủy bỏ</button>
                            <button type="submit" className="flex-1 px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition transform active:scale-95"><Save size={16}/> Lưu thay đổi</button>
                        </div>
                    </form>

                    {/* xóa tk */}
                    <div className="mt-8 bg-red-50/50 rounded-xl p-5 border border-red-100 relative">
                        <h3 className="text-red-700 font-bold text-sm mb-1 flex items-center gap-2"><AlertCircle size={16}/> Xóa tài khoản</h3>
                        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                            Tài khoản sẽ bị vô hiệu hóa và có thể khôi phục trong 30 ngày.
                        </p>
                        
                        {!showDeleteModal ? (
                            <button 
                                onClick={() => setShowDeleteModal(true)} 
                                className="px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-all shadow-sm flex items-center gap-2">
                                <Trash2 size={14}/> Xóa tài khoản
                            </button>
                        ) : (
                            <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm inline-block animate-fadeIn">
                                <p className="text-red-600 font-bold text-xs mb-2">Bạn có chắc chắn không?</p>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setShowDeleteModal(false)}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded hover:bg-gray-200"> Hủy
                                    </button>
                                    <button 
                                        onClick={handleDeleteAccount}
                                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 shadow-sm"> Xác nhận
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}