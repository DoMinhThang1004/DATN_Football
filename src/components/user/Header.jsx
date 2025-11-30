import React, { useState, useEffect, useRef } from "react";
import { 
  Search, User, ShoppingCart, Home, Calendar, Ticket, Newspaper, 
  LogOut, ChevronDown, MapPin, Settings, AlertCircle, X 
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; 
import { useCart } from "../../context/CartContext.jsx"; 

export default function Header() {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  
  // --- STATE QUẢN LÝ USER ---
  const [user, setUser] = useState(null); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); 
  
  // --- STATE TÌM KIẾM ---
  const [keyword, setKeyword] = useState(""); // Lưu từ khóa người dùng nhập

  const dropdownRef = useRef(null);

  // ... (Phần useEffect lấy user giữ nguyên) ...
  useEffect(() => {
    const updateUserData = () => {
        const storedUser = localStorage.getItem("currentUser"); 
        if (storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch (e) {}
        } else { setUser(null); }
    };
    updateUserData();
    window.addEventListener('storage', updateUserData);
    return () => window.removeEventListener('storage', updateUserData);
  }, []);

  const confirmLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    setUser(null);
    setShowLogoutModal(false);
    navigate("/login");
  };

  // ... (Phần useEffect đóng dropdown giữ nguyên) ...
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HÀM XỬ LÝ TÌM KIẾM ---
  const handleSearch = (e) => {
    // Nếu nhấn Enter hoặc click icon Search
    if ((e.key === 'Enter' || e.type === 'click') && keyword.trim()) {
        // Chuyển hướng sang trang Matches kèm query param ?search=...
        navigate(`/matches?search=${encodeURIComponent(keyword.trim())}`);
        // Tùy chọn: Xóa từ khóa sau khi search xong
        // setKeyword(""); 
    }
  };

  return (
    <>
    <header className="bg-gray-900 text-white sticky top-0 z-40 shadow-md border-b border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-white pr-4 hover:opacity-90 transition-opacity">
          <div className="bg-yellow-400 text-gray-900 p-1.5 rounded-lg">
            <Ticket size={20} className="fill-current"/>
          </div>
          <span>FootballTic</span>
        </Link>

        {/* Search Bar (ĐÃ SỬA) */}
        <div className="max-w-lg flex-1 mx-8 hidden md:block"> 
          <div className="relative group">
            <a 
                onClick={handleSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-yellow-400 transition-colors cursor-pointer"
            >
                <Search size={18} />
            </a>
            <input
              type="text"
              placeholder="Tìm trận đấu, giải đấu..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-sm"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleSearch} // Bắt sự kiện phím Enter
            />
          </div>
        </div>

        {/* ... (Phần Navigation và User giữ nguyên) ... */}
        <nav className="flex items-center space-x-6 font-medium text-sm">
            
            <Link to="/" className="flex items-center gap-1 group">
              <Home size={18} className="text-gray-300 group-hover:text-yellow-400 transition-colors" /> 
              <span className="text-gray-300 group-hover:text-yellow-400 transition-colors hidden lg:block">Trang chủ</span>
            </Link>
            
            <Link to="/news" className="flex items-center gap-1 group">
              <Newspaper size={18} className="text-gray-300 group-hover:text-yellow-400 transition-colors" /> 
              <span className="text-gray-300 group-hover:text-yellow-400 transition-colors hidden lg:block">Tin tức</span>
            </Link>
            
            <Link to="/matches" className="flex items-center gap-1 group">
              <Calendar size={18} className="text-gray-300 group-hover:text-yellow-400 transition-colors" /> 
              <span className="text-gray-300 group-hover:text-yellow-400 transition-colors hidden lg:block">Lịch đấu</span>
            </Link>

            <div className="pl-4 border-l border-gray-700 flex items-center space-x-4">
              <Link to="/cart" className="flex items-center gap-1 group relative p-2 hover:bg-gray-800 rounded-full transition-colors">
                <div className="relative">
                    <ShoppingCart size={20} className="text-white group-hover:text-yellow-400 transition-colors" /> 
                    {cartItems && cartItems.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                            {cartItems.length}
                        </span>
                    )}
                </div>
              </Link>

              {user ? (
                  <div className="relative" ref={dropdownRef}>
                      <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 focus:outline-none hover:bg-gray-800 py-1 px-2 rounded-full transition-all border border-transparent hover:border-gray-700">
                          {user.avatar_url ? <img src={user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-gray-600" /> : <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">{user.full_name?.charAt(0).toUpperCase() || "U"}</div>}
                          <span className="text-sm font-medium hidden md:block max-w-[100px] truncate">{user.full_name}</span>
                          <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                      </button>
                      {isDropdownOpen && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200 text-gray-800 z-50 origin-top-right">
                              <div className="p-4 border-b border-gray-100 bg-gray-50">
                                  <p className="text-sm font-bold text-gray-900 truncate">{user.full_name}</p>
                                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                              </div>
                              <div className="py-1">
                                  <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 hover:text-blue-600 transition-colors"><Settings size={16}/> Cài đặt tài khoản</Link>
                                  <Link to="/profile/tickets" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 hover:text-blue-600 transition-colors"><Ticket size={16}/> Vé của tôi</Link>
                              </div>
                              <div className="border-t border-gray-100 py-1">
                                  <button onClick={() => { setIsDropdownOpen(false); setShowLogoutModal(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium text-left"><LogOut size={16}/> Đăng xuất</button>
                              </div>
                          </div>
                      )}
                  </div>
              ) : (
                  <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-sm transition-all shadow-lg shadow-yellow-400/20">
                    <User size={16} /> <span>Đăng nhập</span>
                  </Link>
              )}
            </div>
        </nav>
      </div>
    </header>

    {/* Modal Logout (Giữ nguyên) */}
    {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all scale-100">
                <button onClick={() => setShowLogoutModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><LogOut size={28} className="ml-1"/></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng xuất?</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">Hủy bỏ</button>
                    <button onClick={confirmLogout} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors">Đăng xuất</button>
                </div>
            </div>
        </div>
    )}
    </>
  );
}