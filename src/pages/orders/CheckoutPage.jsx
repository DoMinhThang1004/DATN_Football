import React, { useState, useEffect } from "react";
import { CreditCard, QrCode, CheckCircle, Edit2, Truck, ChevronLeft, MapPin, Plus, Trash2, X, Save, AlertTriangle, Loader2, Wallet, Ticket } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout.jsx";
import { useCart } from "../../context/CartContext.jsx";
import CheckoutSteps from "../../components/user/CheckoutSteps.jsx";

// API URL
const API_BASE = "http://localhost:5000/api";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();

  // --- STATE USER & DATA ---
  const [currentUser, setCurrentUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  
  // --- STATE ĐƠN HÀNG ---
  const [deliveryMethod, setDeliveryMethod] = useState("eticket"); 
  const [paymentMethod, setPaymentMethod] = useState("BANK_QR"); 
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // --- STATE KẾT QUẢ ĐƠN HÀNG (Lưu thông tin thật từ Server trả về) ---
  const [finalOrderResult, setFinalOrderResult] = useState(null);
  const [notification, setNotification] = useState(null); 

  // --- STATE MODAL ĐỊA CHỈ ---
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({ label: 'Nhà riêng', detail: '', receiverName: '', receiverPhone: '' });

  // Tính toán tiền
  const currentSubtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const currentShippingFee = deliveryMethod === "shipping" ? 30000 : 0;
  const currentTotal = currentSubtotal + currentShippingFee;

  // --- 1. KHỞI TẠO DỮ LIỆU ---
  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
        navigate("/login");
        return;
    }
    const userObj = JSON.parse(userStr);
    setCurrentUser(userObj);

    if (cartItems.length === 0 && !isSuccess) {
        navigate("/cart");
        return;
    }

    // Fetch địa chỉ từ API
    const fetchAddresses = async () => {
        try {
            const res = await fetch(`${API_BASE}/addresses/user/${userObj.id}`);
            const data = await res.json();
            const mappedAddr = data.map(a => ({
                id: a.id,
                label: a.label,
                receiverName: a.receiver_name,
                receiverPhone: a.receiver_phone,
                detail: a.detail
            }));
            setAddresses(mappedAddr);
            if (mappedAddr.length > 0) setSelectedAddressId(mappedAddr[0].id);
        } catch (error) {
            console.error("Lỗi tải địa chỉ", error);
        }
    };
    fetchAddresses();
  }, [navigate, cartItems.length, isSuccess]);

  // --- EFFECT: TỰ ĐỘNG ĐỔI PHƯƠNG THỨC THANH TOÁN KHI ĐỔI GIAO HÀNG ---
  useEffect(() => {
      if (deliveryMethod === 'eticket') {
          setPaymentMethod('BANK_QR'); // Vé điện tử bắt buộc chuyển khoản
      }
  }, [deliveryMethod]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- 2. XỬ LÝ THÊM ĐỊA CHỈ NHANH ---
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
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const newAddrDB = await res.json();
            const newAddrUI = {
                id: newAddrDB.id,
                label: newAddrDB.label,
                receiverName: newAddrDB.receiver_name,
                receiverPhone: newAddrDB.receiver_phone,
                detail: newAddrDB.detail
            };
            setAddresses([newAddrUI, ...addresses]);
            setSelectedAddressId(newAddrDB.id);
            setShowAddressModal(false);
            showNotification("Thêm địa chỉ thành công!");
        }
    } catch (error) {
        showNotification("Lỗi khi lưu địa chỉ!", "error");
    }
  };

  // --- 3. XỬ LÝ THANH TOÁN (CHỐT ĐƠN) ---
  const handleFinalPayment = async () => {
    if (deliveryMethod === 'shipping' && !selectedAddressId) {
        showNotification("Vui lòng chọn địa chỉ nhận vé!", "error");
        return;
    }

    setIsLoading(true);
    try {
        const orderPayload = {
            user_id: currentUser.id,
            total_amount: currentTotal,
            payment_method: paymentMethod, 
            items: cartItems.map(item => ({
                configId: item.configId,   
                seatNumber: item.seatNumber, 
                price: item.price
            }))
        };

        const res = await fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload)
        });

        if (!res.ok) throw new Error("Đặt vé thất bại");

        const result = await res.json();
        
        // LƯU KẾT QUẢ ĐỂ HIỂN THỊ
        setFinalOrderResult({
            orderId: result.orderId,
            totalAmount: currentTotal,
            paymentMethod: paymentMethod,
            deliveryMethod: deliveryMethod,
            shippingAddress: deliveryMethod === 'shipping' ? addresses.find(a => a.id === selectedAddressId) : null
        });
        
        setIsSuccess(true);
        clearCart(); 
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error(error);
        showNotification("Lỗi hệ thống! Vui lòng thử lại sau.", "error");
    } finally {
        setIsLoading(false);
    }
  };

  // --- GIAO DIỆN THÀNH CÔNG (HIỂN THỊ DATA THẬT) ---
  if (isSuccess && finalOrderResult) {
    return (
      <UserLayout>
        <div className="bg-gray-50 min-h-screen py-8">
          <div className="container mx-auto px-4">
            <CheckoutSteps currentStep={3} />
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl text-center animate-fadeIn mt-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={48} className="text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Thanh toán thành công!</h2>
                <p className="text-gray-600 mb-8">
                    Cảm ơn bạn <span className="font-bold text-gray-900">{currentUser?.full_name}</span>. <br/>
                    {finalOrderResult.deliveryMethod === 'eticket' 
                        ? "Vé điện tử đã được khởi tạo thành công." 
                        : "Đơn hàng vé cứng đã được ghi nhận."}
                </p>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 text-left space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Mã đơn hàng:</span>
                        <span className="font-bold text-blue-600">{finalOrderResult.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Phương thức:</span>
                        <span className="font-bold uppercase">{finalOrderResult.paymentMethod === 'BANK_QR' ? 'Chuyển khoản Ngân hàng' : 'Thanh toán khi nhận (COD)'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Hình thức nhận:</span>
                        <span className="font-medium">{finalOrderResult.deliveryMethod === 'eticket' ? 'Vé điện tử (QR)' : 'Giao vé tận nơi'}</span>
                    </div>
                    
                    {finalOrderResult.shippingAddress && (
                        <div className="flex justify-between items-start gap-4 pt-2 border-t border-gray-200 border-dashed">
                            <span className="text-gray-500 whitespace-nowrap">Giao tới:</span>
                            <span className="text-right text-sm text-gray-800 font-medium">
                                {finalOrderResult.shippingAddress.receiverName} - {finalOrderResult.shippingAddress.receiverPhone} <br/>
                                {finalOrderResult.shippingAddress.detail}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-2">
                        <span className="font-bold text-lg">Tổng thanh toán:</span>
                        <span className="text-red-600 font-black text-2xl">{finalOrderResult.totalAmount.toLocaleString()}đ</span>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <Link to="/" className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Về trang chủ</Link>
                    <Link to="/profile/tickets" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">Xem vé của tôi</Link>
                </div>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  // --- GIAO DIỆN FORM ---
  return (
    <UserLayout>
      <div className="bg-gray-50 min-h-screen py-8 relative">
        
        {/* Toast Notification */}
        {notification && (
            <div className={`fixed top-24 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                <span className="font-medium">{notification.message}</span>
            </div>
        )}
        
        {/* Modal Thêm Địa chỉ */}
        {showAddressModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Thêm địa chỉ mới</h3>
                        <button onClick={() => setShowAddressModal(false)}><X size={20} className="text-gray-400"/></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Loại địa chỉ</label>
                            <div className="flex gap-3">
                                {['Nhà riêng', 'Công ty', 'Khác'].map(l => (
                                    <button key={l} onClick={() => setAddressForm({...addressForm, label: l})} className={`flex-1 py-2 text-sm rounded-lg border ${addressForm.label === l ? 'border-blue-600 bg-blue-50 text-blue-600 font-bold' : 'border-gray-200 text-gray-600'}`}>{l}</button>
                                ))}
                            </div>
                        </div>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin thanh toán</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* CỘT TRÁI */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* 1. THÔNG TIN NGƯỜI MUA */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                            <Edit2 size={20} className="text-blue-600"/> 1. Thông tin người mua
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-gray-500 text-xs uppercase mb-1">Họ và tên</p>
                                <p className="font-bold text-gray-900">{currentUser?.full_name}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-gray-500 text-xs uppercase mb-1">Số điện thoại</p>
                                <p className="font-bold text-gray-900">{currentUser?.phone}</p>
                            </div>
                            <div className="md:col-span-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-gray-500 text-xs uppercase mb-1">Email nhận vé</p>
                                <p className="font-bold text-gray-900">{currentUser?.email}</p>
                            </div>
                        </div>
                    </section>

                    {/* 2. HÌNH THỨC NHẬN VÉ */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                            <Truck size={20} className="text-blue-600"/> 2. Hình thức nhận vé
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div onClick={() => setDeliveryMethod("eticket")} className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${deliveryMethod === 'eticket' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}>
                                <Ticket size={24} className="text-blue-600"/>
                                <div><p className="font-bold text-sm">Vé điện tử (QR)</p><p className="text-xs text-gray-500">Miễn phí - Qua App/Email</p></div>
                            </div>
                            <div onClick={() => setDeliveryMethod("shipping")} className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${deliveryMethod === 'shipping' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}>
                                <Truck size={24} className="text-orange-500"/>
                                <div><p className="font-bold text-sm">Vé cứng (Ship)</p><p className="text-xs text-gray-500">+30.000đ - Tận nhà</p></div>
                            </div>
                        </div>

                        {/* CHỌN ĐỊA CHỈ (Chỉ hiện khi chọn Ship) */}
                        {deliveryMethod === 'shipping' && (
                            <div className="mt-4 animate-fadeIn">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-bold text-gray-700">Địa chỉ nhận hàng:</label>
                                    <button onClick={() => setShowAddressModal(true)} className="text-sm flex items-center gap-1 text-blue-600 font-bold hover:underline"><Plus size={16}/> Thêm địa chỉ</button>
                                </div>
                                {addresses.length > 0 ? (
                                    <div className="space-y-3">
                                        {addresses.map((addr) => (
                                            <div key={addr.id} onClick={() => setSelectedAddressId(addr.id)} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer ${selectedAddressId === addr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedAddressId === addr.id ? 'border-blue-600' : 'border-gray-300'}`}>
                                                    {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold">{addr.receiverName} - {addr.receiverPhone} <span className="font-normal text-gray-500">({addr.label})</span></p>
                                                    <p className="text-xs text-gray-600">{addr.detail}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-sm">Bạn chưa có địa chỉ. Hãy thêm mới!</div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* 3. PHƯƠNG THỨC THANH TOÁN */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                            <CreditCard size={20} className="text-blue-600"/> 3. Thanh toán
                        </h2>
                        <div className="space-y-3">
                            
                            {/* Bank QR - LUÔN HIỂN THỊ */}
                            <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'BANK_QR' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200'}`}>
                                <input type="radio" name="payment" value="BANK_QR" checked={paymentMethod === 'BANK_QR'} onChange={() => setPaymentMethod('BANK_QR')} className="w-5 h-5"/>
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><QrCode size={24}/></div>
                                <div className="flex-1"><p className="font-bold text-gray-900">Chuyển khoản Ngân hàng</p><p className="text-xs text-gray-500">Quét mã QR VietQR - Kích hoạt vé ngay</p></div>
                            </label>

                            {/* Thanh toán COD - CHỈ HIỆN KHI CHỌN SHIP */}
                            {deliveryMethod === 'shipping' ? (
                                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-green-600 bg-green-50 ring-1 ring-green-500' : 'border-gray-200'}`}>
                                    <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-5 h-5"/>
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600"><Wallet size={24}/></div>
                                    <div className="flex-1"><p className="font-bold text-gray-900">Thanh toán khi nhận vé (COD)</p><p className="text-xs text-gray-500">Thanh toán tiền mặt cho shipper</p></div>
                                </label>
                            ) : (
                                <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50 opacity-50 cursor-not-allowed" title="Chỉ áp dụng cho vé cứng">
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400"><Wallet size={24}/></div>
                                    <div className="flex-1"><p className="font-bold text-gray-500">Thanh toán khi nhận vé (COD)</p><p className="text-xs text-gray-400">Không áp dụng cho vé điện tử</p></div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* CỘT PHẢI (BILL) */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
                        <h3 className="font-bold text-gray-800 mb-4 pb-4 border-b border-gray-100">Đơn hàng</h3>
                        <div className="space-y-3 mb-6 max-h-40 overflow-y-auto pr-1">
                            {cartItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <div><p className="font-medium text-gray-800">{item.ticketName}</p><p className="text-xs text-gray-500">Ghế: {item.seatNumber}</p></div>
                                    <p className="font-medium">{item.price.toLocaleString()}đ</p>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3 text-sm border-t border-gray-100 pt-4 mb-4">
                            <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span>{currentSubtotal.toLocaleString()}đ</span></div>
                            <div className="flex justify-between text-gray-600"><span>Phí vận chuyển</span><span>{currentShippingFee.toLocaleString()}đ</span></div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200 mb-6">
                            <span className="font-bold text-gray-900 text-lg">Tổng cộng</span>
                            <span className="font-black text-red-600 text-2xl">{currentTotal.toLocaleString()}đ</span>
                        </div>
                        <button onClick={handleFinalPayment} disabled={isLoading} className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70">
                            {isLoading ? <Loader2 className="animate-spin"/> : <CreditCard size={20}/>}
                            {isLoading ? "Đang xử lý..." : "Thanh toán ngay"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </UserLayout>
  );
}