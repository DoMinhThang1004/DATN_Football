import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Home, RefreshCcw, Mail, ArrowRight } from 'lucide-react';
import InvoiceModal from "../../components/support_user/CheckoutOnlDetail.jsx";
import UserLayout from "../../layouts/UserLayout.jsx"; 
import emailjs from '@emailjs/browser';

const API_HOST = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = `${API_HOST}/api`;

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TICKET_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TICKET_TEMPLATE_ID; 
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY; 

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); 
  const [orderResult, setOrderResult] = useState(null);
  
  // chặn gọi api 2 lần
  const isRunRef = useRef(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (isRunRef.current === true) return;
      isRunRef.current = true;

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
        
        //check status http
        if (!res.ok) { 
            const errorData = await res.json().catch(() => ({ message: "Lỗi không xác định từ Server." }));
            throw new Error(`Giao dịch thất bại: ${errorData.message || res.statusText}`);
        }

        const data = await res.json(); 

        if (data.code === "00" || data.message?.includes("đã thành công") || data.message?.includes("confirmed")) { 
            
            const orderId = data.orderId || searchParams.get('vnp_TxnRef');
            
            //lấy ct dh
            const orderRes = await fetch(`${API_BASE}/orders/${orderId}`);
            if (orderRes.ok) {
                const orderData = await orderRes.json();
                
                //logic gửi mail
                try {
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
                        to_name: orderData.full_name, 
                        email: orderData.email, 
                        match_name: finalMatchName, 
                        time_show: timeString, 
                        ticket_id: "Đơn: " + orderData.id, 
                        seat_info: seatList, 
                        stadium: firstTicket?.stadium_name || "Sân vận động Thống Nhất", 
                        qr_link: qrCodeUrl
                    };

                    emailjs.send(SERVICE_ID, TICKET_TEMPLATE_ID, templateParams, PUBLIC_KEY)
                        .catch((err) => console.error("Lỗi gửi mail:", err));
                    
                } catch (emailErr) {
                    console.error("Lỗi logic email:", emailErr);
                }

                //định dạng dl gửi hóa đơn
                const formattedResult = {
                    orderId: orderData.id, 
                    totalAmount: Number(orderData.total_amount),
                    paymentMethod: orderData.payment_method === 'MOMO' ? 'Ví MoMo' : 'VNPAY', 
                    deliveryMethod: "eticket", 
                    user: { full_name: orderData.full_name, email: orderData.email, phone: orderData.phone },
                    items: orderData.tickets.map(t => ({
                        ticketName: t.ticket_type_name, zoneName: t.zone_name, seatNumber: t.seat_number, price: Number(t.price)
                    })),
                    shippingAddress: null
                };

                setOrderResult(formattedResult);
                setStatus("success");
            } else {
                setStatus("success_no_data");
            }
        } else {
            setStatus("failed");
        }

      } catch (error) {
        console.error("Lỗi xác thực giao dịch:", error);
        setStatus("failed");
      }
    };

    if (searchParams.toString()) {
        verifyPayment();
    }
  }, [searchParams]);

  return (
    <UserLayout>
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            {status === "loading" && (
                <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center max-w-md w-full border border-gray-100 animate-in fade-in zoom-in duration-300">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                        <div className="relative bg-blue-50 p-4 rounded-full">
                            <Loader2 className="animate-spin text-blue-600" size={48}/>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-2">Đang xác thực...</h2>
                    <p className="text-gray-500 text-sm">Vui lòng không tắt trình duyệt trong quá trình xử lý giao dịch.</p>
                </div>
            )}
            {status === "success" && orderResult && (
                <div className="w-full max-w-3xl animate-in slide-in-from-bottom-8 fade-in duration-500">
                     <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-2xl p-8 text-center text-white mb-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm mb-4 ring-4 ring-white/10">
                                <CheckCircle size={48} className="text-white" strokeWidth={3} />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Thanh toán thành công!</h1>
                            <p className="text-green-100 text-lg font-medium mb-6">Cảm ơn bạn đã đặt vé tại FootballTic</p>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center gap-3 border border-white/20 max-w-md mx-auto hover:bg-white/20 transition">
                                <div className="bg-white p-2 rounded-lg text-green-600 shadow-sm">
                                    <Mail size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-green-100 uppercase font-bold tracking-wider">Vé điện tử</p>
                                    <p className="text-sm font-medium">Đã gửi tới <span className="font-bold text-white underline decoration-dotted">{orderResult.user.email}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-1">
                            <InvoiceModal orderResult={orderResult} />
                        </div>
                        <div className="bg-gray-50 p-6 flex justify-center border-t border-gray-100">
                             <Link 
                                to="/" 
                                className="group flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-gray-400 hover:-translate-y-1">
                                <Home size={18} className="group-hover:-translate-x-1 transition-transform"/> Quay về trang chủ
                            </Link>
                        </div>
                     </div>
                </div>
            )}
            {status === "success_no_data" && (
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-green-100 animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-600" size={40} strokeWidth={3}/>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
                    <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                        Giao dịch của bạn đã được ghi nhận. Tuy nhiên, hệ thống đang cập nhật dữ liệu. Vui lòng kiểm tra vé trong hồ sơ cá nhân.
                    </p>
                    <Link to="/profile/tickets" className="block w-full bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                        Xem vé của tôi
                    </Link>
                </div>
            )}
            {status === "failed" && (
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-red-100 animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50">
                        <XCircle className="text-red-600" size={40} strokeWidth={3}/>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Giao dịch thất bại</h2>
                    <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                        Rất tiếc, quá trình thanh toán đã bị hủy hoặc xảy ra lỗi. Vui lòng kiểm tra lại hoặc thử phương thức khác.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Link to="/" className="flex-1 px-1 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition flex items-center justify-center gap-1">
                            <Home size={18}/> Trang chủ
                        </Link>
                        <Link to="/cart" className="flex-1 px-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200 flex items-center justify-center gap-1">
                            <RefreshCcw size={18}/> Thử lại
                        </Link>
                    </div>
                </div>
            )}
        </div>
    </UserLayout>
  );
}