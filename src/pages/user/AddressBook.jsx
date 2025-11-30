import React, { useState, useEffect } from "react";
import { MapPin, Plus, Edit2, Trash2, Save, X, Home, Briefcase, AlertTriangle, AlertCircle, Loader2 } from "lucide-react";

const API_URL = "http://localhost:5000/api/addresses";

export default function AddressBook() {
  // --- STATE DỮ LIỆU ---
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // --- STATE MODAL & FORM ---
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false); 

  const [editingId, setEditingId] = useState(null); 
  const [deleteId, setDeleteId] = useState(null);   
  
  const [form, setForm] = useState({ label: 'Nhà riêng', detail: '', receiverName: '', receiverPhone: '' });
  const [error, setError] = useState(""); 

  // --- 1. FETCH DATA ---
  const fetchAddresses = async (userId) => {
    setIsLoading(true);
    try {
        const res = await fetch(`${API_URL}/user/${userId}`);
        const data = await res.json();
        // Map từ snake_case (DB) sang camelCase (Frontend)
        const mappedData = data.map(addr => ({
            id: addr.id,
            label: addr.label,
            detail: addr.detail,
            receiverName: addr.receiver_name,
            receiverPhone: addr.receiver_phone
        }));
        setAddresses(mappedData);
    } catch (error) {
        console.error("Lỗi tải địa chỉ:", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (storedUser) {
        setCurrentUser(storedUser);
        fetchAddresses(storedUser.id);
    }
  }, []);

  // --- HÀM XỬ LÝ FORM ---
  const handleEdit = (addr) => {
    setEditingId(addr.id);
    setForm(addr);
    setError("");
    setShowFormModal(true);
  };

  const handleAdd = () => {
    if (addresses.length >= 2) {
        setShowLimitModal(true);
        return;
    }
    setEditingId(null);
    setForm({ label: 'Nhà riêng', detail: '', receiverName: '', receiverPhone: '' });
    setError("");
    setShowFormModal(true);
  };

  const handleSave = async () => {
    // VALIDATE
    if (!form.receiverName.trim() || !form.receiverPhone.trim() || !form.detail.trim()) {
        setError("Vui lòng điền đầy đủ thông tin!");
        return;
    }
    if (!/^[0-9]{10}$/.test(form.receiverPhone)) {
        setError("Số điện thoại không hợp lệ (phải có 10 chữ số)!");
        return;
    }
    
    // Chuẩn bị dữ liệu gửi lên (snake_case)
    const payload = {
        user_id: currentUser.id,
        label: form.label,
        receiver_name: form.receiverName,
        receiver_phone: form.receiverPhone,
        detail: form.detail
    };

    try {
        let res;
        if (editingId) {
            // PUT
            res = await fetch(`${API_URL}/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            // POST
            res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (res.ok) {
            fetchAddresses(currentUser.id); // Load lại danh sách
            setShowFormModal(false);
        } else {
            const err = await res.json();
            setError(err.message || "Lỗi khi lưu địa chỉ!");
        }
    } catch (error) {
        setError("Lỗi kết nối Server!");
    }
  };

  // --- HÀM XỬ LÝ XÓA ---
  const requestDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
        await fetch(`${API_URL}/${deleteId}`, { method: 'DELETE' });
        setAddresses(addresses.filter(a => a.id !== deleteId));
        setShowDeleteModal(false);
        setDeleteId(null);
    } catch (error) {
        alert("Lỗi khi xóa!");
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[500px] p-6 relative">
        
        {/* --- MODAL CẢNH BÁO GIỚI HẠN --- */}
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
            <button 
                onClick={handleAdd} 
                className={`px-4 py-2 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-all ${addresses.length >= 2 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'}`}
            >
                <Plus size={16}/> Thêm mới
            </button>
        </div>

        {addresses.length > 0 ? (
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
            </div>
        ) : (
             <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <MapPin size={40} className="mb-2 opacity-20"/>
                <p>Bạn chưa lưu địa chỉ nào.</p>
             </div>
        )}
    </div>
  );
}