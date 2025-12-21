import React, { useEffect, useState } from "react";
import { X, Calendar, MapPin, Ticket, CreditCard, User, Phone, Mail, QrCode, AlertCircle, CheckCircle, Clock } from "lucide-react";
import QRCode from "react-qr-code";

const API_HOST = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_ORDER = `${API_HOST}/api/orders`;

export default function OrderDetailModal({ orderId, onClose }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const res = await fetch(`${API_ORDER}/${orderId}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                }
            } catch (error) {
                console.error("Lỗi tải chi tiết đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrderDetail();
    }, [orderId]);

    if (!orderId) return null;

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PAID': return { text: "Thanh toán thành công", color: "text-green-600", bg: "bg-green-50", icon: <CheckCircle size={16}/> };
            case 'PENDING': return { text: "Chờ thanh toán", color: "text-yellow-600", bg: "bg-yellow-50", icon: <Clock size={16}/> };
            case 'CANCELLED': return { text: "Đã hủy", color: "text-red-600", bg: "bg-red-50", icon: <X size={16}/> };
            case 'FAILED': return { text: "Thanh toán thất bại", color: "text-red-600", bg: "bg-red-50", icon: <AlertCircle size={16}/> };
            default: return { text: status, color: "text-gray-600", bg: "bg-gray-50", icon: null };
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
                <div className="flex justify-between items-center p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Ticket className="text-blue-600"/> Chi tiết đơn hàng
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
                        <X size={24}/>
                    </button>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-gray-500">Đang tải thông tin...</div>
                ) : order ? (
                    <div className="p-6 space-y-6">
                        <div className={`p-4 rounded-xl flex items-center justify-between ${getStatusInfo(order.status).bg}`}>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Mã đơn hàng</p>
                                <p className="text-lg font-mono font-bold text-gray-800">#{order.id}</p>
                            </div>
                            <div className={`flex items-center gap-2 font-bold ${getStatusInfo(order.status).color}`}>
                                {getStatusInfo(order.status).icon}
                                <span>{getStatusInfo(order.status).text}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-4">
                                <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2">Thông tin vé</h4>
                                {order.tickets && order.tickets.map((ticket, index) => (
                                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <p className="font-bold text-gray-900 text-sm mb-1">{ticket.match_name || "Vé Bóng Đá"}</p>
                                        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                            <span className="bg-white px-2 py-1 rounded border">{ticket.ticket_type_name}</span>
                                            <span className="bg-white px-2 py-1 rounded border">{ticket.zone_name}</span>
                                            <span className="bg-white px-2 py-1 rounded border font-bold text-blue-600">Ghế {ticket.seat_number}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                            <Calendar size={12}/> {new Date(ticket.start_time).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 h-full">
                                {order.status === 'PAID' ? (

                                    <>
                                        <div className="bg-white p-2 rounded-lg shadow-sm mb-2">
                                            <QRCode value={order.id.toString()} size={120} />
                                        </div>
                                        <p className="text-xs text-center text-gray-500 font-medium">Mã check-in vào sân</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Vui lòng bảo mật mã này</p>
                                    </>
                                ) : (
                                    <div className="text-center py-4 opacity-60">
                                        <div className="bg-gray-200 w-24 h-24 rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <QrCode size={32} className="text-gray-400"/>
                                        </div>
                                        <p className={`text-xs font-bold mb-1 ${order.status === 'PENDING' ? 'text-yellow-600' : 'text-red-500'}`}>
                                            {order.status === 'PENDING' ? 'Chưa thanh toán' : 'Vé không khả dụng'}
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                            {order.status === 'PENDING' 
                                                ? "Vui lòng thanh toán để nhận mã QR" 
                                                : "Đơn hàng đã bị hủy hoặc thất bại"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 text-sm">Thông tin khách hàng</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p className="flex items-center gap-2"><User size={14}/> {order.full_name}</p>
                                    <p className="flex items-center gap-2"><Phone size={14}/> {order.phone}</p>
                                    <p className="flex items-center gap-2"><Mail size={14}/> {order.email}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 text-sm">Thanh toán</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p className="flex items-center justify-between">
                                        <span className="flex items-center gap-2"><CreditCard size={14}/> Phương thức</span>
                                        <span className="font-medium">{order.payment_method === 'MOMO' ? 'Ví MoMo' : order.payment_method === 'VNPAY' ? 'VNPAY' : 'Thanh toán khi nhận vé'}</span>
                                    </p>
                                    <p className="flex items-center justify-between">
                                        <span>Tổng tiền</span>
                                        <span className="font-bold text-red-600 text-lg">{Number(order.total_amount).toLocaleString()}đ</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="p-10 text-center text-gray-500">Không tìm thấy đơn hàng.</div>
                )}
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}