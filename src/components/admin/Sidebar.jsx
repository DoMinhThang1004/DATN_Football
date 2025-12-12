import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Ticket, MapPin, ShoppingCart, Users,  ChevronDown, 
  ChevronRight, LogOut, Settings, MessageSquare,Shield, FileText, Headset} from "lucide-react";

export default function Sidebar() {
  const location = useLocation(); 
  const navigate = useNavigate(); 
  const [isResourcesOpen, setIsResourcesOpen] = useState(false); 
  
  //dx
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith('/admin/manage-stadiums') || location.pathname.startsWith('/admin/manage-tickets')) {
      setIsResourcesOpen(true);
    }
  }, [location.pathname]);

  //lấy dl
  const [user, setUser] = useState(() => {
      const stored = localStorage.getItem("currentUser");
      try {
          return stored ? JSON.parse(stored) : null;
      } catch (e) {
          return null;
      }
  });

 
  useEffect(() => {
    const handleStorageChange = () => {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error("Lỗi parse user:", error);
            }
        }
    };
    
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleStorageChange);
    window.addEventListener('storage', (e) => {
        if (e.key === 'currentUser') {
            handleStorageChange();
        }
    });

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('userUpdated', handleStorageChange);
        window.removeEventListener('storage', (e) => {
            if (e.key === 'currentUser') {
                handleStorageChange();
            }
        });
    };
  }, []);

  //check quyền
  const isAdmin = user?.role === 'ADMIN';

  //tt
  const displayName = user?.full_name || user?.name || "Admin";
  const displayEmail = user?.email || "admin@ticket.com";
  const displayAvatar = user?.avatar_url || user?.avatar; 
  const firstChar = displayName.charAt(0).toUpperCase();

  //dx
  const handleLogoutClick = () => {
      setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token"); 
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("userUpdated"));
      setLogoutModalOpen(false);
      navigate("/login"); 
  };

  const activeClass = "bg-blue-600 text-white shadow-lg shadow-blue-900/20";
  const inactiveClass = "text-gray-400 hover:bg-gray-800 hover:text-white";
  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path ? activeClass : inactiveClass;
    return (location.pathname === path || location.pathname.startsWith(path + "/")) ? activeClass : inactiveClass;
  };

  return (
    <>
      <aside className="w-72 bg-[#111827] text-gray-300 flex flex-col h-full border-r border-gray-800 font-sans transition-all duration-300 relative z-20 shadow-2xl">
        <div className="h-20 flex items-center px-6 border-b border-gray-800/50 bg-[#111827]">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <Shield size={20} fill="currentColor" className="text-white/90"/>
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-white tracking-tight leading-none">Admin</h1>
                <p className="text-[10px] text-gray-500 font-medium tracking-wider mt-0.5">
                    {isAdmin ? "QUẢN TRỊ HỆ THỐNG" : "KHU VỰC NHÂN VIÊN"}
                </p>
              </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
          <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-1">Tổng quan</p>
          
          <Link 
            to="/admin/dashboard"  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${isActive('/admin/dashboard')}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">Quản lý</p>
          
          <Link 
            to="/admin/manage-matches"  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${isActive('/admin/manage-matches')}`}>
            <CalendarDays size={20} />
            <span>Lịch thi đấu</span>
          </Link>
          
          <Link 
            to="/admin/manage-orders" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${isActive('/admin/manage-orders')}`} >
            <ShoppingCart size={20} />
            <span>Đơn hàng</span>
          </Link>
          {isAdmin && (
              <div className="space-y-1 pt-1">
                <button
                  onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group ${
                      (location.pathname.startsWith('/admin/manage-stadiums') || location.pathname.startsWith('/admin/manage-tickets')) 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                    <div className="flex items-center gap-3">
                      <Settings size={20} className={`transition-transform duration-300 ${isResourcesOpen ? 'rotate-90' : ''}`}/>
                      <span>Cấu hình hệ thống</span>
                    </div>
                  {isResourcesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400"/>}
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isResourcesOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="ml-4 pl-4 border-l border-gray-700 space-y-1 mt-1 mb-2">
                    <Link 
                      to="/admin/manage-stadiums"  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive('/admin/manage-stadiums', true)}`}>
                      <MapPin size={16} />
                      <span>Sân vận động</span>
                    </Link>
                    
                    <Link 
                      to="/admin/manage-tickets" className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive('/admin/manage-tickets', true)}`}>
                      <Ticket size={16} />
                      <span>Loại vé gốc</span>
                    </Link>
                  </div>
                </div>
              </div>
          )}

          <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">Người dùng & Tương tác</p>
          {isAdmin && (
              <Link 
                to="/admin/manage-users" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${isActive('/admin/manage-users')}`}>
                <Users size={20} />
                <span>Tài khoản</span>
              </Link>
          )}

          <Link 
          to="/admin/live-chat"  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${isActive('/admin/live-chat')}`}>
          <Headset size={20} />
          <span>Chat Hỗ trợ (Live)</span>
        </Link>

        <Link 
            to="/admin/manage-comments"  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${isActive('/admin/manage-comments')}`}>
            <MessageSquare size={20} />
            <span>Bình luận & Đánh giá</span>
        </Link> 

          <Link 
            to="/admin/manage-news" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${isActive('/admin/manage-news')}`} >
          <FileText size={20} />
          <span>Quản lý Tin Tức</span>
          </Link>
        </nav>
        <div className="p-4 bg-[#0f1523] border-t border-gray-800">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-colors group">
            <div className="flex items-center gap-3 overflow-hidden">
              
              {displayAvatar ? (
                 <img 
                   src={displayAvatar}  alt="User Avatar" 
                   className="w-10 h-10 rounded-full object-cover border-2 border-gray-600 group-hover:border-blue-500 transition-colors"
                   onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/150?text=Avatar"; }}/>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0 border-2 border-gray-500 group-hover:border-blue-400 transition-colors">
                  {firstChar}
                </div>
              )}

              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white truncate max-w-[100px]" title={displayName}>
                  {displayName}
                </span>
                <span className="text-[10px] text-gray-400 truncate max-w-[100px] group-hover:text-blue-400 transition-colors" title={displayEmail}>
                  {displayEmail}
                </span>
              </div>
            </div>
            
            <button 
              className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-all transform hover:scale-105"
              title="Đăng xuất"
              onClick={handleLogoutClick}  >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      {logoutModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all scale-100 border border-gray-100">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce-slow">
                    <LogOut size={32} className="text-red-500 ml-1"/>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng xuất ngay?</h3>
                <p className="text-gray-500 text-sm mb-8 px-4">
                    Bạn sẽ cần đăng nhập lại để truy cập vào trang quản trị.
                </p>
                <div className="flex gap-3 justify-center">
                    <button 
                        onClick={() => setLogoutModalOpen(false)} 
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm font-bold transition-colors">
                        Ở lại
                    </button>
                    <button 
                        onClick={confirmLogout} 
                        className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-bold transition-colors shadow-lg shadow-red-200">
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}