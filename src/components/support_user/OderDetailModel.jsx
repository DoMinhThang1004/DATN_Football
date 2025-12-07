import React, { useState, useEffect } from "react";
import { X, MapPin, Clock, Calendar, QrCode, Download, CheckCircle, Ticket } from "lucide-react";
import QRCode from "react-qr-code";

const API_BASE = "http://localhost:5000/api";

export default function OrderDetailModal({ orderId, onClose }) {
  const [orderDetail, setOrderDetail] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null); //vé đang đc xem QR
  const [loading, setLoading] = useState(true);

  //dl chi tiết vé và đơn hàng
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrderDetail(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchDetail();
  }, [orderId]);

  // render qr
  const renderQrCode = (ticket) => {
     if (ticket.status === 'VALID') return <QRCode value={ticket.qr_code_string || ticket.id} size={120} />;
     if (ticket.status === 'USED') return <div className="opacity-50"><QRCode value={ticket.id} size={120} /><p className="text-center font-bold text-green-600 mt-2">ĐÃ SỬ DỤNG</p></div>;
     return <div className="w-[120px] h-[120px] bg-gray-100 flex items-center justify-center text-gray-400 font-bold border-2 border-dashed">ĐÃ HỦY</div>;
  };

  if (!orderId) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
                <h3 className="font-bold text-lg text-gray-900">Chi tiết đơn hàng</h3>
                <p className="text-sm text-gray-500 font-mono">{orderId}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20} className="text-gray-500"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
                <p className="text-center py-10 text-gray-500">Đang tải thông tin vé...</p>
            ) : orderDetail ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div><p className="text-gray-500">Người đặt</p><p className="font-bold">{orderDetail.full_name}</p></div>
                        <div><p className="text-gray-500">Tổng tiền</p><p className="font-bold text-red-600">{Number(orderDetail.total_amount).toLocaleString()}đ</p></div>
                        <div><p className="text-gray-500">Thanh toán</p><p className="font-bold">{orderDetail.payment_method}</p></div>
                        <div><p className="text-gray-500">Trạng thái</p><span className="font-bold">{orderDetail.status}</span></div>
                    </div>
                    <h4 className="font-bold text-gray-800 flex items-center gap-2"><Ticket size={18}/> Danh sách vé ({orderDetail.tickets?.length || 0})</h4>
                    <div className="space-y-3">
                        {orderDetail.tickets && orderDetail.tickets.map((ticket, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedTicket(ticket)} //bấm để xem qr
                                className="border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition cursor-pointer bg-white group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h5 className="font-bold text-gray-900 group-hover:text-blue-600 transition">{ticket.home_team} vs {ticket.away_team}</h5>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                            <MapPin size={12}/> {ticket.stadium_name} 
                                            <span className="text-gray-300">|</span> 
                                            <Clock size={12}/> {new Date(ticket.start_time).toLocaleString('vi-VN')}
                                        </p>
                                        <div className="mt-2 flex gap-2">
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200">{ticket.ticket_type_name}</span>
                                            <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded border border-blue-100 font-bold">Ghế: {ticket.seat_number}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-red-600">{Number(ticket.price).toLocaleString()}đ</p>
                                        {ticket.status === 'VALID' ? <span className="text-xs text-green-600 font-bold">Hợp lệ</span> : <span className="text-xs text-gray-400">Không khả dụng</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-center text-red-500">Không tìm thấy dữ liệu.</p>
            )}
        </div>

        {/* model con xem qr của 1 vé*/}
        {selectedTicket && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-200">
                <button onClick={(e) => { e.stopPropagation(); setSelectedTicket(null); }} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={24}/></button>
                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Vé điện tử - {selectedTicket.seat_number}</h3>
                <div className="bg-white p-6 rounded-3xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 mb-6">
                    {renderQrCode(selectedTicket)}
                </div>
                <div className="text-center space-y-2">
                    <p className="font-mono text-gray-500 text-sm">{selectedTicket.qr_code_string || selectedTicket.id}</p>
                    <p className="text-sm text-gray-600">Vui lòng đưa mã này cho nhân viên soát vé.</p>
                </div>
                {selectedTicket.status === 'VALID' && (
                    <button className="mt-8 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-black transition">
                        <Download size={18}/>
                         Lưu ảnh vé
                    </button>
                )}
            </div>
        )}

      </div>
    </div>
  );
}