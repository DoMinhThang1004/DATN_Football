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
  MessageSquare
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation(); 
  const navigate = useNavigate(); // Dùng để chuyển trang sau khi logout
  const [isResourcesOpen, setIsResourcesOpen] = useState(false); 

  // Nếu người dùng đang ở route của "Sân" hoặc "Vé", mở dropdown tự động
  useEffect(() => {
    if (location.pathname.startsWith('/admin/manage-stadiums') || location.pathname.startsWith('/admin/manage-tickets')) {
      setIsResourcesOpen(true);
    }
  }, [location.pathname]);

  // --- PHẦN 1: LẤY DATA USER ---
  // Giả sử khi login thành công, bạn đã lưu thông tin vào localStorage bằng lệnh:
  // localStorage.setItem("currentUser", JSON.stringify(userObject));
  
  const [user, setUser] = useState({
    name: "Admin User",
    email: "admin@ticket.com",
    avatar: null // Link ảnh (URL) hoặc null
  });

  useEffect(() => {
    // Lấy dữ liệu từ LocalStorage khi component được load
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Hàm xử lý Logout
  const handleLogout = () => {
    if(window.confirm('Bạn có chắc muốn đăng xuất?')) {
        // 1. Xóa thông tin lưu trữ
        localStorage.removeItem("currentUser");
        localStorage.removeItem("token"); // Nếu có lưu token
        
        // 2. Chuyển hướng về trang login
        navigate("/login"); 
    }
  };

  // Active will show a left indicator instead of full background
  const activeClass = "text-white border-l-4 border-blue-500 bg-transparent";
  const inactiveClass = "text-gray-300 hover:bg-gray-700 hover:text-white";

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path ? activeClass : inactiveClass;
    return (location.pathname === path || location.pathname.startsWith(path + "/")) ? activeClass : inactiveClass;
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0 border-r border-gray-700 font-sans transition-all duration-300">
      
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
          {/* Parent dropdown: mark active when any child route is active */}
          <button
            onClick={() => setIsResourcesOpen(!isResourcesOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              (location.pathname.startsWith('/admin/manage-stadiums') || location.pathname.startsWith('/admin/manage-tickets')) ? activeClass : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${isActive('/admin/manage-comments',)}`}
       >
      <MessageSquare size={18} />
      <span>Bình luận & Đánh giá</span>
      </Link> 
      </nav>

      {/* --- PHẦN 3: FOOTER HIỂN THỊ USER ĐỘNG --- */}
      <div className="border-t border-gray-700 p-4 bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            
            {/* Logic Avatar: Nếu có ảnh thì hiện ảnh, không thì hiện chữ cái đầu */}
            {user.avatar ? (
               <img 
                 src={user.avatar} 
                 alt="User Avatar" 
                 className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
               />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md shrink-0">
                {/* Lấy chữ cái đầu tiên của tên, ví dụ "Tan" -> "T" */}
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate max-w-[120px]" title={user.name}>
                {user.name}
              </span>
              <span className="text-xs text-gray-400 truncate max-w-[120px]" title={user.email}>
                {user.email}
              </span>
            </div>
          </div>
          
          {/* Nút Logout */}
          <button 
            className="p-2 rounded-full hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-colors shrink-0"
            title="Đăng xuất"
            onClick={handleLogout}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
}