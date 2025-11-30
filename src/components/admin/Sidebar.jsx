import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Ticket, 
  MapPin, 
  ShoppingCart, 
  Users, 
  ChevronDown, 
  ChevronRight, 
  LogOut, 
  Settings,
  MessageSquare,
  AlertCircle 
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation(); 
  const navigate = useNavigate(); 
  const [isResourcesOpen, setIsResourcesOpen] = useState(false); 
  
  // --- STATE CHO MODAL ĐĂNG XUẤT ---
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Tự động mở dropdown nếu đang ở trang con
  useEffect(() => {
    if (location.pathname.startsWith('/admin/manage-stadiums') || location.pathname.startsWith('/admin/manage-tickets')) {
      setIsResourcesOpen(true);
    }
  }, [location.pathname]);

  // --- LẤY DATA USER ---
  const [user, setUser] = useState({
    full_name: "Admin User", 
    email: "admin@ticket.com",
    avatar_url: null 
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

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('userUpdated', handleStorageChange);
    };
  }, []);

  // --- XỬ LÝ HIỂN THỊ TÊN AN TOÀN ---
  const displayName = user.full_name || user.name || "Admin";
  const displayEmail = user.email || "";
  const displayAvatar = user.avatar_url || user.avatar; 

  const firstChar = displayName && displayName.length > 0 ? displayName.charAt(0).toUpperCase() : "A";

  // --- HÀM XỬ LÝ ĐĂNG XUẤT ---
  
  // 1. Bấm nút Logout -> Mở Modal
  const handleLogoutClick = () => {
      setLogoutModalOpen(true);
  };

  // 2. Bấm Đồng ý -> Xóa data & Chuyển trang
  const confirmLogout = () => {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token"); 
      setLogoutModalOpen(false); // Đóng modal trước khi chuyển trang cho mượt
      navigate("/login"); 
  };

  // Style active/inactive
  const activeClass = "bg-blue-600 text-white shadow-lg";
  const inactiveClass = "text-gray-300 hover:bg-gray-700 hover:text-white";

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path ? activeClass : inactiveClass;
    return (location.pathname === path || location.pathname.startsWith(path + "/")) ? activeClass : inactiveClass;
  };

  return (
    <>
      <aside className="w-64 bg-gray-900 text-white flex flex-col h-full border-r border-gray-700 font-sans transition-all duration-300 relative z-10">
        
        {/* 1. Header / Logo */}
        <div className="p-6 flex items-center justify-center border-b border-gray-700">
          <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl text-white">
                A
              </div>
              <span className="text-xl font-bold tracking-wide">Admin Panel</span>
          </div>
        </div>

        {/* 2. Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          
          <Link 
            to="/admin/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/dashboard')}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>

          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2 px-4">
            Quản lý chính
          </div>

          <Link 
            to="/admin/manage-matches" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/manage-matches')}`}
          >
            <CalendarDays size={20} />
            <span className="font-medium">Quản lý Trận đấu</span>
          </Link>

          <Link 
            to="/admin/manage-orders" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/manage-orders')}`}
          >
            <ShoppingCart size={20} />
            <span className="font-medium">Đơn hàng</span>
          </Link>

          {/* Dropdown Menu */}
          <div>
            <button
              onClick={() => setIsResourcesOpen(!isResourcesOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                (location.pathname.startsWith('/admin/manage-stadiums') || location.pathname.startsWith('/admin/manage-tickets')) ? 'text-white bg-gray-800' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings size={20} />
                <span className="font-medium">Cấu hình Sân/Vé</span>
              </div>
              {isResourcesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {isResourcesOpen && (
              <div className="mt-1 ml-4 border-l-2 border-gray-700 pl-2 space-y-1">
                <Link 
                  to="/admin/manage-stadiums" 
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${isActive('/admin/manage-stadiums', true)}`}
                >
                  <MapPin size={18} />
                  <span>Sân vận động</span>
                </Link>
                
                <Link 
                  to="/admin/manage-tickets" 
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${isActive('/admin/manage-tickets', true)}`}
                >
                  <Ticket size={18} />
                  <span>Quản lý loại Vé</span>
                </Link>
              </div>
            )}
          </div>

          <Link 
            to="/admin/manage-users" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/manage-users')}`}
          >
            <Users size={20} />
            <span className="font-medium">Người dùng</span>
          </Link>

          <Link 
            to="/admin/manage-comments" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/manage-comments')}`}
          >
            <MessageSquare size={20} />
            <span className="font-medium">Bình luận & Đánh giá</span>
          </Link> 

        </nav>

        {/* --- PHẦN 3: FOOTER HIỂN THỊ USER --- */}
        <div className="border-t border-gray-700 p-4 bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              
              {displayAvatar ? (
                 <img 
                   src={displayAvatar} 
                   alt="User Avatar" 
                   className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                 />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md shrink-0">
                  {firstChar}
                </div>
              )}

              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white truncate max-w-[120px]" title={displayName}>
                  {displayName}
                </span>
                <span className="text-xs text-gray-400 truncate max-w-[120px]" title={displayEmail}>
                  {displayEmail}
                </span>
              </div>
            </div>
            
            {/* Nút Logout kích hoạt Modal */}
            <button 
              className="p-2 rounded-full hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-colors shrink-0"
              title="Đăng xuất"
              onClick={handleLogoutClick}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* --- MODAL XÁC NHẬN ĐĂNG XUẤT --- */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all scale-100">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <LogOut size={24} className="ml-1"/>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Đăng xuất?</h3>
                <p className="text-gray-500 text-sm mb-6">
                    Bạn có chắc muốn đăng xuất khỏi hệ thống quản trị không?
                </p>
                <div className="flex gap-3 justify-center">
                    <button 
                        onClick={() => setLogoutModalOpen(false)} 
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={confirmLogout} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-md"
                    >
                        Đăng xuất ngay
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}