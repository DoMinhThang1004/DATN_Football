import React, { useState } from "react";
import { Trash2, MapPin, Ticket, ShoppingCart, RefreshCcw, ArrowRight, AlertCircle, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout.jsx";
import { useCart } from "../../context/CartContext.jsx";
import CheckoutSteps from "../../components/user/CheckoutSteps.jsx"; 

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, clearCart } = useCart();

  // State quản lý Modal xác nhận
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "", // 'delete', 'change', 'clear'
    data: null, // Lưu item cần xử lý
    message: ""
  });

  // Tính tổng tiền tạm tính
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  // --- CÁC HÀM MỞ MODAL ---
  const openDeleteModal = (id) => {
    setConfirmModal({ isOpen: true, type: "delete", data: id, message: "Bạn có chắc chắn muốn xóa vé này khỏi giỏ hàng?" });
  };

  const openChangeModal = (item) => {
    setConfirmModal({ isOpen: true, type: "change", data: item, message: `Bạn muốn đổi ghế ${item.seat}? Vé cũ sẽ bị xóa để bạn chọn lại.` });
  };

  const openClearModal = () => {
    setConfirmModal({ isOpen: true, type: "clear", data: null, message: "Bạn có chắc chắn muốn xóa tất cả vé?" });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: "", data: null, message: "" });
  };

  // --- CÁC HÀM XỬ LÝ CHÍNH (SAU KHI BẤM ĐỒNG Ý Ở MODAL) ---
  const handleConfirmAction = () => {
    if (confirmModal.type === "delete") {
        removeFromCart(confirmModal.data);
    } 
    else if (confirmModal.type === "clear") {
        clearCart();
    } 
    else if (confirmModal.type === "change") {
        // LOGIC ĐỔI VÉ MỚI: Xóa vé cũ trước -> Chuyển hướng sau
        const itemToChange = confirmModal.data;
        removeFromCart(itemToChange.id); // Xóa vé cũ
        navigate(`/matches/${itemToChange.matchId}`); // Chuyển hướng chọn lại
    }
    closeConfirmModal();
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    navigate("/checkout");
  };

  return (
    <UserLayout>
      <div className="bg-gray-50 min-h-screen py-8 relative">
        
        {/* --- MODAL XÁC NHẬN (POPUP) --- */}
        {confirmModal.isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center relative">
                    <button onClick={closeConfirmModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                    
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.type === 'change' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                        {confirmModal.type === 'change' ? <RefreshCcw size={32}/> : <Trash2 size={32}/>}
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận</h3>
                    <p className="text-gray-600 mb-6 text-sm">{confirmModal.message}</p>
                    
                    <div className="flex gap-3">
                        <button onClick={closeConfirmModal} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50">Hủy</button>
                        <button onClick={handleConfirmAction} className={`flex-1 py-2.5 rounded-xl font-bold text-white ${confirmModal.type === 'change' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
                            Đồng ý
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="container mx-auto px-4">
            
            <CheckoutSteps currentStep={1} />

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Xem lại giỏ hàng</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* === CỘT TRÁI: DANH SÁCH VÉ === */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Ticket size={20} className="text-blue-600"/> Vé đã chọn ({cartItems.length})
                            </h3>
                            {cartItems.length > 0 && (
                                <button onClick={openClearModal} className="text-xs text-red-500 hover:underline">Xóa tất cả</button>
                            )}
                        </div>
                        
                        {cartItems.length > 0 ? (
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-200 transition-colors">
                                        <img src={item.image} alt="Match Logo" className="w-16 h-16 rounded-lg object-cover border border-gray-200"/>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900">{item.match}</h3>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={12}/> {item.stadium} • {item.date}</p>
                                            <div className="mt-2 inline-flex items-center bg-white border border-blue-100 px-3 py-1 rounded-md text-sm font-medium text-blue-700 shadow-sm">
                                                {item.stand} - {item.seat}
                                            </div>
                                        </div>
                                        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto justify-between">
                                            <p className="font-bold text-red-600 text-lg">{item.price.toLocaleString()}đ</p>
                                            <div className="flex items-center gap-2">
                                                {/* Nút Đổi gọi modal xác nhận */}
                                                <button onClick={() => openChangeModal(item)} className="text-xs flex items-center gap-1 text-gray-500 hover:text-blue-600 bg-white border border-gray-300 px-2 py-1 rounded hover:border-blue-400 transition"><RefreshCcw size={14}/> Đổi</button>
                                                {/* Nút Xóa gọi modal xác nhận */}
                                                <button onClick={() => openDeleteModal(item.id)} className="text-xs flex items-center gap-1 text-red-500 hover:text-red-700 bg-white border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition"><Trash2 size={14}/> Xóa</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400"><ShoppingCart size={32}/></div>
                                <p className="text-gray-500">Giỏ hàng của bạn đang trống.</p>
                                <Link to="/matches" className="text-blue-600 font-bold hover:underline mt-2 inline-block">Tìm vé ngay</Link>
                            </div>
                        )}
                    </section>
                </div>

                {/* === CỘT PHẢI: TỔNG KẾT === */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-24">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Thanh toán</h3>
                        
                        <div className="space-y-3 text-sm mb-6">
                            <div className="flex justify-between text-gray-600"><span>Số lượng vé</span><span className="font-medium">{cartItems.length} vé</span></div>
                            <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span className="font-medium">{subtotal.toLocaleString()}đ</span></div>
                        </div>
                        
                        <div className="border-t-2 border-dashed border-gray-200 pt-4 mb-6">
                            <div className="flex justify-between items-center"><span className="font-bold text-gray-900 text-lg">Tổng tiền</span><span className="font-black text-red-600 text-2xl">{subtotal.toLocaleString()}đ</span></div>
                        </div>

                        <button 
                            onClick={handleProceedToCheckout}
                            disabled={cartItems.length === 0}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Tiến hành thanh toán <ArrowRight size={18}/>
                        </button>
                        
                        <div className="mt-5 text-xs text-center text-gray-400">
                            <p>Hotline hỗ trợ: <span className="text-red-500 font-bold">1900 123 456</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </UserLayout>
  );
}