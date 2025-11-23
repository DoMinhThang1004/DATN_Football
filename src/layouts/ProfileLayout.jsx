import React, { useState, useRef, useEffect } from "react";
import { User, Ticket, MapPin, LogOut, Camera, Image as ImageIcon, X, Upload, Check, Save } from "lucide-react";
import { Link, useLocation, Outlet } from "react-router-dom";
import UserLayout from "./UserLayout.jsx"; 

export default function ProfileLayout() {
  const location = useLocation();
  const fileInputRef = useRef(null);

  // --- STATE DỮ LIỆU USER ---
  const [userData, setUserData] = useState({
    name: "Minh Thắng Đỗ",
    email: "thang123@gmail.com",
    avatar: "https://placehold.co/150" // Ảnh gốc
  });

  // --- STATE CHO MODAL AVATAR ---
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [tempFile, setTempFile] = useState(null);       // File đang chọn (chưa lưu)
  const [tempPreview, setTempPreview] = useState(null); // Ảnh preview (chưa lưu)

  const menuItems = [
    { path: "/profile", label: "Hồ sơ của tôi", icon: <User size={20} /> },
    { path: "/profile/tickets", label: "Vé đã mua", icon: <Ticket size={20} /> },
    { path: "/profile/address", label: "Sổ địa chỉ", icon: <MapPin size={20} /> },
  ];

  // --- HÀM XỬ LÝ ---

  // 1. Mở Modal
  const openAvatarModal = () => {
    setTempFile(null);
    setTempPreview(null); // Reset trạng thái tạm
    setIsAvatarModalOpen(true);
  };

  // 2. Chọn file từ máy tính
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempFile(file);
      // Tạo URL preview
      const objectUrl = URL.createObjectURL(file);
      setTempPreview(objectUrl);
    }
  };

  // 3. Lưu thay đổi (Cập nhật vào State chính)
  const handleSaveAvatar = () => {
    if (tempPreview) {
        setUserData({ ...userData, avatar: tempPreview });
        // Tại đây bạn sẽ gọi API Upload file lên server
        // const formData = new FormData(); formData.append('avatar', tempFile); ...
    }
    setIsAvatarModalOpen(false);
  };

  // Cleanup URL preview để tránh memory leak
  useEffect(() => {
    return () => {
      if (tempPreview) URL.revokeObjectURL(tempPreview);
    };
  }, [tempPreview]);

  return (
    <UserLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
            
            {/* --- MODAL CẬP NHẬT AVATAR (MỚI) --- */}
            {isAvatarModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                        {/* Header Modal */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Cập nhật ảnh đại diện</h3>
                            <button onClick={() => setIsAvatarModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"><X size={20}/></button>
                        </div>

                        <div className="p-6 flex flex-col items-center">
                            {/* Khu vực hiển thị ảnh */}
                            <div className="relative w-40 h-40 mb-6 group">
                                <div className="w-full h-full rounded-full border-4 border-gray-100 shadow-inner overflow-hidden bg-gray-50">
                                    {/* Logic: Nếu có ảnh tạm (đang chọn) thì hiện ảnh tạm, không thì hiện ảnh gốc */}
                                    <img 
                                        src={tempPreview || userData.avatar} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                {/* Overlay khi hover (Gợi ý thay đổi) */}
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center cursor-pointer transition-all"
                                >
                                    <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32}/>
                                </div>
                            </div>

                            {/* Hiển thị tên file nếu đã chọn */}
                            {tempFile ? (
                                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium mb-6 max-w-full truncate">
                                    <ImageIcon size={16}/>
                                    <span className="truncate">{tempFile.name}</span>
                                    <button onClick={() => fileInputRef.current.click()} className="text-blue-400 hover:text-blue-700 ml-2 underline text-xs">Đổi ảnh khác</button>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm mb-6 text-center">
                                    Nhấn vào ảnh hoặc nút bên dưới để tải ảnh mới lên. <br/> Hỗ trợ JPG, PNG, JPEG.
                                </p>
                            )}

                            {/* Input ẩn */}
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden" 
                                accept="image/*" 
                            />

                            {/* Các nút hành động */}
                            <div className="grid grid-cols-2 gap-3 w-full">
                                {!tempFile ? (
                                    // Nếu chưa chọn file: Hiện nút chọn ảnh
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="col-span-2 w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2 transition"
                                    >
                                        <Upload size={18}/> Chọn ảnh từ máy
                                    </button>
                                ) : (
                                    // Nếu đã chọn file: Hiện nút Lưu và Hủy
                                    <>
                                        <button 
                                            onClick={() => setIsAvatarModalOpen(false)} 
                                            className="py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                                        >
                                            Hủy bỏ
                                        </button>
                                        <button 
                                            onClick={handleSaveAvatar}
                                            className="py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition shadow-lg shadow-blue-200"
                                        >
                                            <Save size={18}/> Lưu ảnh mới
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

          <div className="flex flex-col md:flex-row gap-6">
            
            {/* === SIDEBAR TRÁI === */}
            <div className="w-full md:w-1/4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                
                <div className="p-6 text-center border-b border-gray-100 bg-gradient-to-b from-blue-50 to-white">
                    <div className="relative w-28 h-28 mx-auto mb-3">
                        <div className="w-full h-full bg-gray-200 rounded-full border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-gray-400 overflow-hidden">
                            <img 
                                src={userData.avatar} 
                                alt="Avatar" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        {/* Nút Camera mở Modal */}
                        <button 
                            onClick={openAvatarModal}
                            className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full hover:bg-blue-600 transition border-2 border-white shadow-sm cursor-pointer"
                            title="Cập nhật ảnh đại diện"
                        >
                            <Camera size={16}/>
                        </button>
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg">{userData.name}</h3>
                    <p className="text-sm text-gray-500">{userData.email}</p>
                </div>
                
                <nav className="p-3 space-y-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                        location.pathname === item.path
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                  
                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium">
                        <LogOut size={20} /> Đăng xuất
                    </button>
                  </div>
                </nav>
              </div>
            </div>

            {/* === NỘI DUNG BÊN PHẢI === */}
            <div className="w-full md:w-3/4">
                <Outlet /> 
            </div>

          </div>
        </div>
      </div>
    </UserLayout>
  );
}