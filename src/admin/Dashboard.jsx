import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import { useNavigate } from "react-router-dom"; 
import { Users, DollarSign, Ticket, Activity, TrendingUp, TrendingDown, MoreHorizontal, Calendar as CalendarIcon, ChevronDown, Loader2, ChevronLeft, ChevronRight} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar} from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/dashboard/stats`;

// thống kê
const StatCard = ({ title, value, icon: Icon, color, bgColor, trend, isPositive, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 ${bgColor} opacity-20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
    
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <h3 className="text-3xl font-black text-gray-800 mt-2">{value}</h3>
      </div>
      <div className={`p-4 rounded-xl ${bgColor} ${color} shadow-sm group-hover:scale-110 transition-transform`}>
        <Icon size={28} />
      </div>
    </div>

    <div className="mt-4 flex items-center text-sm relative z-10">
      <span className={`flex items-center font-bold ${isPositive ? 'text-green-600' : 'text-red-600'} bg-gray-50 px-2 py-0.5 rounded-md`}>
        {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
        {trend}
      </span>
      <span className="text-gray-400 ml-2 font-medium">so với tháng trước</span>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 
  const [currentDate] = useState(new Date());
  const formattedDate = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(currentDate);

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

  //phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = stats?.recentOrders?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const totalPages = Math.ceil((stats?.recentOrders?.length || 0) / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
    }
  };

  if (loading) return (
      <AdminLayout>
          <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div>
      </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-8 bg-gray-50 min-h-screen font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tổng quan</h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">Theo dõi tình hình kinh doanh hôm nay.</p>
          </div>
          
          <div className="flex items-center bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center px-4 py-2 border-r border-gray-100">
                <CalendarIcon size={18} className="text-blue-600 mr-2"/>
                <span className="text-sm font-bold text-gray-700 capitalize">{formattedDate}</span>
              </div>
              <div className="relative">
                <select className="appearance-none bg-transparent text-sm font-bold text-gray-600 py-2 pl-4 pr-10 focus:outline-none cursor-pointer hover:text-blue-600 transition-colors">
                    <option value="this_month">Tháng này</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"/>
              </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard 
                title="Tổng doanh thu" 
                value={Number(stats?.revenue || 0).toLocaleString() + 'đ'} 
                icon={DollarSign} color="text-green-600" bgColor="bg-green-100" trend="+12.5%" isPositive={true} 
                onClick={() => navigate('/admin/manage-orders')}/>
            <StatCard 
                title="Vé đã bán" 
                value={stats?.tickets || 0} 
                icon={Ticket} color="text-blue-600" bgColor="bg-blue-100" trend="+8.2%" isPositive={true} 
                onClick={() => navigate('/admin/manage-orders')}/>
            <StatCard 
                title="Người dùng mới" 
                value={stats?.users || 0} 
                icon={Users} color="text-purple-600" bgColor="bg-purple-100" trend="+5.3%" isPositive={true} 
                onClick={() => navigate('/admin/manage-users')}/>
            <StatCard 
                title="Sân Vận Động" 
                value="Số lượng" 
                icon={Activity} color="text-orange-600" bgColor="bg-orange-100" trend="-2.1%" isPositive={false} 
                onClick={() => navigate('/admin/manage-stadiums')}/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                  <h2 className="text-lg font-bold text-gray-800">Biểu đồ doanh thu</h2>
                  <p className="text-xs text-gray-400 mt-1 font-medium">Dữ liệu thực tế 7 ngày gần nhất</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-lg transition"><MoreHorizontal size={20} /></button>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.revenueChart || []}>
                  <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} 
                      formatter={(value) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value), "Doanh thu"]}
                      labelStyle={{fontWeight: 'bold', color: '#374151'}}/>
                  <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
              {(!stats?.revenueChart || stats.revenueChart.length === 0) && (
                  <div className="flex justify-center items-center h-full -mt-60 text-gray-400 text-sm font-medium">Chưa có dữ liệu giao dịch gần đây</div>
              )}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
            <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-800">Vé bán theo ngày</h2>
                <p className="text-xs text-gray-400 mt-1 font-medium">Số lượng vé bán ra</p>
            </div>
            <div className="h-80 w-full flex-1">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.revenueChart || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6"/>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dy={5}/>
                  <Tooltip 
                    cursor={{fill: '#F3F4F6'}} 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} 
                    formatter={(value) => [value, "Số lượng bán"]}
                    labelStyle={{fontWeight: 'bold', color: '#374151'}}/>
                  <Bar dataKey="tickets" name="Số lượng bán" fill="#F97316" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
              {(!stats?.revenueChart || stats.revenueChart.length === 0) && (
                  <div className="flex justify-center items-center h-full -mt-60 text-gray-400 text-sm font-medium">Chưa có dữ liệu vé</div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800">Đơn đặt vé gần đây</h2>
            <button onClick={() => navigate('/admin/manage-orders')} className="text-blue-600 text-sm font-bold hover:underline hover:text-blue-700 transition">Xem tất cả</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-5 w-32">Mã đơn</th>
                  <th className="p-5">Khách hàng</th>
                  <th className="p-5">Tổng tiền</th>
                  <th className="p-5 text-center">Trạng thái</th>
                  <th className="p-5 text-right">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentOrders.length > 0 ? (
                    currentOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                        <td className="p-5 font-mono text-blue-600 font-bold text-sm group-hover:text-blue-700 transition">{order.id}</td>
                        <td className="p-5">
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-800 text-sm">{order.full_name || "Khách vãng lai"}</span>
                                <span className="text-xs text-gray-400 font-medium">{order.phone}</span>
                            </div>
                        </td>
                        <td className="p-5 font-bold text-gray-800">{Number(order.total_amount).toLocaleString()}đ</td>
                        <td className="p-5 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm
                                ${order.status === 'PAID' || order.status === 'SUCCESS' ? 'bg-green-50 text-green-700 border-green-100' : ''}
                                ${order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : ''}
                                ${order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-100' : ''}`}>
                                {order.status === 'PAID' ? 'Thành công' : order.status === 'PENDING' ? 'Chờ xử lý' : 'Đã hủy'}
                            </span>
                        </td>
                        <td className="p-5 text-right text-gray-500 text-sm font-medium">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                    </tr>
                    ))
                ) : (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-medium">Chưa có đơn hàng nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                  <span className="text-xs font-medium text-gray-500">
                      Trang {currentPage} / {totalPages}
                  </span>
                  <div className="flex gap-2">
                      <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 bg-white text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
                          <ChevronLeft size={16}/>
                      </button>
                      {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                          <button 
                            key={page} 
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                currentPage === page 
                                ? 'bg-blue-600 text-white shadow-blue-200' 
                                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100' }`}>
                              {page}
                          </button>
                      ))}
                      <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-300 bg-white text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
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