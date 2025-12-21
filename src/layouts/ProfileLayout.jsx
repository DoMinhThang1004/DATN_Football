import React, { useState, useRef, useEffect } from "react";
import { User, Ticket, MapPin, LogOut, Camera, Image as ImageIcon, X, Upload, Save, Loader2, AlertTriangle, CheckCircle, Edit3 } from "lucide-react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import ScrollToTop from "../components/common/ScrollToTop";


const API_HOST = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = `${API_HOST}/api`;
const UPLOAD_URL = `${API_HOST}/api/upload`;
const USERS_API = `${API_HOST}/api/users`;

export default function UserProfile() {
    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [tempFile, setTempFile] = useState(null);       
    const [tempPreview, setTempPreview] = useState(null); 
    const [isUploading, setIsUploading] = useState(false);

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    //lấy token
    const getAuthToken = () => {
        let token = localStorage.getItem("token");
        if (!token) {
            const userStr = localStorage.getItem("currentUser");
            if (userStr) {
                const userObj = JSON.parse(userStr);
                token = userObj.token || userObj.accessToken;
            }
        }
        return token;
    };

    // load dữ liệu
    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            try {
                const storedUserStr = localStorage.getItem("currentUser");
                if (!storedUserStr) {
                    navigate("/login");
                    return;
                }
                const storedUser = JSON.parse(storedUserStr);
                setUser(storedUser);
            } catch (error) {
                console.error("Lỗi tải thông tin:", error);
                showNotification("Lỗi dữ liệu", "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, [navigate]);

    //cập nhật user
    useEffect(() => {
        const handleStorageChange = () => {
            const storedUserStr = localStorage.getItem("currentUser");
            if (storedUserStr) {
                setUser(JSON.parse(storedUserStr));
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const menuItems = [
        { path: "/profile", label: "Hồ sơ cá nhân", icon: <User size={18} /> },
        { path: "/profile/tickets", label: "Vé của tôi", icon: <Ticket size={18} /> },
        { path: "/profile/address", label: "Sổ địa chỉ", icon: <MapPin size={18} /> },
    ];

    //xl avartar
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
    //lưu avatar
    const handleSaveAvatar = async () => {
        if (!tempFile || !user) return;
        const token = getAuthToken();
        if (!token) {
            showNotification("Phiên đăng nhập hết hạn!", "error");
            navigate("/login");
            return;
        }

        setIsUploading(true);
        try {
            //upload ảnh
            const formData = new FormData();
            formData.append("file", tempFile);
            const uploadRes = await fetch(UPLOAD_URL, { 
                method: "POST", 
                body: formData,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!uploadRes.ok) throw new Error("Lỗi upload ảnh"); 
            const uploadResult = await uploadRes.json();
            const newAvatarUrl = uploadResult.url;
            //cập nhật data
            const updatedUserData = { ...user, avatar_url: newAvatarUrl };
            const updateRes = await fetch(`${USERS_API}/${user.id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(updatedUserData)
            });
            if (updateRes.status === 401) throw new Error("Phiên đăng nhập hết hạn");
            if (!updateRes.ok) throw new Error("Lỗi cập nhật thông tin");

            //lưu
            localStorage.setItem("currentUser", JSON.stringify(updatedUserData));
            setUser(updatedUserData);
            window.dispatchEvent(new Event("storage")); 
            showNotification("Cập nhật ảnh đại diện thành công!");
            setIsAvatarModalOpen(false);

        } catch (error) {
            console.error(error);
            if (error.message === "Phiên đăng nhập hết hạn") {
                 navigate("/login");
            } else {
                 showNotification("Có lỗi xảy ra! Vui lòng thử lại.", "error");
            }
        } finally {
            setIsUploading(false);
        }
    };
    const handleLogoutClick = () => {
        setShowLogoutModal(true); 
    };
    const confirmLogout = () => {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("storage"));
        navigate("/login");
    };

    useEffect(() => {
        return () => {
            if (tempPreview) URL.revokeObjectURL(tempPreview);
        };
    }, [tempPreview]);

    if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

    return (
        <UserLayout>
               <ScrollToTop/>
            <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-white -m-4">
                {notification && (
                    <div className={`fixed top-24 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                        {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                        <span className="font-medium text-sm">{notification.message}</span>
                    </div>
                )}
                {isAvatarModalOpen && (
                    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                            <div className="flex justify-between items-center p-4 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Cập nhật ảnh đại diện</h3>
                                <button onClick={() => setIsAvatarModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"><X size={20}/></button>
                            </div>
                            <div className="p-6 flex flex-col items-center">
                                <div className="relative w-32 h-32 mb-6 group">
                                    <div className="w-full h-full rounded-full border-4 border-gray-100 shadow-inner overflow-hidden bg-gray-50">
                                        <img 
                                            src={tempPreview || user.avatar_url || "https://via.placeholder.com/150"} 
                                            alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <div onClick={() => fileInputRef.current.click()} className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 flex items-center justify-center cursor-pointer transition-all">
                                        <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24}/>
                                    </div>
                                </div>
                                {tempFile ? (
                                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium mb-6 max-w-full truncate">
                                        <ImageIcon size={16}/>
                                        <span className="truncate">{tempFile.name}</span>
                                        <button onClick={() => fileInputRef.current.click()} className="text-blue-400 hover:text-blue-700 ml-2 underline text-xs whitespace-nowrap">Đổi ảnh</button>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm mb-6 text-center">Nhấn vào ảnh để tải lên</p>
                                )}
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    {!tempFile ? (
                                        <button onClick={() => fileInputRef.current.click()} className="col-span-2 w-full py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2 transition text-sm">
                                            <Upload size={16}/> Chọn ảnh từ máy
                                        </button>
                                    ) : (
                                        <>
                                            <button onClick={() => setIsAvatarModalOpen(false)} className="py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition text-sm">Hủy bỏ</button>
                                            <button onClick={handleSaveAvatar} disabled={isUploading} className="py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition shadow-lg shadow-blue-200 disabled:opacity-50 text-sm">
                                                {isUploading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Lưu ảnh
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {showLogoutModal && (
                    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
                            <button onClick={() => setShowLogoutModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><LogOut size={28} className="ml-1"/></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng xuất?</h3>
                            <p className="text-gray-500 text-sm mb-6">Bạn có chắc chắn muốn đăng xuất?</p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm">Hủy bỏ</button>
                                <button onClick={confirmLogout} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md transition-colors text-sm">Đăng xuất</button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0">
                    <div className="p-6 flex flex-col items-center border-b border-slate-200">
                        <div className="relative w-20 h-20 mb-3 group">
                            <div className="w-full h-full bg-white rounded-full border-4 border-white shadow-sm flex items-center justify-center text-2xl font-bold text-gray-400 overflow-hidden">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{user.full_name?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <button onClick={openAvatarModal} className="absolute bottom-0 right-0 bg-white text-gray-700 p-1.5 rounded-full hover:text-blue-600 hover:shadow-md transition border border-gray-200 cursor-pointer shadow-sm">
                                <Camera size={14}/>
                            </button>
                        </div>
                        <h3 className="font-bold text-gray-800 text-base text-center leading-tight line-clamp-1 px-2">{user.full_name}</h3>
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-full px-4">{user.email}</p>
                        <div className="mt-2 px-2.5 py-0.5 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full uppercase tracking-wide shadow-sm">
                            {user.role === 'ADMIN' ? 'Quản trị viên' : user.role === 'STAFF' ? 'Nhân viên' : 'Thành viên'}
                        </div>
                    </div>
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tài khoản</p>
                        {menuItems.map((item) => (
                            <Link
                                key={item.path} to={item.path}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-medium text-sm ${
                                    location.pathname === item.path
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                    : "text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm" }`}>
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="p-3 border-t border-slate-200">
                        <button 
                            onClick={handleLogoutClick}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all font-bold text-sm group">
                            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform"/> 
                            Đăng xuất
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-6 md:p-8 overflow-x-hidden bg-white">
                    <div className="max-w-4xl mx-auto h-full">
                        <Outlet /> 
                    </div>
                </div>

            </div>
        </UserLayout>
    );
}