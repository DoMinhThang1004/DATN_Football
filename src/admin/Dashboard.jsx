import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import { 
  Users, 
  DollarSign, 
  Ticket, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal,
  Calendar as CalendarIcon,
  ChevronDown // Thêm icon để làm menu dropdown
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

// --- PHẦN 1: DỮ LIỆU GIẢ (MOCK DATA) ---
const DASHBOARD_DATA = {
  stats: [
    { title: "Tổng doanh thu", value: "850.5 Tr", icon: DollarSign, color: "text-orange-600", bgColor: "bg-orange-100", trend: "+12.5%", isPositive: true },
    { title: "Vé đã bán", value: "1,520", icon: Ticket, color: "text-green-600", bgColor: "bg-green-100", trend: "+8.2%", isPositive: true },
    { title: "Users mới", value: "247", icon: Users, color: "text-blue-600", bgColor: "bg-blue-100", trend: "-2.4%", isPositive: false },
    { title: "Tỉ lệ lấp đầy", value: "78%", icon: Activity, color: "text-purple-600", bgColor: "bg-purple-100", trend: "+5.1%", isPositive: true },
  ],
  revenueChart: [
    { name: 'T2', revenue: 4000, tickets: 240 },
    { name: 'T3', revenue: 3000, tickets: 139 },
    { name: 'T4', revenue: 2000, tickets: 980 },
    { name: 'T5', revenue: 2780, tickets: 390 },
    { name: 'T6', revenue: 1890, tickets: 480 },
    { name: 'T7', revenue: 2390, tickets: 380 },
    { name: 'CN', revenue: 3490, tickets: 430 },
  ],
  recentOrders: [
    { id: "#ORD-001", user: "Nguyễn Văn A", match: "VN vs Thái Lan", total: "500.000đ", status: "Success" },
    { id: "#ORD-002", user: "Trần Thị B", match: "Hà Nội FC vs CAHN", total: "1.200.000đ", status: "Pending" },
    { id: "#ORD-003", user: "Lê Văn C", match: "SLNA vs HAGL", total: "300.000đ", status: "Cancelled" },
    { id: "#ORD-004", user: "Phạm D", match: "VN vs Indonesia", total: "2.500.000đ", status: "Success" },
  ]
};

// Component Card thống kê nhỏ
const StatCard = ({ title, value, icon: Icon, color, bgColor, trend, isPositive }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${bgColor} ${color}`}>
        <Icon size={24} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className={`flex items-center font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
        {trend}
      </span>
      <span className="text-gray-400 ml-2">so với tháng trước</span>
    </div>
  </div>
);

const Dashboard = () => {
  // --- STATE QUẢN LÝ THỜI GIAN ---
  // Mặc định lấy ngày giờ hiện tại của máy tính
  const [currentDate, setCurrentDate] = useState(new Date());

  // Hàm format ngày tháng sang tiếng Việt (VD: Tháng 11, 2025)
  const formattedDate = new Intl.DateTimeFormat('vi-VN', { 
    month: 'long', 
    year: 'numeric' 
  }).format(currentDate);

  // Giả lập việc đổi tháng (Sau này bạn gắn hàm này vào API để load lại data)
  const handleMonthChange = (e) => {
     // Logic xử lý khi chọn tháng khác...
     console.log("Đã chọn tháng:", e.target.value);
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        
        {/* --- HEADER DYNAMIC --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
            <p className="text-gray-500 text-sm mt-1">
                Dữ liệu cập nhật mới nhất ngày {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>

          {/* Bộ lọc thời gian */}
          <div className="flex items-center bg-white p-1 rounded-lg border shadow-sm">
              <div className="flex items-center px-3 py-2 border-r border-gray-100">
                <CalendarIcon size={18} className="text-blue-600 mr-2"/>
                {/* Hiển thị tháng hiện tại viết hoa chữ cái đầu */}
                <span className="text-sm font-semibold text-gray-700 capitalize">
                    {formattedDate}
                </span>
              </div>
              
              {/* Dropdown chọn khoảng thời gian (Giả lập UI) */}
              <div className="relative">
                <select 
                    className="appearance-none bg-transparent text-sm font-medium text-gray-600 py-2 pl-3 pr-8 focus:outline-none cursor-pointer hover:text-blue-600"
                    onChange={handleMonthChange}
                >
                    <option value="this_month">Tháng này</option>
                    <option value="last_month">Tháng trước</option>
                    <option value="last_3_months">3 tháng gần nhất</option>
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"/>
              </div>
          </div>
        </div>

        {/* 1. Hàng Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {DASHBOARD_DATA.stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* 2. Khu vực Biểu đồ & Thống kê */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Biểu đồ Doanh thu (Chiếm 2/3) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                  <h2 className="text-lg font-bold text-gray-800">Biểu đồ doanh thu</h2>
                  <p className="text-xs text-gray-400 mt-1">Dữ liệu 7 ngày gần nhất</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded">
                  <MoreHorizontal size={20} />
              </button>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DASHBOARD_DATA.revenueChart}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value * 1000)}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Biểu đồ phụ */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="mb-6">
                 <h2 className="text-lg font-bold text-gray-800">Vé bán theo ngày</h2>
                 <p className="text-xs text-gray-400 mt-1">So sánh số lượng vé</p>
            </div>
            <div className="h-80 w-full flex-1">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DASHBOARD_DATA.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Bar dataKey="tickets" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 3. Bảng đơn hàng */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Đơn đặt vé mới nhất</h2>
            <button className="text-blue-600 text-sm font-medium hover:underline">Xem tất cả</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Mã đơn</th>
                  <th className="p-4 font-medium">Khách hàng</th>
                  <th className="p-4 font-medium">Trận đấu</th>
                  <th className="p-4 font-medium">Tổng tiền</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {DASHBOARD_DATA.recentOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-blue-600 font-medium">{order.id}</td>
                    <td className="p-4 text-gray-800 font-medium">{order.user}</td>
                    <td className="p-4 text-gray-600">{order.match}</td>
                    <td className="p-4 text-gray-800 font-bold">{order.total}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border
                        ${order.status === 'Success' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                        ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
                        ${order.status === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Dashboard;