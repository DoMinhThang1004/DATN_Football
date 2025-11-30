import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { 
  Users, DollarSign, Ticket, Activity, TrendingUp, TrendingDown, 
  MoreHorizontal, Calendar as CalendarIcon, ChevronDown, Loader2, ChevronLeft, ChevronRight
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const API_URL = "http://localhost:5000/api/dashboard/stats";

// Component Card thống kê nhỏ (Đã thêm onClick và style cursor-pointer)
const StatCard = ({ title, value, icon: Icon, color, bgColor, trend, isPositive, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:-translate-y-1"
  >
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
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số dòng mỗi trang

  const [currentDate] = useState(new Date());
  const formattedDate = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(currentDate);

  // --- FETCH DATA ---
  useEffect(() => {
      const fetchStats = async () => {
          try {
              const res = await fetch(API_URL);
              const data = await res.json();
              setStats(data);
          } catch (error) {
              console.error("Lỗi tải Dashboard:", error);
          } finally {
              setLoading(false);
          }
      };
      fetchStats();
  }, []);

  // --- LOGIC PHÂN TRANG ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = stats?.recentOrders?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const totalPages = Math.ceil((stats?.recentOrders?.length || 0) / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return (
      <AdminLayout>
          <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div>
      </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
            <p className="text-gray-500 text-sm mt-1">Dữ liệu cập nhật mới nhất ngày {new Date().toLocaleDateString('vi-VN')}</p>
          </div>
          <div className="flex items-center bg-white p-1 rounded-lg border shadow-sm">
              <div className="flex items-center px-3 py-2 border-r border-gray-100">
                <CalendarIcon size={18} className="text-blue-600 mr-2"/>
                <span className="text-sm font-semibold text-gray-700 capitalize">{formattedDate}</span>
              </div>
              <div className="relative">
                <select className="appearance-none bg-transparent text-sm font-medium text-gray-600 py-2 pl-3 pr-8 focus:outline-none cursor-pointer hover:text-blue-600">
                    <option value="this_month">Tháng này</option>
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"/>
              </div>
          </div>
        </div>

        {/* 1. STATS CARDS (CÓ ĐIỀU HƯỚNG) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
                title="Tổng doanh thu" 
                value={Number(stats?.revenue || 0).toLocaleString() + 'đ'} 
                icon={DollarSign} color="text-orange-600" bgColor="bg-orange-100" trend="---" isPositive={true} 
                onClick={() => navigate('/admin/manage-orders')}
            />
            <StatCard 
                title="Vé đã bán" 
                value={stats?.tickets || 0} 
                icon={Ticket} color="text-green-600" bgColor="bg-green-100" trend="---" isPositive={true} 
                onClick={() => navigate('/admin/manage-matches')} // Hoặc manage-orders tùy logic
            />
            <StatCard 
                title="Người dùng" 
                value={stats?.users || 0} 
                icon={Users} color="text-blue-600" bgColor="bg-blue-100" trend="---" isPositive={true} 
                onClick={() => navigate('/admin/manage-users')} // Bấm vào đây chuyển sang trang User
            />
            <StatCard 
                title="Tỉ lệ lấp đầy" 
                value="78%" 
                icon={Activity} color="text-purple-600" bgColor="bg-purple-100" trend="---" isPositive={false} 
                onClick={() => navigate('/admin/manage-stadiums')}
            />
        </div>

        {/* 2. BIỂU ĐỒ (DỮ LIỆU THẬT - HIỆN TẠI RỖNG NẾU CHƯA CÓ LỊCH SỬ) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-lg font-bold text-gray-800">Biểu đồ doanh thu</h2><p className="text-xs text-gray-400 mt-1">Dữ liệu thực tế</p></div>
              <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"><MoreHorizontal size={20} /></button>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.revenueChart || []}>
                  <defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}/>
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
              {(!stats?.revenueChart || stats.revenueChart.length === 0) && (
                  <div className="flex justify-center items-center h-full -mt-60 text-gray-400 text-sm">Chưa có dữ liệu lịch sử</div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="mb-6"><h2 className="text-lg font-bold text-gray-800">Vé bán theo ngày</h2><p className="text-xs text-gray-400 mt-1">Dữ liệu thực tế</p></div>
            <div className="h-80 w-full flex-1">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.revenueChart || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="tickets" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
              {(!stats?.revenueChart || stats.revenueChart.length === 0) && (
                  <div className="flex justify-center items-center h-full -mt-60 text-gray-400 text-sm">Chưa có dữ liệu vé</div>
              )}
            </div>
          </div>
        </div>

        {/* 3. BẢNG ĐƠN HÀNG (CÓ PHÂN TRANG) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Đơn đặt vé gần đây</h2>
            <button onClick={() => navigate('/admin/manage-orders')} className="text-blue-600 text-sm font-medium hover:underline">Xem tất cả</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Mã đơn</th>
                  <th className="p-4 font-medium">Khách hàng</th>
                  <th className="p-4 font-medium">Tổng tiền</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentOrders.length > 0 ? (
                    currentOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-blue-600 font-medium">{order.id}</td>
                        <td className="p-4 text-gray-800 font-medium">{order.full_name || "Khách vãng lai"}</td>
                        <td className="p-4 text-gray-800 font-bold">{Number(order.total_amount).toLocaleString()}đ</td>
                        <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border
                                ${order.status === 'PAID' || order.status === 'SUCCESS' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                                ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
                                ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                            `}>
                                {order.status}
                            </span>
                        </td>
                        <td className="p-4 text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                    </tr>
                    ))
                ) : (
                    <tr><td colSpan="5" className="p-6 text-center text-gray-500">Chưa có đơn hàng nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* THANH PHÂN TRANG */}
          {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                      Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, stats?.recentOrders?.length)} trên tổng {stats?.recentOrders?.length} đơn
                  </span>
                  <div className="flex gap-2">
                      <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          <ChevronLeft size={16}/>
                      </button>
                      {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                          <button 
                            key={page} 
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 rounded text-sm font-bold ${currentPage === page ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}
                          >
                              {page}
                          </button>
                      ))}
                      <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          <ChevronRight size={16}/>
                      </button>
                  </div>
              </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default Dashboard;