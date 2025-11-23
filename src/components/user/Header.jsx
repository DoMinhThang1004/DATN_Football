import React, { useState, useEffect, useRef } from "react";
import { Search, User, ShoppingCart, Home, Calendar, Ticket, Newspaper, LogOut, ChevronDown, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; 
import { useCart } from "../../context/CartContext.jsx"; 

export default function Header() {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  
  // --- STATE QUẢN LÝ USER ---
  const [user, setUser] = useState(null); // null = chưa đăng nhập
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Giả lập lấy thông tin user từ LocalStorage khi component load
  useEffect(() => {
    // Bạn có thể set cứng giá trị này để test giao diện:
    // const fakeUser = { name: "Minh Thắng", avatar: "https://placehold.co/150" };
    // setUser(fakeUser);

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("user"); // Xóa token/user
    setUser(null);
    navigate("/login");
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-gray-800 text-white sticky top-0 z-50 shadow-xl">
      <div className="container mx-auto p-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 text-2xl font-extrabold text-white pr-4 hover:opacity-90 transition-opacity">
          <Ticket size={27} className="text-yellow-400"/>
          <span>FootballTic</span>
        </Link>

        {/* Search Bar */}
        <div className="max-w-xl flex-1 mx-8 hidden md:block"> 
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm trận đấu..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-6 font-medium">
            
            <Link to="/home" className="flex items-center gap-1 group">
              <Home size={18} className="text-white group-hover:text-yellow-400 transition-colors" /> 
              <span className="text-white group-hover:text-yellow-400 transition-colors hidden lg:block">Trang chủ</span>
            </Link>
            
            <Link to="/news" className="flex items-center gap-1 group">
              <Newspaper size={18} className="text-white group-hover:text-yellow-400 transition-colors" /> 
              <span className="text-white group-hover:text-yellow-400 transition-colors hidden lg:block">Tin tức</span>
            </Link>
            
            <Link to="/matches" className="flex items-center gap-1 group">
              <Calendar size={18} className="text-white group-hover:text-yellow-400 transition-colors" /> 
              <span className="text-white group-hover:text-yellow-400 transition-colors hidden lg:block">Trận đấu</span>
            </Link>
            
            <Link to="/contact" className="flex items-center gap-1 group">
              <Ticket size={18} className="text-white group-hover:text-yellow-400 transition-colors" /> 
              <span className="text-white group-hover:text-yellow-400 transition-colors hidden lg:block">Liên hệ</span>
            </Link>

            {/* Actions Right */}
            <div className="pl-4 border-l border-gray-600 flex items-center space-x-6">
              
              {/* --- Giỏ hàng --- */}
              <Link to="/cart" className="flex items-center gap-1 group relative">
                <div className="relative">
                    <ShoppingCart size={18} className="text-white group-hover:text-yellow-400 transition-colors" /> 
                    {cartItems.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                            {cartItems.length}
                        </span>
                    )}
                </div>
                <span className="text-white group-hover:text-yellow-400 transition-colors hidden lg:block">Giỏ hàng</span>
              </Link>

              {/* --- LOGIC HIỂN THỊ USER / LOGIN --- */}
              {user ? (
                  // TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP: Hiện Avatar + Dropdown
                  <div className="relative" ref={dropdownRef}>
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 focus:outline-none hover:bg-gray-700 p-1.5 rounded-full transition-all"
                      >
                          <img 
                            src={user.avatar || "https://placehold.co/100"} 
                            alt="Avatar" 
                            className="w-8 h-8 rounded-full border-2 border-yellow-400 object-cover"
                          />
                          <span className="text-sm font-bold hidden md:block max-w-[100px] truncate">{user.name}</span>
                          <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                      </button>

                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                          <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn text-gray-800 z-50">
                              <div className="p-4 border-b border-gray-100 bg-gray-50">
                                  <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{user.email || "user@example.com"}</p>
                              </div>
                              <div className="py-2">
                                  <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm">
                                      <User size={16}/> Hồ sơ của tôi
                                  </Link>
                                  <Link to="/profile/tickets" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm">
                                      <Ticket size={16}/> Vé đã mua
                                  </Link>
                                  <Link to="/profile/address" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm">
                                      <MapPin size={16}/> Sổ địa chỉ
                                  </Link>
                              </div>
                              <div className="border-t border-gray-100 py-2">
                                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium text-left">
                                      <LogOut size={16}/> Đăng xuất
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
              ) : (
                  // TRƯỜNG HỢP CHƯA ĐĂNG NHẬP: Hiện nút Login
                  <Link to="/login" className="flex items-center gap-1 px-4 py-1.5 rounded-full border border-white hover:bg-yellow-400 hover:border-yellow-400 hover:text-gray-900 transition-all group">
                    <User size={18} className="group-hover:text-gray-900" /> 
                    <span className="font-bold text-sm">Đăng nhập</span>
                  </Link>
              )}

            </div>
        </nav>
      </div>
    </header>
  );
}