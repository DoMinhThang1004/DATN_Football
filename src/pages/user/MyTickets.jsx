import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, QrCode, Download, X, Ticket, CheckCircle, Ban, AlertCircle, Loader2, ChevronRight, Truck, CreditCard, AlertTriangle, ArrowLeft, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import { useCart } from "../../context/CartContext.jsx"; 
import OrderDetailModal from "../../components//support_user/OderDetailModel.jsx"; 

const API_BASE = "http://localhost:5000/api";
const API_ORDER = `${API_BASE}/orders`;

const CANCEL_REASONS = [
    "Thay đổi kế hoạch cá nhân",
    "Đặt nhầm số lượng vé",
    "Đặt nhầm trận đấu",
    "Tìm thấy giá tốt hơn",
    "Khác"
];

export default function MyTickets() {
    //state
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart(); 

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); 
  const [user, setUser] = useState(null);

  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  
  // state cho model cảnh báo ghế đã mua
  const [unavailableSeatsModal, setUnavailableSeatsModal] = useState({ isOpen: false, seats: [], matchId: null });

  // state xác nhận mua lại
  const [reorderModalOpen, setReorderModalOpen] = useState(false);
  const [orderToReorderId, setOrderToReorderId] = useState(null);

  const [notification, setNotification] = useState(null);

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchOrders = async () => {
        const storedUser = localStorage.getItem("currentUser");
        if (!storedUser) { setLoading(false); return; }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        try {
            const res = await fetch(`${API_ORDER}/user/${parsedUser.id}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Lỗi tải đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

  useEffect(() => { fetchOrders(); }, []);
  const openCancelModal = (order) => {
      setOrderToCancel(order);
      setCancelReason("");
      setOtherReason("");
      setCancelModalOpen(true);
  };

  const submitCancelOrder = async () => {
      if (!cancelReason) {
          showNotification("Vui lòng chọn lý do hủy!", "error");
          return;
      }
      const finalReason = cancelReason === "Khác" ? otherReason : cancelReason;
      if (!finalReason.trim()) {
          showNotification("Vui lòng nhập lý do chi tiết!", "error");
          return;
      }
      try {
          const res = await fetch(`${API_ORDER}/cancel/${orderToCancel.id}`, { 
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reason: finalReason }) 
          });

          if (res.ok) {
              showNotification("Đã hủy đơn hàng thành công!");
              setCancelModalOpen(false);
              fetchOrders(); 
          } else {
              const err = await res.json();
              showNotification(err.message || "Không thể hủy đơn hàng này", "error");
          }
      } catch (error) {
          showNotification("Lỗi kết nối!", "error");
      }
  };

  // bấm nút mua lại thì mở modal
  const handleReOrderClick = (orderId) => {
      setOrderToReorderId(orderId);
      setReorderModalOpen(true);
  };

  //xử lý mua lại sau khi đồng ý
  const confirmReOrder = async () => {
      setReorderModalOpen(false); // đóng modal
      const orderId = orderToReorderId;

      try {
          const res = await fetch(`${API_ORDER}/${orderId}`);
          if (!res.ok) throw new Error("Không lấy được thông tin đơn hàng");
          
          const orderData = await res.json();
          const oldTickets = orderData.tickets;

          if (!oldTickets || oldTickets.length === 0) {
              showNotification("Đơn hàng này không còn vé để mua lại.", "error");
              return;
          }

          // kiểm tra từng vé xem còn trống không
          const itemsToAdd = [];
          const unavailableSeats = [];
          
          for (const ticket of oldTickets) {
              const occupiedRes = await fetch(`${API_BASE}/tickets/occupied/${ticket.match_config_id}`);
              if (occupiedRes.ok) {
                  const occupiedSeats = await occupiedRes.json(); 
                  
                  if (occupiedSeats.includes(ticket.seat_number)) {
                      unavailableSeats.push(`${ticket.seat_number} - ${ticket.ticket_type_name}`);
                  } else {
                      itemsToAdd.push({
                          id: `${ticket.match_config_id}-${ticket.seat_number}`, 
                          matchId: ticket.match_id,
                          matchName: `${ticket.home_team} vs ${ticket.away_team}`,
                          matchTime: ticket.start_time,
                          stadium: ticket.stadium_name,
                          image: ticket.banner_url || ticket.home_logo,
                          configId: ticket.match_config_id,
                          ticketName: ticket.ticket_type_name,
                          zoneName: ticket.zone_name,
                          price: Number(ticket.price),
                          color: "#3B82F6", 
                          seatNumber: ticket.seat_number
                      });
                  }
              }
          }

          //xử lý kq
          if (unavailableSeats.length > 0) {
              // hiện modal cảnh báo ghế đã mất
              setUnavailableSeatsModal({
                  isOpen: true,
                  seats: unavailableSeats,
                  matchId: oldTickets[0].match_id 
              });
          } else {
              // all ghế trống = Thêm vào giỏ = Chuyển trang
              clearCart(); 
              addToCart(itemsToAdd); 
              navigate('/checkout'); 
              setTimeout(() => showNotification("Đã thêm vé vào giỏ hàng! Vui lòng thanh toán ngay.", "info"), 100);
          }

      } catch (error) {
          console.error(error);
          showNotification("Có lỗi xảy ra khi kiểm tra vé. Vui lòng thử lại sau.", "error");
      }
  };
  const filteredOrders = orders.filter(o => {
      if (filter === 'ALL') return true;
      return o.status === filter;
  });
  const getStatusBadge = (status) => {
      switch (status) {
          case 'PAID': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Đã thanh toán</span>;
          case 'PENDING': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">Chờ thanh toán</span>;
          case 'SHIPPING': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">Đang giao</span>;
          case 'DELIVERED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">Đã giao</span>;
          case 'CANCELLED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Đã hủy</span>;
          default: return status;
      }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[600px] flex flex-col relative">
      {notification && (
        <div className={`fixed top-24 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-green-600' : notification.type === 'info' ? 'bg-blue-600' : 'bg-red-600'}`}>
            {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
            <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="text-blue-600"/> Lịch sử mua vé
            </h2>
            <button 
                onClick={() => navigate('/')} 
                className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium transition-colors">
                <ArrowLeft size={18}/> Về trang chủ
            </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
            {['ALL', 'PENDING', 'PAID', 'CANCELLED'].map(st => (
                <button 
                    key={st}
                    onClick={() => setFilter(st)} 
                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${filter === st ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {st === 'ALL' ? 'Tất cả' : st === 'PENDING' ? 'Chờ thanh toán' : st === 'PAID' ? 'Đã thanh toán' : 'Đã hủy'}
                </button>
            ))}
        </div>
      </div>

      {/* ds order*/}
      <div className="p-6 flex-1">
        {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600"/></div>
        ) : filteredOrders.length > 0 ? (
            <div className="space-y-4">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-all bg-white">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-mono font-bold text-lg text-gray-800">{order.id}</span>
                                    {getStatusBadge(order.status)}
                                </div>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <Calendar size={14}/> {new Date(order.created_at).toLocaleString('vi-VN')}
                                    <span className="text-gray-300">|</span>
                                    {order.payment_method === 'COD' ? <Truck size={14}/> : <CreditCard size={14}/>} {order.payment_method === 'COD' ? 'Thanh toán khi nhận' : 'Chuyển khoản'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Tổng tiền</p>
                                <p className="text-xl font-black text-red-600">{Number(order.total_amount).toLocaleString()}đ</p>
                            </div>
                        </div>

                        {/* ghi chú cho tt */}
                        {order.status === 'PENDING' && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex items-start gap-3 text-sm text-yellow-800">
                                <AlertCircle size={16} className="mt-0.5 shrink-0"/>
                                <div>
                                    <p className="font-bold">Đơn hàng đang chờ xử lý</p>
                                    <p className="text-xs mt-1 text-yellow-700">
                                        {order.payment_method === 'COD' 
                                            ? "Chúng tôi sẽ sớm liên hệ để xác nhận giao vé. Vui lòng chú ý điện thoại." 
                                            : "Vui lòng hoàn tất thanh toán để hệ thống xuất vé."}
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                            {/* nút mua lại chỉ hiện khi đã hủy*/}
                            {order.status === 'CANCELLED' && (
                                <button 
                                    // GỌI HÀM MỚI ĐỂ MỞ MODAL
                                    onClick={() => handleReOrderClick(order.id)}
                                    className="px-4 py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition flex items-center gap-2">
                                    <RefreshCcw size={16}/> Mua lại
                                </button>
                            )}

                            {(order.status === 'PENDING') && (
                                <button 
                                    onClick={() => openCancelModal(order)}
                                    className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition">
                                    Hủy đơn hàng
                                </button>
                            )}

                            <button 
                                onClick={() => setSelectedOrderId(order.id)}
                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition flex items-center gap-2">
                                Xem chi tiết <ChevronRight size={16}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20 border-2 border-dashed border-gray-100 rounded-xl">
                <Ticket size={48} className="mb-4 opacity-20"/>
                <p>Chưa có đơn hàng nào trong mục này.</p>
            </div>
        )}
      </div>

      {/* Modal Hủy */}
      {cancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Lý do hủy đơn hàng</h3>
                      <button onClick={() => setCancelModalOpen(false)}><X size={20} className="text-gray-400 hover:text-black"/></button>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                      {CANCEL_REASONS.map((reason) => (
                          <label key={reason} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${cancelReason === reason ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                              <input 
                                  type="radio" ame="cancelReason" 
                                  className="w-4 h-4 text-red-600 accent-red-600"
                                  checked={cancelReason === reason} onChange={() => setCancelReason(reason)}/>
                              <span className="ml-3 text-sm font-medium">{reason}</span>
                          </label>
                      ))}
                  </div>

                  {cancelReason === "Khác" && (
                      <textarea 
                          className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none mb-4"
                          rows="3"placeholder="Nhập lý do chi tiết..."
                          value={otherReason} onChange={(e) => setOtherReason(e.target.value)}></textarea>
                  )}
                  <div className="flex gap-3">
                      <button onClick={() => setCancelModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Đóng</button>
                      <button onClick={submitCancelOrder} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">Xác nhận hủy</button>
                  </div>
              </div>
          </div>
      )}

      {/* modal cảnh báo ghế đã bán */}
      {unavailableSeatsModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl text-center">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={32}/>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Rất tiếc!</h3>
                <p className="text-gray-600 mb-4 text-sm">Các ghế sau đây đã bị người khác mua mất:</p>
                <div className="bg-gray-50 rounded-xl p-3 mb-6 max-h-40 overflow-y-auto text-left border border-gray-200">
                    <ul className="space-y-1 text-sm font-medium text-gray-700">
                        {unavailableSeatsModal.seats.map((s, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span> {s}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setUnavailableSeatsModal({ ...unavailableSeatsModal, isOpen: false })} 
                        className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Đóng
                    </button>
                    <button 
                        onClick={() => navigate(`/matches/${unavailableSeatsModal.matchId}`)} 
                        className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
                        Chọn lại ghế khác
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* xác nhận mua lại */}
      {reorderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCcw size={32}/>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Mua lại</h3>
                <p className="text-gray-600 mb-6 text-sm">
                    Bạn có chắc chắn muốn đặt lại các vé trong đơn hàng này không? Giỏ hàng hiện tại (nếu có) sẽ bị thay thế.
                </p>
                <div className="flex gap-3 justify-center">
                    <button 
                        onClick={() => setReorderModalOpen(false)} 
                        className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"> Hủy
                    </button>
                    <button 
                        onClick={confirmReOrder} 
                        className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg"> Đồng ý
                    </button>
                </div>
            </div>
        </div>
      )}
      {selectedOrderId && (<OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />)}

    </div>
  );
}