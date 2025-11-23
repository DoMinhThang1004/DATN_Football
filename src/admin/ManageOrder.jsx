import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import { 
  Search, 
  Filter, 
  Eye, 
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  X
} from "lucide-react";

// --- 1. MOCK DATA (Cấu trúc giống Database thật) ---
const MOCK_ORDERS = [
  { 
    id: "ORD-001", 
    customerName: "Nguyễn Văn An", 
    email: "an.nguyen@gmail.com",
    phone: "0901234567",
    matchName: "Việt Nam vs Thái Lan",
    bookingDate: "2025-11-18T14:30:00",
    totalAmount: 1500000,
    status: "SUCCESS", // SUCCESS, PENDING, CANCELLED
    paymentMethod: "MOMO",
    tickets: [ // Chi tiết vé trong đơn hàng
        { type: "VIP", price: 500000, quantity: 2, seats: "A1-05, A1-06" },
        { type: "Standard", price: 250000, quantity: 2, seats: "B2-10, B2-11" }
    ]
  },
  { 
    id: "ORD-002", 
    customerName: "Trần Thị Bích", 
    email: "bich.tran@gmail.com",
    phone: "0987654321",
    matchName: "Hà Nội FC vs CAHN",
    bookingDate: "2025-11-19T09:15:00",
    totalAmount: 300000,
    status: "PENDING",
    paymentMethod: "BANK_TRANSFER",
    tickets: [
        { type: "Standard", price: 150000, quantity: 2, seats: "C1-12, C1-13" }
    ]
  },
  { 
    id: "ORD-003", 
    customerName: "Lê Văn Cường", 
    email: "cuong.le@gmail.com",
    phone: "0912345678",
    matchName: "SLNA vs HAGL",
    bookingDate: "2025-11-15T10:00:00",
    totalAmount: 500000,
    status: "CANCELLED",
    paymentMethod: "N/A",
    tickets: [
        { type: "VIP", price: 500000, quantity: 1, seats: "A2-01" }
    ]
  },
];

export default function ManageOrders() {
  // --- STATE ---
  const [orders, setOrders] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null); // State để hiện Modal chi tiết

  // --- GIẢ LẬP API ---
  useEffect(() => {
    // Sau này thay bằng: axios.get('/api/orders')...
    setTimeout(() => {
        setOrders(MOCK_ORDERS);
    }, 500);
  }, []);

  // --- HELPER FUNCTIONS ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200"><CheckCircle size={12}/> Đã thanh toán</span>;
      case 'PENDING':
        return <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200"><Clock size={12}/> Chờ thanh toán</span>;
      case 'CANCELLED':
        return <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200"><XCircle size={12}/> Đã hủy</span>;
      default:
        return status;
    }
  };

  // --- HÀM CẬP NHẬT TRẠNG THÁI (QUAN TRỌNG) ---
  const handleUpdateStatus = (newStatus) => {
    // 1. Cập nhật trong danh sách chính (để bảng bên ngoài đổi màu ngay lập tức)
    const updatedOrders = orders.map(order => 
        order.id === selectedOrder.id ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);

    // 2. Cập nhật object đang mở trong Modal (để UI modal đổi theo)
    setSelectedOrder({ ...selectedOrder, status: newStatus });

    // 3. Log hoặc gọi API (TODO: axios.patch...)
    console.log(`Đã cập nhật đơn ${selectedOrder.id} sang trạng thái: ${newStatus}`);
  };

  // --- FILTER LOGIC ---
  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
        order.id.toLowerCase().includes(searchLower) || 
        order.customerName.toLowerCase().includes(searchLower) ||
        order.phone.includes(searchLower);
    
    const matchStatus = filterStatus === "ALL" || order.status === filterStatus;

    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen font-sans">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
            <p className="text-gray-500 text-sm mt-1">Theo dõi trạng thái đặt vé và doanh thu.</p>
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-all shadow-sm text-sm font-medium">
            <Download size={18} />
            <span>Xuất Excel</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm mã đơn, tên khách, SĐT..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter size={18} className="text-gray-500" />
            <select 
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tất cả đơn hàng</option>
              <option value="SUCCESS">Đã thanh toán</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-100">
                  <th className="p-4 font-semibold">Mã đơn</th>
                  <th className="p-4 font-semibold">Khách hàng</th>
                  <th className="p-4 font-semibold">Trận đấu</th>
                  <th className="p-4 font-semibold">Ngày đặt</th>
                  <th className="p-4 font-semibold">Tổng tiền</th>
                  <th className="p-4 font-semibold text-center">Trạng thái</th>
                  <th className="p-4 font-semibold text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono text-blue-600 font-bold text-sm">{order.id}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-800">{order.customerName}</span>
                            <span className="text-xs text-gray-400">{order.phone}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm max-w-xs truncate" title={order.matchName}>{order.matchName}</td>
                      <td className="p-4 text-sm text-gray-500">{formatDate(order.bookingDate)}</td>
                      <td className="p-4 font-bold text-gray-800">{formatCurrency(order.totalAmount)}</td>
                      <td className="p-4 text-center">{getStatusBadge(order.status)}</td>
                      <td className="p-4 text-right">
                        <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors"
                            title="Xem chi tiết"
                        >
                            <Eye size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                        Không tìm thấy đơn hàng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* --- MODAL CHI TIẾT ĐƠN HÀNG --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Modal Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Chi tiết đơn hàng {selectedOrder.id}</h3>
                        <p className="text-sm text-gray-500">{formatDate(selectedOrder.bookingDate)}</p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                    {/* Thông tin khách hàng & Thanh toán */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Thông tin khách hàng</h4>
                            <p className="font-medium text-gray-800">{selectedOrder.customerName}</p>
                            <p className="text-sm text-gray-600">{selectedOrder.email}</p>
                            <p className="text-sm text-gray-600">{selectedOrder.phone}</p>
                        </div>
                        
                        {/* CỘT THANH TOÁN - ĐÃ SỬA ĐỂ ADMIN CÓ THỂ CẬP NHẬT */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Thanh toán & Trạng thái</h4>
                            <p className="text-sm text-gray-600 mb-3">Phương thức: <span className="font-medium text-gray-800">{selectedOrder.paymentMethod}</span></p>
                            
                            {/* DROPDOWN CẬP NHẬT TRẠNG THÁI */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-400">Cập nhật trạng thái:</label>
                                <select 
                                    value={selectedOrder.status}
                                    onChange={(e) => handleUpdateStatus(e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors
                                        ${selectedOrder.status === 'SUCCESS' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                        ${selectedOrder.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                                        ${selectedOrder.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                    `}
                                >
                                    <option value="PENDING">⏳ Chờ thanh toán</option>
                                    <option value="SUCCESS">✅ Đã thanh toán</option>
                                    <option value="CANCELLED">❌ Đã hủy</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Chi tiết vé */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Danh sách vé đã đặt</h4>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="px-4 py-2">Loại vé</th>
                                        <th className="px-4 py-2">Vị trí ghế</th>
                                        <th className="px-4 py-2 text-right">Giá vé</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {selectedOrder.tickets.map((ticket, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-2 font-medium">{ticket.type} (x{ticket.quantity})</td>
                                            <td className="px-4 py-2 text-blue-600">{ticket.seats}</td>
                                            <td className="px-4 py-2 text-right">{formatCurrency(ticket.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 font-bold text-gray-800">
                                    <tr>
                                        <td colSpan="2" className="px-4 py-3 text-right">Tổng cộng:</td>
                                        <td className="px-4 py-3 text-right text-blue-600 text-lg">{formatCurrency(selectedOrder.totalAmount)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                    <button 
                        onClick={() => setSelectedOrder(null)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                    >
                        Đóng
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium shadow-sm transition-colors">
                        <Printer size={16} />
                        In vé / Hóa đơn
                    </button>
                </div>
            </div>
        </div>
      )}
    </AdminLayout>
  );
}