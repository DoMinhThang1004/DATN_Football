import React, { useState, useEffect } from "react";
import { CreditCard, QrCode, CheckCircle, Edit2, Truck, ChevronLeft, MapPin, Plus, Trash2, X, Save, AlertTriangle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout.jsx";
import { useCart } from "../../context/CartContext.jsx";
import CheckoutSteps from "../../components/user/CheckoutSteps.jsx";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();

  // --- STATE QUẢN LÝ ĐƠN HÀNG ---
  const [isSuccess, setIsSuccess] = useState(false);
  const [finalOrder, setFinalOrder] = useState(null);

  // --- STATE FORM CHÍNH ---
  const [buyerInfo, setBuyerInfo] = useState({ name: "", phone: "", email: "" });
  const [errors, setErrors] = useState({});
  const [deliveryMethod, setDeliveryMethod] = useState("eticket"); 
  const [paymentMethod, setPaymentMethod] = useState("banking");

  // --- STATE CHECKBOX ĐIỀU KHOẢN (MỚI THÊM) ---
  const [isAgreed, setIsAgreed] = useState(true);

  // --- STATE QUẢN LÝ ĐỊA CHỈ ---
  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Nhà riêng', detail: 'Số 1 Phạm Hùng, Cầu Giấy, Hà Nội', receiverName: 'Nguyễn Văn A', receiverPhone: '0912345678' },
    { id: 2, label: 'Công ty', detail: 'Tòa nhà FPT, Duy Tân, Hà Nội', receiverName: 'Nguyễn Văn A', receiverPhone: '0987654321' }
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState(1);
  
  // State cho Modal Thêm/Sửa
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({ label: '', detail: '', receiverName: '', receiverPhone: '' });

  // State cho Modal Xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  // --- TÍNH TOÁN ---
  const currentSubtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const currentShippingFee = deliveryMethod === "shipping" ? 30000 : 0;
  const currentTotal = currentSubtotal + currentShippingFee;

  // --- EFFECT ---
  useEffect(() => {
    if (cartItems.length === 0 && !isSuccess) {
        navigate("/cart");
    }
  }, [cartItems, navigate, isSuccess]);

  // --- HÀM XỬ LÝ FORM CHÍNH ---
  const handleChangeInfo = (e) => {
    const { name, value } = e.target;
    setBuyerInfo({ ...buyerInfo, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  // --- CÁC HÀM XỬ LÝ ĐỊA CHỈ ---

  // 1. Mở Modal yêu cầu xóa
  const handleRequestDelete = (id) => {
    setAddressToDelete(id);
    setShowDeleteModal(true);
  };

  // 2. Thực hiện xóa sau khi xác nhận
  const confirmDeleteAddress = () => {
    if (addressToDelete) {
        const newAddresses = addresses.filter(addr => addr.id !== addressToDelete);
        setAddresses(newAddresses);
        
        // Nếu xóa địa chỉ đang chọn, thì chọn cái đầu tiên còn lại (hoặc null)
        if (addressToDelete === selectedAddressId) {
            if (newAddresses.length > 0) {
                setSelectedAddressId(newAddresses[0].id);
            } else {
                setSelectedAddressId(null);
            }
        }
    }
    setShowDeleteModal(false);
    setAddressToDelete(null);
  };

  const handleOpenAddressModal = (address = null) => {
    if (address) {
        setEditingAddress(address);
        setAddressForm({ 
            label: address.label, 
            detail: address.detail, 
            receiverName: address.receiverName, 
            receiverPhone: address.receiverPhone 
        });
    } else {
        setEditingAddress(null);
        setAddressForm({ 
            label: 'Nhà riêng', 
            detail: '', 
            receiverName: buyerInfo.name, 
            receiverPhone: buyerInfo.phone 
        });
    }
    setShowAddressModal(true);
  };

  const handleSaveAddress = () => {
    if (!addressForm.detail || !addressForm.receiverName || !addressForm.receiverPhone) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    if (editingAddress) {
        setAddresses(addresses.map(addr => addr.id === editingAddress.id ? { ...addr, ...addressForm } : addr));
    } else {
        const newId = Date.now();
        const newAddress = { id: newId, ...addressForm };
        setAddresses([...addresses, newAddress]);
        setSelectedAddressId(newId);
    }
    setShowAddressModal(false);
  };

  // --- HÀM XỬ LÝ THANH TOÁN CUỐI CÙNG ---
  const handleFinalPayment = () => {
    let newErrors = {};
    let isValid = true;

    if (!buyerInfo.name.trim()) { newErrors.name = "Nhập họ tên"; isValid = false; }
    if (!buyerInfo.phone.trim()) { newErrors.phone = "Nhập SĐT"; isValid = false; }
    if (!buyerInfo.email.trim()) { newErrors.email = "Nhập email"; isValid = false; }
    
    if (deliveryMethod === 'shipping') {
        if (addresses.length === 0) {
            alert("Vui lòng thêm địa chỉ nhận vé!");
            isValid = false;
        } else if (!selectedAddressId) {
            alert("Vui lòng chọn địa chỉ nhận vé!");
            isValid = false;
        }
    }

    setErrors(newErrors);

    if (isValid) {
        const shippingAddress = deliveryMethod === 'shipping' 
            ? addresses.find(a => a.id === selectedAddressId) 
            : null;

        const orderData = {
            orderCode: `#ORD-${Math.floor(Math.random() * 100000)}`,
            customerName: buyerInfo.name,
            email: buyerInfo.email,
            totalAmount: currentTotal,
            paymentMethodText: paymentMethod === 'banking' ? 'Chuyển khoản / QR' : 'Thanh toán khi nhận vé (COD)',
            shippingFee: currentShippingFee,
            deliveryType: deliveryMethod === 'shipping' ? 'Giao vé tận nơi' : 'Vé điện tử',
            shippingAddress: shippingAddress 
        };

        setFinalOrder(orderData);
        console.log("Order Success:", orderData);

        clearCart();
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- GIAO DIỆN BƯỚC 3: THÀNH CÔNG ---
  if (isSuccess && finalOrder) {
    return (
      <UserLayout>
        <div className="bg-gray-50 min-h-screen py-8">
          <div className="container mx-auto px-4">
            <CheckoutSteps currentStep={3} />
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl text-center animate-fadeIn">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={48} className="text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Đặt vé thành công!</h2>
                <p className="text-gray-600 mb-8">
                    Cảm ơn bạn <span className="font-bold text-gray-900">{finalOrder.customerName}</span>. <br/>
                    {finalOrder.deliveryType === 'Vé điện tử' 
                        ? <span>Mã vé đã được gửi tới email: <span className="text-blue-600 font-medium">{finalOrder.email}</span></span>
                        : <span>Vé sẽ được giao tới địa chỉ của bạn trong 2-3 ngày tới.</span>
                    }
                </p>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 text-left space-y-3">
                    <div className="flex justify-between"><span className="text-gray-500">Mã đơn:</span><span className="font-bold">{finalOrder.orderCode}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Hình thức:</span><span className="font-medium">{finalOrder.deliveryType}</span></div>
                    {finalOrder.shippingAddress && (
                        <div className="flex justify-between items-start gap-4">
                            <span className="text-gray-500 whitespace-nowrap">Địa chỉ nhận:</span>
                            <span className="text-right text-sm text-gray-800">{finalOrder.shippingAddress.detail}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-2">
                        <span className="font-bold text-lg">Tổng thanh toán:</span>
                        <span className="text-red-600 font-black text-2xl">{finalOrder.totalAmount.toLocaleString()}đ</span>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <Link to="/home" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">Về trang chủ</Link>
                </div>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  // --- GIAO DIỆN BƯỚC 2: FORM NHẬP LIỆU ---
  return (
    <UserLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4 relative">
            
            {/* --- MODAL XÓA ĐỊA CHỈ --- */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center relative">
                        <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                        
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32}/>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Xóa địa chỉ?</h3>
                        <p className="text-gray-600 mb-6 text-sm">Bạn có chắc chắn muốn xóa địa chỉ này khỏi danh sách không?</p>
                        
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50">Hủy</button>
                            <button onClick={confirmDeleteAddress} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">
                                Xóa ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL THÊM/SỬA ĐỊA CHỈ --- */}
            {showAddressModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">{editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                            <button onClick={() => setShowAddressModal(false)}><X size={24} className="text-gray-400 hover:text-gray-600"/></button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loại địa chỉ</label>
                                <input type="text" className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" placeholder="Ví dụ: Nhà riêng, Công ty..." 
                                    value={addressForm.label} onChange={e => setAddressForm({...addressForm, label: e.target.value})}/>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên người nhận</label>
                                    <input type="text" className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" placeholder="Nguyễn Văn A" 
                                        value={addressForm.receiverName} onChange={e => setAddressForm({...addressForm, receiverName: e.target.value})}/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <input type="text" className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" placeholder="09xx..." 
                                        value={addressForm.receiverPhone} onChange={e => setAddressForm({...addressForm, receiverPhone: e.target.value})}/>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
                                <textarea className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" rows="3" placeholder="Số nhà, đường, phường, quận..." 
                                    value={addressForm.detail} onChange={e => setAddressForm({...addressForm, detail: e.target.value})}></textarea>
                            </div>
                            
                            <button onClick={handleSaveAddress} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">
                                <Save size={18}/> Lưu địa chỉ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <CheckoutSteps currentStep={2} />

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin thanh toán</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CỘT TRÁI */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 1. THÔNG TIN CƠ BẢN */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                            <Edit2 size={20} className="text-blue-600"/> 1. Thông tin người đặt
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
                                <input type="text" name="name" value={buyerInfo.name} onChange={handleChangeInfo} className={`w-full p-3 border rounded-xl outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`} placeholder="Nhập họ tên"/>
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SĐT <span className="text-red-500">*</span></label>
                                <input type="text" name="phone" value={buyerInfo.phone} onChange={handleChangeInfo} className={`w-full p-3 border rounded-xl outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} placeholder="Nhập SĐT"/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                <input type="email" name="email" value={buyerInfo.email} onChange={handleChangeInfo} className={`w-full p-3 border rounded-xl outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'}`} placeholder="Vé gửi về email này"/>
                            </div>
                        </div>
                    </section>

                    {/* 2. HÌNH THỨC NHẬN VÉ & ĐỊA CHỈ */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                            <Truck size={20} className="text-blue-600"/> 2. Hình thức nhận vé
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div onClick={() => setDeliveryMethod("eticket")} className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${deliveryMethod === 'eticket' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}>
                                <QrCode size={24} className="text-blue-600"/>
                                <div><p className="font-bold text-sm">Vé điện tử (QR)</p><p className="text-xs text-gray-500">Miễn phí - Qua Email</p></div>
                            </div>
                            <div onClick={() => setDeliveryMethod("shipping")} className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${deliveryMethod === 'shipping' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}>
                                <Truck size={24} className="text-orange-500"/>
                                <div><p className="font-bold text-sm">Vé cứng (Ship)</p><p className="text-xs text-gray-500">+30.000đ - Tận nhà</p></div>
                            </div>
                        </div>

                        {/* KHU VỰC CHỌN ĐỊA CHỈ */}
                        {deliveryMethod === 'shipping' && (
                            <div className="mt-4 animate-fadeIn">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-bold text-gray-700">Chọn địa chỉ nhận hàng:</label>
                                    <button onClick={() => handleOpenAddressModal(null)} className="text-sm flex items-center gap-1 text-blue-600 font-bold hover:underline">
                                        <Plus size={16}/> Thêm địa chỉ
                                    </button>
                                </div>

                                {addresses.length > 0 ? (
                                    <div className="space-y-3">
                                        {addresses.map((addr) => (
                                            <div key={addr.id} 
                                                className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all ${selectedAddressId === addr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                                                onClick={() => setSelectedAddressId(addr.id)}
                                            >
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${selectedAddressId === addr.id ? 'border-blue-600' : 'border-gray-300'}`}>
                                                    {selectedAddressId === addr.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-800">{addr.label}</span>
                                                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600">
                                                            {addr.receiverName} - {addr.receiverPhone}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1"><MapPin size={14} className="inline text-gray-400"/> {addr.detail}</p>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); handleOpenAddressModal(addr); }} className="text-gray-400 hover:text-blue-600"><Edit2 size={16}/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleRequestDelete(addr.id); }} className="text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                                        <MapPin className="mx-auto text-gray-400 mb-2" size={32}/>
                                        <p className="text-gray-500 text-sm mb-3">Chưa có địa chỉ nào.</p>
                                        <button onClick={() => handleOpenAddressModal(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">Thêm địa chỉ ngay</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* 3. THANH TOÁN */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                            <CreditCard size={20} className="text-blue-600"/> 3. Thanh toán
                        </h2>
                        <div className="space-y-3">
                            <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer ${paymentMethod === 'banking' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                                <input type="radio" name="payment" value="banking" checked={paymentMethod === 'banking'} onChange={() => setPaymentMethod('banking')} className="w-5 h-5"/>
                                <div className="flex-1"><p className="font-bold text-gray-900">Chuyển khoản / QR</p><p className="text-xs text-gray-500">VietQR - Xác nhận tự động</p></div>
                            </label>
                            {deliveryMethod === 'shipping' && (
                                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5"/>
                                    <div className="flex-1"><p className="font-bold text-gray-900">Thanh toán khi nhận vé (COD)</p><p className="text-xs text-gray-500">Chỉ áp dụng vé cứng</p></div>
                                </label>
                            )}
                        </div>
                    </section>
                </div>

                {/* CỘT PHẢI (BILL) */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-24">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Đơn hàng của bạn</h3>
                        <div className="space-y-3 text-sm mb-6">
                            <div className="flex justify-between text-gray-600"><span>Số lượng vé</span><span className="font-medium">{cartItems.length} vé</span></div>
                            <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span className="font-medium">{currentSubtotal.toLocaleString()}đ</span></div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển</span>
                                <span className={`font-medium ${currentShippingFee > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                    {currentShippingFee === 0 ? "Miễn phí" : `${currentShippingFee.toLocaleString()}đ`}
                                </span>
                            </div>
                        </div>
                        <div className="border-t-2 border-dashed border-gray-200 pt-4 mb-6">
                            <div className="flex justify-between items-center"><span className="font-bold text-gray-900 text-lg">Tổng thanh toán</span><span className="font-black text-red-600 text-2xl">{currentTotal.toLocaleString()}đ</span></div>
                        </div>
                        
                        {/* --- CHECKBOX ĐIỀU KHOẢN (MỚI THÊM) --- */}
                        <div className="flex items-start gap-2 mb-4 text-xs text-gray-500">
                            <input 
                                type="checkbox" 
                                id="terms" 
                                className="mt-0.5 cursor-pointer" 
                                checked={isAgreed}
                                onChange={(e) => setIsAgreed(e.target.checked)}
                            />
                            <label htmlFor="terms" className="cursor-pointer select-none">
                                Bằng việc tiến hành thanh toán, bạn đồng ý với{" "}
                                <Link to="/policy" target="_blank" className="text-blue-600 font-bold hover:underline">Điều khoản sử dụng</Link> và{" "}
                                <Link to="/policy" target="_blank" className="text-blue-600 font-bold hover:underline">Chính sách hoàn tiền</Link> của chúng tôi.
                            </label>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleFinalPayment} 
                                disabled={!isAgreed}
                                className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 
                                    ${isAgreed ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
                            >
                                Xác nhận & Thanh toán <CheckCircle size={18}/>
                            </button>
                            <button onClick={() => navigate('/cart')} className="w-full py-3 bg-white border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                <ChevronLeft size={18}/> Quay lại giỏ hàng
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </UserLayout>
  );
}