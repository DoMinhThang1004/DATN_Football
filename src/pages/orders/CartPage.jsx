import React, { useState } from "react";
import { Trash2, MapPin, Ticket, ShoppingCart, RefreshCcw, ArrowRight, AlertCircle, X, Calendar, Armchair, LogIn } from "lucide-react"; // Thêm LogIn icon
import { Link, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout.jsx";
import { useCart } from "../../context/CartContext.jsx";
import CheckoutSteps from "../../components/support_user/CheckoutSteps.jsx"; 

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, clearCart } = useCart();

  // state xn xóa đổi vé
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "", 
    data: null, 
    message: ""
  });
  
  // state modal yêu cầu đăng nhậ[]
  const [showLoginModal, setShowLoginModal] = useState(false);

  // tính tổng tiền
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  // modal
  const openDeleteModal = (id) => {
    setConfirmModal({ isOpen: true, type: "delete", data: id, message: "Bạn có chắc chắn muốn xóa vé này khỏi giỏ hàng?" });
  };
  const openChangeModal = (item) => {
    setConfirmModal({ isOpen: true, type: "change", data: item, message: `Bạn muốn đổi ghế ${item.seatNumber}? Vé cũ sẽ bị xóa để bạn chọn lại.` });
  };
  const openClearModal = () => {
    setConfirmModal({ isOpen: true, type: "clear", data: null, message: "Bạn có chắc chắn muốn xóa tất cả vé?" });
  };
  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: "", data: null, message: "" });
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === "delete") {
        removeFromCart(confirmModal.data);
    } else if (confirmModal.type === "clear") {
        clearCart();
    } else if (confirmModal.type === "change") {
        const itemToChange = confirmModal.data;
        removeFromCart(itemToChange.id); 
        navigate(`/matches/${itemToChange.matchId}`); 
    }
    closeConfirmModal();
  };

  // hàm xl thanh toán
  const handleProceedToCheckout = () => {
    //kiểm tra đăng nhập
    const user = localStorage.getItem("currentUser");
    
    if (!user) {
        //tb đăng nhập bằng modal
        setShowLoginModal(true);
        return;
    }
    if (cartItems.length === 0) return;
    navigate("/checkout");
  };

  const formatDate = (isoString) => {
      if (!isoString) return "";
      return new Date(isoString).toLocaleString('vi-VN', {
        weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      });
  };

  return (
    <UserLayout>
      <div className="bg-gray-100 min-h-screen py-10 relative font-sans">
        {/* yêu cầu đn */}
        {showLoginModal && (
            <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-100 transition-all">
                    <div className="bg-gradient-to-r from-red-600 to-indigo-700 p-4 flex justify-between items-center text-white">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <LogIn size={20} /> Yêu cầu đăng nhập
                        </h3>
                        <button onClick={() => setShowLoginModal(false)} className="hover:bg-white/20 p-1 rounded-full transition">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6 text-center">
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Bạn cần đăng nhập tài khoản để tiếp tục thanh toán và lưu thông tin vé vào hồ sơ cá nhân.
                        </p>
                        
                        <div className="flex gap-3 justify-center">
                            {/* hủy */}
                            <button 
                                onClick={() => setShowLoginModal(false)}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition text-sm">
                                Để sau
                            </button>

                            {/* đăng nhập */}
                            <button 
                                onClick={() => navigate("/login")}
                                className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-blue-200 transition flex items-center gap-2 text-sm">
                                Đăng nhập ngay <ArrowRight size={16}/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* modal xác nhận*/}
        {confirmModal.isOpen && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center relative transform transition-all scale-100">
                    <button onClick={closeConfirmModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"><X size={20}/></button>
                    
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.type === 'change' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                        {confirmModal.type === 'change' ? <RefreshCcw size={32}/> : <Trash2 size={32}/>}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận hành động</h3>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">{confirmModal.message}</p>
                    
                    <div className="flex gap-3">
                        <button onClick={closeConfirmModal} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition">Hủy bỏ</button>
                        <button onClick={handleConfirmAction} className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 ${confirmModal.type === 'change' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}>
                            Đồng ý
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="container mx-auto px-4">
            
            <div className="mb-8">
                <CheckoutSteps currentStep={1} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* cột trái ds vé*/}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><Ticket size={20}/></span> 
                                Vé đã chọn <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">x{cartItems.length}</span>
                            </h2>
                            {cartItems.length > 0 && (
                                <button onClick={openClearModal} className="text-sm text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 font-medium transition-colors">
                                    <Trash2 size={16}/> Xóa tất cả
                                </button>
                            )}
                        </div>
                        
                        {cartItems.length > 0 ? (
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="group relative flex flex-col md:flex-row gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                                        <div className="w-full md:w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center p-2">
                                            <img 
                                                src={item.image || "https://via.placeholder.com/60"} alt="Match Logo" 
                                                className="w-full h-full object-contain"/>
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{item.matchName}</h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-red-500"/> <span className="truncate max-w-[150px]">{item.stadium}</span></span>
                                                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-500"/> {formatDate(item.matchTime)}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                                <span 
                                                    className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-md border"
                                                    style={{ backgroundColor: item.color ? `${item.color}15` : '#EBF5FF', color: item.color || '#1E40AF', borderColor: item.color ? `${item.color}40` : '#BFDBFE' }}>
                                                    {item.ticketName}
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md border border-gray-200">
                                                    <Armchair size={12}/> {item.zoneName} • {item.seatNumber}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 md:pl-4 pt-3 md:pt-0 mt-2 md:mt-0">
                                            <p className="font-bold text-red-600 text-xl">{item.price.toLocaleString()}đ</p>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => openChangeModal(item)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors tooltip"
                                                    title="Đổi vé khác">
                                                    <RefreshCcw size={18}/>
                                                </button>
                                                <button 
                                                    onClick={() => openDeleteModal(item.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors tooltip"
                                                    title="Xóa vé">
                                                    <Trash2 size={18}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                    <ShoppingCart size={40} className="text-gray-300"/>
                                </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">Giỏ hàng trống trơn!</h3>
                                    <p className="text-gray-500 mb-6 text-sm">Bạn chưa chọn vé nào. Hãy tìm một trận đấu hấp dẫn nhé.</p>
                                <Link to="/matches" className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                                    Tìm vé ngay
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* cột phải là tổng kết*/}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 sticky top-24">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                            <ShoppingCart size={20} className="text-green-600"/> Thông tin thanh toán
                        </h3>
                        
                        <div className="space-y-4 text-sm text-gray-600 mb-6">
                            <div className="flex justify-between items-center">
                                <span>Số lượng vé</span>
                                <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{cartItems.length} vé</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Tạm tính</span>
                                <span className="font-medium">{subtotal.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Phí dịch vụ</span>
                                <span className="text-green-600 font-medium">Miễn phí</span>
                            </div>
                        </div>
                        
                        <div className="border-t-2 border-dashed border-gray-200 pt-6 mb-6">
                            <div className="flex justify-between items-end">
                                <span className="font-bold text-gray-900 text-lg">Tổng cộng</span>
                                <div className="text-right">
                                    <span className="block font-black text-red-600 text-3xl leading-none">{subtotal.toLocaleString()}đ</span>
                                    <span className="text-[10px] text-gray-400 font-medium">(Đã bao gồm VAT)</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleProceedToCheckout}
                            disabled={cartItems.length === 0}
                            className={`w-full py-4 text-white font-bold text-base rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95
                                ${cartItems.length === 0 
                                    ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none' 
                                    : 'bg-gray-900 hover:bg-black hover:shadow-gray-400'
                                }
                            `} >
                            Tiến hành thanh toán <ArrowRight size={20}/>
                        </button>
                        
                        <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                            <AlertCircle size={18} className="text-blue-600 mt-0.5 shrink-0"/>
                            <p className="text-xs text-blue-800 leading-relaxed">
                                <strong>Lưu ý:</strong> Vé trong giỏ hàng không được giữ chỗ quá lâu. Vui lòng thanh toán sớm để đảm bảo có vé.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </UserLayout>
  );
}