import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Home, RefreshCcw } from 'lucide-react';
import InvoiceModal from "../../components/support_user/CheckoutOnlDetail.jsx";
import UserLayout from "../../layouts/UserLayout.jsx"; 
import emailjs from '@emailjs/browser';

const API_HOST = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = `${API_HOST}/api`;

//cấu hình emailjs
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TICKET_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TICKET_TEMPLATE_ID; 
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY; 

export default function PaymentReturn() {
const [searchParams] = useSearchParams();
const [status, setStatus] = useState("loading"); 
const [orderResult, setOrderResult] = useState(null);

 // chặn ngăn gọi API 2 lần
const isRunRef = useRef(false);

    useEffect(() => {
    const verifyPayment = async () => {
    // nếu chạy tt r thì return
    if (isRunRef.current === true) return;
    isRunRef.current = true; //dánh dấu đã chạy

        try {
    const queryString = searchParams.toString();
        let apiUrl = "";
            if (searchParams.has('vnp_SecureHash')) {
            apiUrl = `${API_BASE}/payment/vnpay_return?${queryString}`;
            } else if (searchParams.has('signature')) {
            apiUrl = `${API_BASE}/payment/momo_return?${queryString}`;
            } else {
        setStatus("failed");
        return;
        }

    const res = await fetch(apiUrl);
        //kiểm tra http status trc khi chạy
            if (!res.ok) { 
                //dừng và báo lỗi
    const errorData = await res.json().catch(() => ({ message: "Lỗi không xác định từ Server." }));
                throw new Error(`Giao dịch thất bại: ${errorData.message || res.statusText}`);
            }

    const data = await res.json(); 
    // chạy trạng thái 
            if (data.code === "00" || data.message?.includes("đã thành công") || data.message?.includes("confirmed")) { 
    
    const orderId = data.orderId || searchParams.get('vnp_TxnRef');
    let successfulOrderLoad = false;
    
    // --- BẮT ĐẦU: KHỐI TẢI CHI TIẾT ĐƠN HÀNG (CẦN CÔ LẬP) ---
    try {
        const orderRes = await fetch(`${API_BASE}/orders/${orderId}`);
        
        if (orderRes.ok) {
            const orderData = await orderRes.json();
            
            // logoc gửi vé về mail
            try {
                // all thông tin
                const firstTicket = orderData.tickets[0];
                const rawDate = firstTicket?.start_time || new Date();
                const dateObj = new Date(rawDate);
                const timeString = `${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2, '0')} - ${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
                const home = firstTicket?.home_team || "Đội nhà";
                const away = firstTicket?.away_team || "Đội khách";
                const finalMatchName = firstTicket?.match_name || `${home} vs ${away}`;
                const seatList = orderData.tickets.map(t => `${t.zone_name} - Ghế ${t.seat_number}`).join('<br/>');
                const qrContent = orderData.id;
                const qrCodeUrl = `https://quickchart.io/qr?text=${qrContent}&size=300`;

                const templateParams = {
                    to_name: orderData.full_name, email: orderData.email, match_name: finalMatchName, time_show: timeString, 
                    ticket_id: "Đơn: " + orderData.id, seat_info: seatList, stadium: firstTicket?.stadium_name || "Sân vận động Thống Nhất", qr_link: qrCodeUrl
                };
                emailjs.send(SERVICE_ID, TICKET_TEMPLATE_ID, templateParams, PUBLIC_KEY).catch((err) => console.error("Lỗi gửi mail:", err));
            } catch (emailErr) {
                console.error("Lỗi logic email:", emailErr);
            }

            // fdormat dữ liệu hiển thị hóa đơn (giữ nguyên)
            const formattedResult = {
                orderId: orderData.id, totalAmount: Number(orderData.total_amount),
                paymentMethod: orderData.payment_method === 'MOMO' ? 'Ví MoMo' : 'VNPAY', deliveryMethod: "eticket", 
                user: { full_name: orderData.full_name, email: orderData.email, phone: orderData.phone },
                items: orderData.tickets.map(t => ({
                    ticketName: t.ticket_type_name, zoneName: t.zone_name, seatNumber: t.seat_number, price: Number(t.price)
                })),
                shippingAddress: null
            };
            
            setOrderResult(formattedResult);
            successfulOrderLoad = true; // Đánh dấu thành công
            
        } else {
            // lỗi  http từ api hay đơn hàng
            console.error("Lỗi HTTP khi tải chi tiết đơn hàng:", orderRes.status);
            // successfulOrderLoad vẫn là false
        }
    } catch (orderError) {
        // lỗi mạng hay json khi tải chi tiết đơn hàng
        console.error("Lỗi mạng/JSON khi tải chi tiết đơn hàng:", orderError);
        // successfulOrderLoad vẫn là false
    }
    
    // status hiển thị
    if (successfulOrderLoad) {
        setStatus("success"); // hiển thị chi tiết vé
    } else {
        setStatus("success_no_data"); // chạy lên thành công nhưng không tải được chi tiết
    }

    } else {
        // k chạy nx vì đã xử lý lỗi (lỗi trả về từ Backend)
        setStatus("failed");
    }          
        } catch (error) {
            console.error("Lỗi xác thực giao dịch:", error);
            setStatus("failed"); // // hiển thị giao dịch thất bại
        }
    };
        if (searchParams.toString()) {
        verifyPayment();
        }
          }, [searchParams]);

  return (
    <UserLayout>
        <div className="min-h-screen bg-gray-50 font-sans py-12 px-4 flex flex-col items-center justify-center">
            
            {status === "loading" && (
                <div className="text-center py-20">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48}/>
                    <h2 className="text-xl font-bold text-gray-700">Đang xác thực giao dịch...</h2>
                    <p className="text-gray-500 mt-2">Vui lòng không tắt trình duyệt.</p>
                </div>
            )}

            {status === "success" && orderResult && (
                <div className="w-full max-w-4xl animate-in fade-in zoom-in duration-500">
                     
                     {/* tb vé gửi mail*/}
                     <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center max-w-lg mx-auto shadow-sm">
                        <p className="text-green-800 font-bold flex items-center justify-center gap-2 text-lg">
                            <CheckCircle size={24} className="text-green-600"/> 
                            Vé điện tử (QR Code) đã được gửi tới email của bạn!
                        </p>
                        <p className="text-green-600 text-sm mt-1">Vui lòng kiểm tra hộp thư (cả mục Spam/Rác) để nhận vé.</p>
                    </div>

                     {/* chi tiết hóa đơn */}
                     <InvoiceModal orderResult={orderResult} />
                     
                     <div className="text-center mt-8">
                    </div>
                </div>
            )}

            {status === "success_no_data" && (
                <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl text-center">
                    <CheckCircle className="text-green-600 mx-auto mb-4" size={48}/>
                    <h2 className="text-2xl font-bold mb-2">Thanh toán thành công!</h2>
                    <p className="text-gray-600 mb-6">Giao dịch thành công nhưng chưa tải được chi tiết đơn hàng.</p>
                    <Link to="/profile/tickets" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Xem vé của tôi</Link>
                </div>
            )}

            {status === "failed" && (
                <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl text-center border border-red-100">
                    <XCircle className="text-red-600 mx-auto mb-4" size={64}/>
                    <h2 className="text-2xl font-bold mb-2">Giao dịch thất bại</h2>
                    <p className="text-gray-600 mb-6">Không thể xác thực giao dịch hoặc giao dịch đã bị hủy.</p>
                    <div className="flex gap-3 justify-center">
                        <Link to="/" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold">Trang chủ</Link>
                        <Link to="/cart" className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold">Thử lại</Link>
                    </div>
                </div>
            )}
        </div>
    </UserLayout>
  );
}