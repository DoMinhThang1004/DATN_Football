import React, { useState } from "react";
import { MapPin, Plus, Edit2, Trash2, Save, X, Home, Briefcase, AlertTriangle, AlertCircle } from "lucide-react";

export default function AddressBook() {
  // --- STATE DỮ LIỆU ---
  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Nhà riêng', detail: 'Số 1 Phạm Hùng, Cầu Giấy, Hà Nội', receiverName: 'Minh Thắng', receiverPhone: '0912345678' },
    { id: 2, label: 'Công ty', detail: 'Tòa nhà Keangnam, Mễ Trì, Hà Nội', receiverName: 'Minh Thắng', receiverPhone: '0987654321' }
  ]);

  // --- STATE MODAL & FORM ---
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false); // Modal thông báo giới hạn

  const [editingId, setEditingId] = useState(null); // ID đang sửa (null nếu là thêm mới)
  const [deleteId, setDeleteId] = useState(null);   // ID đang muốn xóa
  
  const [form, setForm] = useState({ label: 'Nhà riêng', detail: '', receiverName: '', receiverPhone: '' });
  const [error, setError] = useState(""); // Lưu thông báo lỗi

  // --- HÀM XỬ LÝ FORM ---
  const handleEdit = (addr) => {
    setEditingId(addr.id);
    setForm(addr);
    setError("");
    setShowFormModal(true);
  };

  const handleAdd = () => {
    // 1. KIỂM TRA GIỚI HẠN SỐ LƯỢNG
    if (addresses.length >= 2) {
        setShowLimitModal(true);
        return;
    }
    setEditingId(null);
    setForm({ label: 'Nhà riêng', detail: '', receiverName: '', receiverPhone: '' });
    setError("");
    setShowFormModal(true);
  };

  const handleSave = () => {
    // 2. VALIDATE DỮ LIỆU
    if (!form.receiverName.trim() || !form.receiverPhone.trim() || !form.detail.trim()) {
        setError("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    // Validate số điện thoại cơ bản (10 số)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.receiverPhone)) {
        setError("Số điện thoại không hợp lệ (phải có 10 chữ số)!");
        return;
    }
    
    // Lưu dữ liệu
    if (editingId) {
        setAddresses(addresses.map(a => a.id === editingId ? { ...form, id: editingId } : a));
    } else {
        setAddresses([...addresses, { ...form, id: Date.now() }]);
    }
    setShowFormModal(false);
  };

  // --- HÀM XỬ LÝ XÓA ---
  const requestDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setAddresses(addresses.filter(a => a.id !== deleteId));
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[500px] p-6 relative">
        
        {/* --- MODAL CẢNH BÁO GIỚI HẠN (MAX 2) --- */}
        {showLimitModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl text-center relative">
                    <button onClick={() => setShowLimitModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                    <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32}/>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Đạt giới hạn địa chỉ</h3>
                    <p className="text-gray-600 mb-6 text-sm">Bạn chỉ được lưu tối đa 2 địa chỉ nhận hàng. Vui lòng xóa bớt địa chỉ cũ hoặc chỉnh sửa lại.</p>
                    <button onClick={() => setShowLimitModal(false)} className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black">Đã hiểu</button>
                </div>
            </div>
        )}

        {/* --- MODAL XÁC NHẬN XÓA --- */}
        {showDeleteModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl text-center relative">
                    <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                    <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 size={28}/>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Xóa địa chỉ này?</h3>
                    <p className="text-gray-600 mb-6 text-sm">Hành động này không thể hoàn tác.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50">Hủy</button>
                        <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Xóa ngay</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL FORM THÊM/SỬA --- */}
        {showFormModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">{editingId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                        <button onClick={() => setShowFormModal(false)}><X size={20} className="text-gray-400 hover:text-black"/></button>
                    </div>

                    {/* KHU VỰC HIỂN THỊ LỖI */}
                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2 animate-pulse font-medium">
                            <AlertCircle size={16}/> {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Loại địa chỉ</label>
                            <div className="flex gap-3">
                                {['Nhà riêng', 'Công ty', 'Khác'].map(l => (
                                    <button key={l} onClick={() => setForm({...form, label: l})} className={`flex-1 py-2 text-sm rounded-lg border transition-all ${form.label === l ? 'border-blue-600 bg-blue-50 text-blue-600 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{l}</button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700">Tên người nhận</label>
                                <input type="text" value={form.receiverName} onChange={e => setForm({...form, receiverName: e.target.value})} className="w-full p-2.5 border rounded-lg mt-1 outline-none focus:border-blue-500 transition-all"/>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">Số điện thoại</label>
                                <input type="text" value={form.receiverPhone} onChange={e => setForm({...form, receiverPhone: e.target.value})} className="w-full p-2.5 border rounded-lg mt-1 outline-none focus:border-blue-500 transition-all"/>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700">Địa chỉ chi tiết</label>
                            <textarea rows="3" value={form.detail} onChange={e => setForm({...form, detail: e.target.value})} placeholder="Số nhà, ngõ, phường, quận..." className="w-full p-2.5 border rounded-lg mt-1 outline-none focus:border-blue-500 transition-all"></textarea>
                        </div>
                        <button onClick={handleSave} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex justify-center gap-2 shadow-lg shadow-blue-200 transition-all">
                            <Save size={18}/> Lưu địa chỉ
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- GIAO DIỆN CHÍNH --- */}
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><MapPin className="text-blue-600"/> Sổ địa chỉ</h2>
            {/* Nút thêm mới: Disable nếu đã đủ 2 địa chỉ (để trực quan hơn) hoặc vẫn cho bấm để hiện modal cảnh báo */}
            <button 
                onClick={handleAdd} 
                className={`px-4 py-2 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-all ${addresses.length >= 2 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'}`}
            >
                <Plus size={16}/> Thêm mới
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(addr => (
                <div key={addr.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition relative group bg-white">
                    <div className="flex justify-between items-start mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600 uppercase">
                            {addr.label === 'Nhà riêng' ? <Home size={12}/> : <Briefcase size={12}/>} {addr.label}
                        </span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(addr)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 size={16}/></button>
                            <button onClick={() => requestDelete(addr.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16}/></button>
                        </div>
                    </div>
                    <h4 className="font-bold text-gray-900">{addr.receiverName} <span className="font-normal text-gray-500 text-sm">| {addr.receiverPhone}</span></h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2 h-10">{addr.detail}</p>
                </div>
            ))}
            
            {/* Card trống hiển thị khi chưa đủ 2 địa chỉ (Khuyến khích user thêm) */}
            {addresses.length < 2 && (
                <div onClick={handleAdd} className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 hover:text-blue-600 transition h-full min-h-[130px]">
                    <Plus size={24} className="mb-1"/>
                    <span className="text-sm font-bold">Thêm địa chỉ mới</span>
                </div>
            )}
        </div>
    </div>
  );
}