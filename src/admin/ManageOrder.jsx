import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import { 
  Search, Filter, Eye, Download, CheckCircle, XCircle, 
  Clock, Printer, X, Loader2, AlertTriangle, ChevronLeft, ChevronRight 
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  
  // model chi tiết
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [notification, setNotification] = useState(null);

  //phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;// sl mỗi trang

  // hàm hiển thị thông báo
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID': // đã thanh toán
      case 'SUCCESS':
        return <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200"><CheckCircle size={12}/> Đã thanh toán</span>;
      case 'PENDING':// chờ thanh toán
        return <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200"><Clock size={12}/> Chờ thanh toán</span>;
      case 'CANCELLED':// đã hủy
        return <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200"><XCircle size={12}/> Đã hủy</span>;
      default:
        return status;
    }
  };

  //db tải đơn hàng
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (!res.ok) throw new Error("Lỗi kết nối Server");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
      showNotification("Không thể tải danh sách đơn hàng!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  //xem chi tiết đơn hàng
  const handleViewDetail = async (orderId) => {
      setIsLoadingDetail(true);
      try {
          const res = await fetch(`${API_BASE}/orders/${orderId}`);
          if (res.ok) {
              const data = await res.json();
              setSelectedOrder(data); 
          } else {
              showNotification("Không tìm thấy chi tiết đơn hàng", "error");
          }
      } catch (error) {
          console.error(error);
          showNotification("Lỗi tải chi tiết", "error");
      } finally {
          setIsLoadingDetail(false);
      }
  };

  //cập nhật trạng thái đơn
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder) return;
    
    try {
        const res = await fetch(`${API_BASE}/orders/${selectedOrder.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            showNotification(`Đã cập nhật trạng thái thành: ${newStatus}`);
            
            // cập nhật ui modal
            setSelectedOrder({ ...selectedOrder, status: newStatus });
            
            // Ccp nhật ui danh sách
            setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
        } else {
            showNotification("Lỗi khi cập nhật trạng thái", "error");
        }
    } catch (error) {
        showNotification("Lỗi kết nối Server", "error");
    }
  };

  //lọc đơn hàng theo tìm kiếm và trạng thái
  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
        order.id.toLowerCase().includes(searchLower) || 
        (order.full_name && order.full_name.toLowerCase().includes(searchLower)) ||
        (order.phone && order.phone.includes(searchLower));
    
    const matchStatus = filterStatus === "ALL" || order.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // reset trang khi thay đổi tìm kiếm hoặc lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  //tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen font-sans relative">
        {notification && (
            <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                <span className="font-medium">{notification.message}</span>
            </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
            <p className="text-gray-500 text-sm mt-1">
                Tổng số: <span className="font-bold text-blue-600">{filteredOrders.length}</span> đơn hàng
            </p>
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-all shadow-sm text-sm font-medium">
            <Download size={18} />
            <span>Xuất Excel</span>
          </button>
        </div>
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
              value={filterStatus}onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="ALL">Tất cả đơn hàng</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
            <div className="flex-1 overflow-x-auto">
            {isLoading ? (
                <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-600" size={40}/></div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-100">
                        <th className="p-4 font-semibold w-32">Mã đơn</th>
                        <th className="p-4 font-semibold">Khách hàng</th>
                        <th className="p-4 font-semibold">Ngày đặt</th>
                        <th className="p-4 font-semibold">Tổng tiền</th>
                        <th className="p-4 font-semibold text-center">Trạng thái</th>
                        <th className="p-4 font-semibold text-right">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                        {currentOrders.length > 0 ? (
                        currentOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-mono text-blue-600 font-bold text-sm">{order.id}</td>
                            <td className="p-4">
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-800">{order.full_name || "Khách vãng lai"}</span>
                                    <span className="text-xs text-gray-400">{order.phone}</span>
                                </div>
                            </td>
                            <td className="p-4 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                            <td className="p-4 font-bold text-gray-800">{formatCurrency(order.total_amount)}</td>
                            <td className="p-4 text-center">{getStatusBadge(order.status)}</td>
                            <td className="p-4 text-right">
                                <button 
                                    onClick={() => handleViewDetail(order.id)}
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
                            <td colSpan="6" className="p-8 text-center text-gray-500">
                                Không tìm thấy đơn hàng nào.
                            </td>
                        </tr>
                        )}
                    </tbody>
                </table>
            )}
            </div>

            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                    <span className="text-xs text-gray-500">
                        Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredOrders.length)} của {filteredOrders.length} đơn hàng
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)} 
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <ChevronLeft size={16}/>
                        </button>

                        {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                            <button key={page} onClick={() => handlePageChange(page)} className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                                    currentPage === page 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                }`}>
                                {page}
                            </button>
                        ))}

                        <button 
                            onClick={() => handlePageChange(currentPage + 1)} 
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <ChevronRight size={16}/>
                        </button>
                    </div>
                </div>
            )}
        </div>

      </div>

      {/* ct đơn hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Chi tiết đơn {selectedOrder.id}</h3>
                        <p className="text-sm text-gray-500">{formatDate(selectedOrder.created_at)}</p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* tt kh thanh toán*/}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <h4 className="text-sm font-bold text-blue-800 uppercase mb-3">Thông tin khách hàng</h4>
                            <p className="font-medium text-gray-800 mb-1">{selectedOrder.full_name}</p>
                            <p className="text-sm text-gray-600 mb-1">Email: {selectedOrder.email}</p>
                            <p className="text-sm text-gray-600">SĐT: {selectedOrder.phone}</p>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Thanh toán & Trạng thái</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Phương thức: <span className="font-bold">{selectedOrder.payment_method}</span>
                            </p>
                            
                            {/* drop cập nhật tt */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-400 font-semibold uppercase">Cập nhật trạng thái:</label>
                                <select 
                                    value={selectedOrder.status}
                                    onChange={(e) => handleUpdateStatus(e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors
                                        ${selectedOrder.status === 'PAID' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                                        ${selectedOrder.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                                        ${selectedOrder.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                                    `}
                                >
                                    <option value="PENDING">⏳ Chờ thanh toán</option>
                                    <option value="PAID">✅ Đã thanh toán</option>
                                    <option value="CANCELLED">❌ Đã hủy</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ct vé*/}
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Danh sách vé đã đặt</h4>
                        <div className="border rounded-lg overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-600 font-semibold">
                                    <tr>
                                        <th className="px-4 py-3">Trận đấu</th>
                                        <th className="px-4 py-3">Loại vé</th>
                                        <th className="px-4 py-3">Vị trí ghế</th>
                                        <th className="px-4 py-3 text-right">Giá vé</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {selectedOrder.tickets && selectedOrder.tickets.map((ticket, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-gray-800">{ticket.home_team} vs {ticket.away_team}</div>
                                                <div className="text-xs text-gray-500">{ticket.stadium_name}</div>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-blue-600">
                                                {ticket.ticket_type_name} <br/>
                                                <span className="text-gray-500 text-xs font-normal">{ticket.zone_name}</span>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-gray-800">{ticket.seat_number}</td>
                                            <td className="px-4 py-3 text-right font-medium">{formatCurrency(ticket.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 font-bold text-gray-800 border-t border-gray-200">
                                    <tr>
                                        <td colSpan="3" className="px-4 py-4 text-right text-gray-600">Tổng tiền:</td>
                                        <td className="px-4 py-4 text-right text-red-600 text-xl">{formatCurrency(selectedOrder.total_amount)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                    <button 
                        onClick={() => setSelectedOrder(null)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                    >
                        Đóng
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium shadow-sm transition-colors">
                        <Printer size={16} />
                        In hóa đơn
                    </button>
                </div>
            </div>
        </div>
      )}
    </AdminLayout>
  );
}