// src/admin/Dashboard.jsx
import { Users, DollarSign, Ticket, Activity } from "lucide-react";

// Component Card thống kê
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border-l-4" style={{ borderColor: color }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color.replace('500', '100')}`} style={{ color: color }}>
        <Icon size={24} />
      </div>
    </div>
    <p className="text-xs mt-3 text-gray-500 flex items-center">
        <Activity size={12} className="mr-1" />
        Tăng 12% so với tháng trước
    </p>
  </div>
);

const Dashboard = () => {
  const stats = [
    { title: "Tổng doanh thu", value: "850,000,000 VND", icon: DollarSign, color: "rgb(234, 88, 12)" }, // Cam
    { title: "Vé đã bán", value: "1,520", icon: Ticket, color: "rgb(22, 163, 74)" }, // Xanh lá
    { title: "Users mới", value: "247", icon: Users, color: "rgb(59, 130, 246)" }, // Xanh dương
    { title: "Trận đấu sắp tới", value: "12", icon: Activity, color: "rgb(217, 119, 6)" }, // Vàng
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Tổng quan Admin</h1>
      
      {/* Hàng Card thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Biểu đồ/Bảng dữ liệu */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Doanh thu theo tuần</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {/* Nơi thêm biểu đồ (ví dụ: Chart.js hoặc Recharts) */}
          <p>Biểu đồ hiển thị ở đây...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;