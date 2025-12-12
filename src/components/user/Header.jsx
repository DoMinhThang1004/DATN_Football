import React, { useState, useEffect, useRef } from "react";
import { 
  Search, User, ShoppingCart, Home, Calendar, Ticket, Newspaper, 
  LogOut, ChevronDown, MapPin, Settings, AlertCircle, X 
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import { useCart } from "../../context/CartContext.jsx"; 

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { cartItems } = useCart();
  
  //ql user
  const [user, setUser] = useState(null); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); 
  
  //search
  const [keyword, setKeyword] = useState(""); 

  const dropdownRef = useRef(null);

  //data user
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && keyword.trim()) {
        navigate(`/matches?search=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const isActive = (path) => {
      if (path === '/') return location.pathname === '/';
      return location.pathname.startsWith(path);
  };
  const handleLogoClick = (e) => {
      if (location.pathname === '/') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  return (
    <>
    <header className="bg-gray-900 text-white sticky top-0 z-40 shadow-lg border-b border-gray-800 backdrop-blur-md bg-opacity-95">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link 
            to="/"  onClick={handleLogoClick}
            className="flex items-center gap-2 group select-none">
          <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-red-600 text-white rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
            <Ticket size={24} strokeWidth={2.5} className="drop-shadow-md"/>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping opacity-75"></div>
          </div>
          <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter leading-none text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-red-500 transition-all duration-300">
                  Football<span className="text-yellow-400 group-hover:text-inherit">Tic</span>
              </span>
              <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase group-hover:text-white transition-colors duration-300">
                  TICKET SYSTEM
              </span>
          </div>
        </Link>

        <div className="max-w-md flex-1 mx-10 hidden lg:block"> 
          <div className="relative group">
            <a 
                onClick={handleSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-yellow-400 transition-colors cursor-pointer">
                <Search size={18} />
            </a>
            <input
              type="text" placeholder="Tìm kiếm trận đấu, giải đấu..."
              className="w-full pl-12 pr-4 py-2.5 rounded-full bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent focus:bg-gray-800 transition-all text-sm font-medium shadow-inner"
              value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={handleSearch}/>
          </div>
        </div>

        <nav className="flex items-center space-x-8 font-bold text-sm">
            <Link to="/" className={`flex items-center gap-2 transition-all duration-300 hover:text-yellow-400 ${isActive('/') ? 'text-yellow-400 scale-105' : 'text-gray-300'}`}>
              <Home size={18} className={isActive('/') ? "fill-current" : ""} /> 
              <span className="hidden xl:block">Trang chủ</span>
            </Link>
            
            <Link to="/matches" className={`flex items-center gap-2 transition-all duration-300 hover:text-yellow-400 ${isActive('/matches') ? 'text-yellow-400 scale-105' : 'text-gray-300'}`}>
              <Calendar size={18} className={isActive('/matches') ? "fill-current" : ""} /> 
              <span className="hidden xl:block">Lịch đấu</span>
            </Link>

            <Link to="/news" className={`flex items-center gap-2 transition-all duration-300 hover:text-yellow-400 ${isActive('/news') ? 'text-yellow-400 scale-105' : 'text-gray-300'}`}>
              <Newspaper size={18} className={isActive('/news') ? "fill-current" : ""} /> 
              <span className="hidden xl:block">Tin tức</span>
            </Link>

            <div className="pl-6 border-l border-gray-700 flex items-center space-x-5">
              <Link to="/cart" className="relative group p-2 hover:bg-gray-800 rounded-full transition-colors">
                 <ShoppingCart size={22} className={`transition-colors ${isActive('/cart') ? 'text-yellow-400 fill-current' : 'text-white group-hover:text-yellow-400'}`} /> 
                 {cartItems && cartItems.length > 0 && (
                     <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900 animate-pulse">
                         {cartItems.length}
                     </span>
                 )}
              </Link>

              {user ? (
                  <div className="relative" ref={dropdownRef}>
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                        className={`flex items-center gap-3 pl-1 pr-4 py-1 rounded-full transition-all border border-gray-700 hover:border-gray-500 hover:bg-gray-800 group ${isDropdownOpen ? 'bg-gray-800 border-gray-500' : 'bg-gray-800/50'}`}>
                          <div className="relative">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt="Avatar" className="w-9 h-9 rounded-full object-cover border-2 border-gray-600 group-hover:border-yellow-400 transition-colors" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm border-2 border-gray-600 group-hover:border-yellow-400 transition-colors">
                                  {user.full_name?.charAt(0).toUpperCase() || "U"}
                                </div>
                              )}
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-gray-800 rounded-full"></span>
                          </div>
                          
                        <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-200 group-hover:text-white max-w-[100px] truncate">{user.full_name}</span>
                              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-yellow-400' : ''}`}/>
                          </div>
                      </button>
                      {isDropdownOpen && (
                          <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-gray-800 z-50 origin-top-right ring-1 ring-black/5">
                              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                  <p className="text-sm font-bold text-gray-900 truncate">{user.full_name}</p>
                                  <p className="text-xs text-gray-500 truncate font-medium">{user.email}</p>
                                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide border border-blue-200">
                                    {user.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                                  </div>
                              </div>
                              
                              <div className="py-2 px-2 space-y-1">
                                  <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Settings size={16}/></div>
                                    Cài đặt tài khoản
                                  </Link>
                                  <Link to="/profile/tickets" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><Ticket size={16}/></div>
                                    Vé của tôi
                                  </Link>
                              </div>

                              <div className="p-2 border-t border-gray-100">
                                  <button onClick={() => { setIsDropdownOpen(false); setShowLogoutModal(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold">
                                    <LogOut size={18}/> Đăng xuất
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
              ) : (
                  <Link to="/login" className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black text-sm transition-all shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 hover:-translate-y-0.5">
                    <User size={18} className="fill-current" /> <span>Đăng nhập</span>
                  </Link>
              )}
            </div>
        </nav>
      </div>
    </header>
    {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all scale-100 border border-gray-100">
                <button onClick={() => setShowLogoutModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"><X size={20} /></button>
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100 animate-bounce-slow">
                    <LogOut size={32} className="text-red-500 ml-1"/>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Đăng xuất?</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed px-4">
                    Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không? Các vé trong giỏ hàng có thể bị mất.
                </p>
                <div className="flex gap-3 justify-center">
                    <button 
                        onClick={() => setShowLogoutModal(false)} 
                        className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 text-sm transition-colors">
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={confirmLogout} 
                        className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 text-sm transition-colors shadow-lg shadow-red-200 hover:shadow-red-300">
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  );
}