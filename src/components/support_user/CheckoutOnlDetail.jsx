import React from "react";
import { CheckCircle, Wallet, Edit2, Ticket, Copy, QrCode, MapPin, Clock, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function InvoiceModal({ orderResult }) {
  if (!orderResult) return null;

  //copy
  const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      alert("Đã sao chép số tài khoản!");
  };


  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 mt-8 animate-fadeIn">
        <div className="bg-red-800 text-white p-8 text-center relative overflow-hidden">
            <div className="relative z-10">
                <div className="w-20 h-20 bg-white text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CheckCircle size={48} strokeWidth={3} />
                </div>
                <h2 className="text-3xl font-bold mb-2">Thanh toán thành công!</h2>
                <p className="opacity-90 text-lg">Cảm ơn bạn đã đặt vé tại FootballTic.</p>
                <p className="mt-4 text-sm bg-gray-700 inline-block px-4 py-1 rounded-full font-mono border border-gray-500">
                    Mã đơn: {orderResult.orderId}
                </p>
            </div>
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        <div className="p-8">
            
            {/* thông tin ck (vnpay/momo) */}
            {(orderResult.paymentMethod === 'BANK_QR' || orderResult.paymentMethod === 'MOMO') && (
                <div className="mb-8 bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <h3 className="font-bold text-blue-800 text-lg mb-4 flex items-center gap-2">
                        <Wallet size={20}/> Thông tin giao dịch đã ghi nhận
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-blue-600 mb-1">Ngân hàng / Ví thụ hưởng</p>
                            <p className="font-bold text-gray-800 text-lg">{orderResult.paymentMethod === 'MOMO' ? 'Ví MoMo' : MOCK_BANK_INFO.bankName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 mb-1">Chủ tài khoản</p>
                            <p className="font-bold text-gray-800 text-lg">{MOCK_BANK_INFO.accountName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 mb-1">Số tài khoản / SĐT</p>
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-gray-800 text-lg">{MOCK_BANK_INFO.accountNumber}</p>
                                <button onClick={() => copyToClipboard(MOCK_BANK_INFO.accountNumber)} className="text-blue-500 hover:text-blue-700"><Copy size={16}/></button>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 mb-1">Số tiền đã thanh toán</p>
                            <p className="font-bold text-red-600 text-xl">{orderResult.totalAmount.toLocaleString()}đ</p>
                        </div>
                    </div>
                </div>
            )}

            {/* tt khách hàng */}
            <div className="mb-8">
                <h3 className="font-bold text-gray-800 border-b border-gray-900 pb-2 mb-4 flex items-center gap-2">
                    <Edit2 size={18}/> Thông tin khách hàng
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Người đặt vé:</p>
                        <p className="font-medium">{orderResult.user?.full_name}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Số điện thoại:</p>
                        <p className="font-medium">{orderResult.user?.phone}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Email nhận vé:</p>
                        <p className="font-medium">{orderResult.user?.email}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Hình thức nhận:</p>
                        <p className="font-medium text-blue-600">
                            {orderResult.deliveryMethod === 'eticket' ? 'Vé điện tử (QR qua Email)' : 'Giao vé tận nơi'}
                        </p>
                    </div>
                    {orderResult.shippingAddress && (
                        <div className="col-span-2 mt-2 bg-gray-50 p-3 rounded-lg">
                            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Địa chỉ giao hàng:</p>
                            <p>{orderResult.shippingAddress.receiverName} - {orderResult.shippingAddress.receiverPhone}</p>
                            <p className="text-gray-600">{orderResult.shippingAddress.detail}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* chi tiết vé */}
            <div className="mb-8">
                <h3 className="font-bold text-gray-800 border-b border-gray-800 pb-2 mb-4 flex items-center gap-2">
                    <Ticket size={18}/> Chi tiết vé đã mua
                </h3>
                <div className="space-y-3">
                    {orderResult.items && orderResult.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-200 p-4 rounded-xl border border-gray-900">
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{item.ticketName}</p>
                                <p className="text-xs text-gray-500">Khu vực: {item.zoneName}</p>
                            </div>
                            <div className="text-right">
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded mb-1 inline-block">
                                    Ghế: {item.seatNumber}
                                </span>
                                <p className="text-sm font-medium text-gray-600">{item.price.toLocaleString()}đ</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-gray-100">
                <Link to="/" className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 text-center transition flex items-center justify-center gap-2">
                    <Home size={18}/> Về trang chủ
                </Link>
                <Link to="/profile/tickets" className="px-8 py-3 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-700 text-center shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2">
                    <QrCode size={18}/> Xem vé & Mã QR
                </Link>
            </div>
        </div>
    </div>
  );
}


