import React, { useState, useRef, useEffect } from "react";
import { User, Ticket, MapPin, LogOut, Camera, Image as ImageIcon, X, Upload, Check, Save, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import UserLayout from "./UserLayout.jsx"; 

// api url
const API_BASE = "http://localhost:5000/api";
const UPLOAD_URL = "http://localhost:5000/api/upload";

export default function ProfileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // state dl user
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // state ui
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [tempFile, setTempFile] = useState(null);       
  const [tempPreview, setTempPreview] = useState(null); 
  const [isUploading, setIsUploading] = useState(false);
  
  // state model đăng xuất và tb
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // lấy thông tin user
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    } else {
        navigate("/login");
    }
    setIsLoading(false);
  }, [navigate]);

  const menuItems = [
    { path: "/profile", label: "Hồ sơ của tôi", icon: <User size={20} /> },
    { path: "/profile/tickets", label: "Vé đã mua", icon: <Ticket size={20} /> },
    { path: "/profile/address", label: "Sổ địa chỉ", icon: <MapPin size={20} /> },
  ];

  //hàm xử lý
  const openAvatarModal = () => {
    setTempFile(null);
    setTempPreview(null); 
    setIsAvatarModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempFile(file);
      const objectUrl = URL.createObjectURL(file);
      setTempPreview(objectUrl);
    }
  };

  const handleSaveAvatar = async () => {
    if (!tempFile || !user) return;
    setIsUploading(true);
    try {
        // úp load ảnh
        const formData = new FormData();
        formData.append("file", tempFile);

        const uploadRes = await fetch(UPLOAD_URL, { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Lỗi upload ảnh");
        
        const uploadResult = await uploadRes.json();
        const newAvatarUrl = uploadResult.url;

        //cập nhật db
        const updatedUserData = { 
            ...user, 
            avatar_url: newAvatarUrl, 
            full_name: user.full_name,
            email: user.email,
            phone: user.phone
        };

        const updateRes = await fetch(`${API_BASE}/users/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUserData)
        });

        if (!updateRes.ok) throw new Error("Lỗi cập nhật thông tin");

        //cập nhật localstorage
        localStorage.setItem("currentUser", JSON.stringify(updatedUserData));
        setUser(updatedUserData);
        window.dispatchEvent(new Event("storage"));
        showNotification("Cập nhật ảnh đại diện thành công!");
        setIsAvatarModalOpen(false);

    } catch (error) {
        console.error(error);
        showNotification("Có lỗi xảy ra! Vui lòng thử lại.", "error");
    } finally {
        setIsUploading(false);
    }
  };

  //xử lý đăng xuất
  const handleLogoutClick = () => {
      setShowLogoutModal(true); 
  };

  const confirmLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  // xóa
  useEffect(() => {
    return () => {
      if (tempPreview) URL.revokeObjectURL(tempPreview);
    };
  }, [tempPreview]);

  if (isLoading || !user) return null;

  return (
    <UserLayout>
      <div className="bg-gray-50 min-h-screen py-8 relative">
        {notification && (
            <div className={`fixed top-24 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                <span className="font-medium">{notification.message}</span>
            </div>
        )}

        <div className="container mx-auto px-4">
            {isAvatarModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Cập nhật ảnh đại diện</h3>
                            <button onClick={() => setIsAvatarModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"><X size={20}/></button>
                        </div>

                        <div className="p-6 flex flex-col items-center">
                            <div className="relative w-40 h-40 mb-6 group">
                                <div className="w-full h-full rounded-full border-4 border-gray-100 shadow-inner overflow-hidden bg-gray-50">
                                    <img 
                                        src={tempPreview || user.avatar_url || "https://via.placeholder.com/150"} 
                                        alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center cursor-pointer transition-all">
                                    <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32}/>
                                </div>
                            </div>

                            {tempFile ? (
                                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium mb-6 max-w-full truncate">
                                    <ImageIcon size={16}/>
                                    <span className="truncate">{tempFile.name}</span>
                                    <button onClick={() => fileInputRef.current.click()} className="text-blue-400 hover:text-blue-700 ml-2 underline text-xs whitespace-nowrap">Đổi ảnh</button>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm mb-6 text-center">
                                    Nhấn vào ảnh hoặc nút bên dưới để tải ảnh mới lên. <br/> Hỗ trợ JPG, PNG.
                                </p>
                            )}

                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            <div className="grid grid-cols-2 gap-3 w-full">
                                {!tempFile ? (
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="col-span-2 w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2 transition">
                                        <Upload size={18}/> Chọn ảnh từ máy
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => setIsAvatarModalOpen(false)} className="py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">Hủy bỏ</button>
                                        <button onClick={handleSaveAvatar} disabled={isUploading} className="py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition shadow-lg shadow-blue-200 disabled:opacity-50">
                                            {isUploading ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Lưu ảnh
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/*  model xn đăng xuất*/}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center transform transition-all scale-100 shadow-2xl">
                        <button onClick={() => setShowLogoutModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><LogOut size={28} className="ml-1"/></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng xuất?</h3>
                        <p className="text-gray-500 text-sm mb-6">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">Hủy bỏ</button>
                            <button onClick={confirmLogout} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors">Đăng xuất</button>
                        </div>
                    </div>
                </div>
            )}

          <div className="flex flex-col md:flex-row gap-6">
            {/* side trái*/}
            <div className="w-full md:w-1/4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                <div className="p-6 text-center border-b border-gray-100 bg-gradient-to-b from-blue-50 to-white">
                    <div className="relative w-28 h-28 mx-auto mb-3">
                        <div className="w-full h-full bg-gray-200 rounded-full border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-gray-400 overflow-hidden">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span>{user.full_name?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <button onClick={openAvatarModal} className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full hover:bg-blue-600 transition border-2 border-white shadow-sm cursor-pointer" title="Cập nhật ảnh đại diện">
                            <Camera size={16}/>
                        </button>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{user.full_name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                
                <nav className="p-3 space-y-1">
                  {menuItems.map((item) => (
                    <Link
                          key={item.path}to={item.path}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                        location.pathname === item.path
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                      }`}>
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                  
                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <button 
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium">
                        <LogOut size={20} /> Đăng xuất
                    </button>
                  </div>
                </nav>
              </div>
            </div>
            <div className="w-full md:w-3/4">
                <Outlet /> 
            </div>

          </div>
        </div>
      </div>
    </UserLayout>
  );
}