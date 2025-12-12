import React, { useState, useEffect } from "react";
import { CreditCard, QrCode, CheckCircle, Edit2, Truck, ChevronLeft, MapPin, Plus, Trash2, X, Save, AlertTriangle, Loader2, Wallet, Ticket, Package } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout.jsx";
import { useCart } from "../../context/CartContext.jsx";
import CheckoutSteps from "../../components/support_user/CheckoutSteps.jsx";
import InvoiceModal from "../../components/support_user/CheckoutOnlDetail.jsx";
import QRCode from "react-qr-code";

const API_HOST = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_BASE = `${API_HOST}/api`;
const API_PAYMENT_VNPAY = `${API_HOST}/api/payment/create_payment_url`;
const API_PAYMENT_MOMO = `${API_HOST}/api/payment/create_momo_url`; 

const VNPAY_LOGO = "https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg";
const MOMO_LOGO = "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png";
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();

  const [currentUser, setCurrentUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState("eticket"); 
  const [paymentMethod, setPaymentMethod] = useState("VNPAY"); 
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAgreed, setIsAgreed] = useState(false); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [finalOrderResult, setFinalOrderResult] = useState(null);
  const [notification, setNotification] = useState(null); 
  
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({ label: 'Nhà riêng', detail: '', receiverName: '', receiverPhone: '' });

  const currentSubtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const currentShippingFee = deliveryMethod === "shipping" ? 30000 : 0;
  const currentTotal = currentSubtotal + currentShippingFee;

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) { navigate("/login"); return; }
    const userObj = JSON.parse(userStr);
    setCurrentUser(userObj);

    if (cartItems.length === 0 && !isSuccess) { navigate("/cart"); return; }

    const fetchAddresses = async () => {
        try {
            const res = await fetch(`${API_BASE}/addresses/user/${userObj.id}`);
            const data = await res.json();
            const mappedAddr = data.map(a => ({
                id: a.id, label: a.label, receiverName: a.receiver_name, receiverPhone: a.receiver_phone, detail: a.detail
            }));
            setAddresses(mappedAddr);
            if (mappedAddr.length > 0) setSelectedAddressId(mappedAddr[0].id);
        } catch (e) {}
    };
    fetchAddresses();
  }, [navigate, cartItems.length, isSuccess]);

  useEffect(() => {
      if (deliveryMethod === 'eticket') {
          if (paymentMethod === 'COD') setPaymentMethod('VNPAY');
      }
  }, [deliveryMethod]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveAddress = async () => {
      if (!addressForm.detail || !addressForm.receiverName || !addressForm.receiverPhone) {
        showNotification("Vui lòng nhập đủ thông tin!", "error");
        return;
      }
      try {
          const payload = {
              user_id: currentUser.id,
              label: addressForm.label,
              receiver_name: addressForm.receiverName,
              receiver_phone: addressForm.receiverPhone,
              detail: addressForm.detail
          };
          const res = await fetch(`${API_BASE}/addresses`, {
              method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
          });
          if (res.ok) {
              const newAddrDB = await res.json();
              const newAddrUI = {
                  id: newAddrDB.id, label: newAddrDB.label, receiverName: newAddrDB.receiver_name, receiverPhone: newAddrDB.receiver_phone, detail: newAddrDB.detail
              };
              setAddresses([newAddrUI, ...addresses]);
              setSelectedAddressId(newAddrDB.id);
              setShowAddressModal(false);
              showNotification("Thêm địa chỉ thành công!");
          }
      } catch (error) { showNotification("Lỗi khi lưu địa chỉ!", "error"); }
  };

  // xl thanh toán
  const handleFinalPayment = async (statusOverride = null) => {
    if (deliveryMethod === 'shipping' && !selectedAddressId) { showNotification("Vui lòng chọn địa chỉ nhận vé!", "error"); return; }
    if (!isAgreed) { showNotification("Vui lòng đồng ý với điều khoản!", "error"); return; }
    
    setIsLoading(true);

    try {
        //đh vs trạng thíaPENDING 
        const orderPayload = {
            user_id: currentUser.id,
            total_amount: currentTotal,
            payment_method: paymentMethod, 
            status: 'PENDING', 
            items: cartItems.map(item => ({ configId: item.configId, seatNumber: item.seatNumber, price: item.price }))
        };

        const res = await fetch(`${API_BASE}/orders`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(orderPayload)
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Đặt vé thất bại");

        // xử lý
        if (paymentMethod === 'VNPAY') {
            try {
                const vnpRes = await fetch(API_PAYMENT_VNPAY, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        amount: currentTotal, 
                        orderId: result.orderId, 
                        orderInfo: `Thanh toan don hang ${result.orderId}` 
                    })
                });
                const vnpData = await vnpRes.json();
                clearCart(); 
                window.location.href = vnpData.paymentUrl;
                return; 
            } catch (vnpError) {
                throw new Error("Không thể kết nối cổng thanh toán VNPAY.");
            }
        }

        // xử lý 
        if (paymentMethod === 'MOMO') {
            try {
                const momoRes = await fetch(API_PAYMENT_MOMO, {
                    method: "POST", 
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        amount: currentTotal, 
                        orderId: result.orderId, 
                        orderInfo: `Thanh toan ve FootballTic` 
                    })
                });
                const momoData = await momoRes.json();
                if (momoData.paymentUrl) {
                    clearCart();
                    window.location.href = momoData.paymentUrl;
                    return;
                } else {
                    throw new Error(momoData.message || "Lỗi tạo link thanh toán MoMo");
                }
            } catch (momoError) {
                throw new Error("Lỗi kết nối MoMo: " + momoError.message);
            }
        }

        // xử lý cod
        const purchasedItems = [...cartItems];
        setFinalOrderResult({
            orderId: result.orderId,
            totalAmount: currentTotal,
            paymentMethod: paymentMethod,
            deliveryMethod: deliveryMethod,
            shippingAddress: deliveryMethod === 'shipping' ? addresses.find(a => a.id === selectedAddressId) : null,
            items: purchasedItems, 
            user: currentUser
        });
        
        setIsSuccess(true);
        clearCart(); 
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error(error);
        showNotification(error.message, "error");
    } finally {
        setIsLoading(false);
    }
  };

  if (isSuccess && finalOrderResult) {
    return (
      <UserLayout>
        <div className="bg-gray-50 min-h-screen py-8">
          <div className="container mx-auto px-4">
            <CheckoutSteps currentStep={3} />
            <InvoiceModal orderResult={finalOrderResult} />
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="bg-gray-50 min-h-screen py-8 relative">
        {notification && <div className={`fixed top-24 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>} <span className="font-medium">{notification.message}</span></div>}
        
        {showAddressModal && (
             <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">Thêm địa chỉ mới</h3><button onClick={() => setShowAddressModal(false)}><X size={20}/></button></div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-sm font-bold text-gray-700">Tên người nhận</label><input type="text" value={addressForm.receiverName} onChange={e => setAddressForm({...addressForm, receiverName: e.target.value})} className="w-full p-2.5 border rounded-lg mt-1 outline-none focus:border-blue-500"/></div>
                            <div><label className="text-sm font-bold text-gray-700">Số điện thoại</label><input type="text" value={addressForm.receiverPhone} onChange={e => setAddressForm({...addressForm, receiverPhone: e.target.value})} className="w-full p-2.5 border rounded-lg mt-1 outline-none focus:border-blue-500"/></div>
                        </div>
                        <div><label className="text-sm font-bold text-gray-700">Địa chỉ chi tiết</label><textarea rows="3" value={addressForm.detail} onChange={e => setAddressForm({...addressForm, detail: e.target.value})} className="w-full p-2.5 border rounded-lg mt-1 outline-none focus:border-blue-500"></textarea></div>
                        <button onClick={handleSaveAddress} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Lưu địa chỉ</button>
                    </div>
                </div>
            </div>
        )}

        <div className="container mx-auto px-4">
            <CheckoutSteps currentStep={2} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3"><Edit2 size={20} className="text-blue-600"/> 1. Thông tin người mua</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100"><p className="text-gray-500 text-xs uppercase mb-1">Họ và tên</p><p className="font-bold text-gray-900">{currentUser?.full_name}</p></div>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100"><p className="text-gray-500 text-xs uppercase mb-1">Số điện thoại</p><p className="font-bold text-gray-900">{currentUser?.phone}</p></div>
                            <div className="md:col-span-2 p-3 bg-gray-50 rounded-lg border border-gray-100"><p className="text-gray-500 text-xs uppercase mb-1">Email nhận vé</p><p className="font-bold text-gray-900">{currentUser?.email}</p></div>
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3"><Truck size={20} className="text-blue-600"/> 2. Hình thức nhận vé</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div onClick={() => setDeliveryMethod("eticket")} className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${deliveryMethod === 'eticket' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}><Ticket size={24} className="text-blue-600"/><div><p className="font-bold text-sm">Vé điện tử (QR)</p><p className="text-xs text-gray-500">Miễn phí - Qua App/Email</p></div></div>
                            <div onClick={() => setDeliveryMethod("shipping")} className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${deliveryMethod === 'shipping' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}><Truck size={24} className="text-orange-500"/><div><p className="font-bold text-sm">Vé cứng (Ship)</p><p className="text-xs text-gray-500">+30.000đ - Tận nhà</p></div></div>
                        </div>
                        {deliveryMethod === 'shipping' && (
                            <div className="mt-4 animate-fadeIn">
                                <div className="flex justify-between items-center mb-3"><label className="block text-sm font-bold text-gray-700">Địa chỉ nhận hàng:</label><button onClick={() => setShowAddressModal(true)} className="text-sm flex items-center gap-1 text-blue-600 font-bold hover:underline"><Plus size={16}/> Thêm địa chỉ</button></div>
                                <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100 flex items-center gap-3 text-sm text-orange-800"><Package size={20}/><span>Đơn vị vận chuyển: <strong>Giao Hàng Tiết Kiệm</strong> (Dự kiến 2-3 ngày)</span></div>
                                {addresses.length > 0 ? (<div className="space-y-3">{addresses.map((addr) => (<div key={addr.id} onClick={() => setSelectedAddressId(addr.id)} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer ${selectedAddressId === addr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}><div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedAddressId === addr.id ? 'border-blue-600' : 'border-gray-300'}`}>{selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}</div><div className="flex-1"><p className="text-sm font-bold">{addr.receiverName} - {addr.receiverPhone} <span className="font-normal text-gray-500">({addr.label})</span></p><p className="text-xs text-gray-600">{addr.detail}</p></div></div>))}</div>) : (<div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-sm">Bạn chưa có địa chỉ. Hãy thêm mới!</div>)}
                            </div>
                        )}
                    </section>
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3"><CreditCard size={20} className="text-blue-600"/> 3. Thanh toán</h2>
                        <div className="space-y-3">
                            <label onClick={() => setPaymentMethod('VNPAY')} className={`relative flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all group ${paymentMethod === 'VNPAY' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" name="payment" value="VNPAY" checked={paymentMethod === 'VNPAY'} readOnly className="w-5 h-5"/>
                                <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm p-1">
                                    <img src={VNPAY_LOGO} alt="VNPAY" className="w-full h-full object-contain"/>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900">Ví VNPAY / Ngân hàng</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Quét mã QR hoặc dùng thẻ ATM/Visa nội địa</p>
                                </div>
                                {paymentMethod === 'VNPAY' && <div className="absolute top-4 right-4 text-blue-600"><CheckCircle size={20} className="fill-blue-100"/></div>}
                            </label>
                            <label onClick={() => setPaymentMethod('MOMO')} className={`relative flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all group ${paymentMethod === 'MOMO' ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" name="payment" value="MOMO" checked={paymentMethod === 'MOMO'} readOnly className="w-5 h-5 accent-pink-600"/>
                                <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm p-1">
                                    <img src={MOMO_LOGO} alt="MoMo" className="w-full h-full object-contain"/>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900">Ví MoMo</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Thanh toán siêu tốc qua ứng dụng MoMo</p>
                                </div>
                                {paymentMethod === 'MOMO' && <div className="absolute top-4 right-4 text-pink-600"><CheckCircle size={20} className="fill-pink-100"/></div>}
                            </label>
                            {deliveryMethod === 'shipping' && (
                                <label onClick={() => setPaymentMethod('COD')} className={`relative flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-green-600 bg-green-50 ring-1 ring-green-500' : 'border-gray-200'}`}>
                                    <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} readOnly className="w-5 h-5"/>
                                    <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center text-green-600 shadow-sm"><Wallet size={32}/></div>
                                    <div className="flex-1"><p className="font-bold text-gray-900">COD (Tiền mặt)</p><p className="text-xs text-gray-500 mt-0.5">Thanh toán khi nhận vé tại nhà</p></div>
                                    {paymentMethod === 'COD' && <div className="absolute top-4 right-4 text-green-600"><CheckCircle size={20} className="fill-green-100"/></div>}
                                </label>
                            )}
                        </div>
                    </section>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 sticky top-24">
                        <h3 className="font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                            Đơn hàng <span className="bg-gray-100 text-xs px-2 py-1 rounded-full text-gray-500 font-normal">{cartItems.length} vé</span>
                        </h3>
                        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {cartItems.map((item, idx) => (
                                <div key={idx} className="flex gap-3 items-start">
                                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100">
                                        <img src={item.image} className="w-full h-full object-contain" alt="ticket"/>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800 text-sm line-clamp-1">{item.ticketName}</p>
                                        <p className="text-xs text-gray-500">Ghế: {item.seatNumber}</p>
                                    </div>
                                    <p className="font-bold text-sm text-gray-900">{item.price.toLocaleString()}đ</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 text-sm border-t border-gray-100 pt-4 mb-4">
                            <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span className="font-medium">{currentSubtotal.toLocaleString()}đ</span></div>
                            <div className="flex justify-between text-gray-600"><span>Phí vận chuyển</span><span className="font-medium">{currentShippingFee.toLocaleString()}đ</span></div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t-2 border-dashed border-gray-200 mb-6">
                            <span className="font-bold text-gray-900 text-lg">Tổng cộng</span>
                            <span className="font-black text-red-600 text-2xl">{currentTotal.toLocaleString()}đ</span>
                        </div>

                        <div className="mb-6 flex items-start gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <input type="checkbox" id="terms" className="mt-1 cursor-pointer accent-blue-600 w-4 h-4" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)}/>
                            <label htmlFor="terms" className="cursor-pointer select-none text-xs text-blue-800 leading-relaxed">
                                Bằng việc thanh toán, tôi đồng ý với <Link to="/policy" className="font-bold hover:underline">Điều khoản & Chính sách</Link> của FootballTic.
                            </label>
                        </div>

                        <button 
                            onClick={() => handleFinalPayment()} 
                            disabled={isLoading || !isAgreed} 
                            className={`w-full py-4 text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg 
                                ${!isAgreed || isLoading 
                                    ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                                    : 'bg-gray-900 hover:bg-black hover:scale-[1.02] active:scale-95'
                                }
                            `} >
                            {isLoading ? <Loader2 className="animate-spin"/> : <CreditCard size={20}/>} 
                            {isLoading ? "Đang xử lý..." : "Thanh toán ngay"}
                        </button>
                        
                        <p className="text-center text-[10px] text-gray-400 mt-4 flex items-center justify-center gap-1 opacity-70">
                             <Ticket size={12}/> Vé giữ chỗ trong 15 phút
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </UserLayout>
  );
}