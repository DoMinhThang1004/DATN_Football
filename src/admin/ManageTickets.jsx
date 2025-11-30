import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import { 
  Plus, Tag, Edit, Trash2, X, Save, Loader2, AlertTriangle, CheckCircle 
} from "lucide-react";

// API URL
const API_URL = "http://localhost:5000/api/ticket-types";

export default function ManageTickets() {
  // --- STATE ---
  const [types, setTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  // Form Data (Khớp với DB: color_code, base_price)
  const [formData, setFormData] = useState({
    name: "", base_price: 0, color_code: "#3B82F6", description: ""
  });

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- FETCH DATA ---
  const fetchTicketTypes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTypes(data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu", error);
      showNotification("Không thể kết nối Server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketTypes();
  }, []);

  // --- HANDLERS ---
  const handleAddNew = () => {
    setCurrentType(null);
    setFormData({ name: "", base_price: 0, color_code: "#3B82F6", description: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (type) => {
    setCurrentType(type);
    setFormData({
        name: type.name,
        base_price: type.base_price,
        color_code: type.color_code,
        description: type.description
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validate
    const payload = {
        ...formData,
        base_price: Number(formData.base_price) || 0
    };

    try {
        let response;
        if (currentType) {
            // PUT
            response = await fetch(`${API_URL}/${currentType.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            // POST
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (response.ok) {
            showNotification(currentType ? "Cập nhật thành công!" : "Thêm mới thành công!");
            fetchTicketTypes();
            setIsModalOpen(false);
        } else {
            showNotification("Lỗi khi lưu dữ liệu!", "error");
        }
    } catch (error) {
        showNotification("Lỗi kết nối!", "error");
    }
  };

  const confirmDelete = (type) => {
    setTicketToDelete(type);
    setDeleteModalOpen(true);
  };

  const handleDeleteExecute = async () => {
    if (!ticketToDelete) return;
    try {
        const response = await fetch(`${API_URL}/${ticketToDelete.id}`, { method: 'DELETE' });
        if (response.ok) {
            showNotification("Đã xóa loại vé");
            fetchTicketTypes();
        } else {
            showNotification("Xóa thất bại!", "error");
        }
    } catch (error) {
        showNotification("Lỗi kết nối!", "error");
    } finally {
        setDeleteModalOpen(false);
        setTicketToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen relative">
        
        {notification && (
            <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                <span className="font-medium">{notification.message}</span>
            </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Cấu hình Loại Vé</h1>
            <p className="text-gray-500 text-sm">Định nghĩa các hạng vé và màu sắc hiển thị trên sơ đồ (Dữ liệu thật).</p>
          </div>
          <button onClick={handleAddNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
            <Plus size={20} /> <span>Thêm loại vé</span>
          </button>
        </div>

        {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
                        <tr>
                            <th className="p-4">Tên hạng vé</th>
                            <th className="p-4">Màu hiển thị</th>
                            <th className="p-4">Giá sàn (Gợi ý)</th>
                            <th className="p-4">Mô tả</th>
                            <th className="p-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {types.length > 0 ? (
                            types.map((type) => (
                                <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                                        <Tag size={16} className="text-gray-400"/> {type.name}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full border shadow-sm" style={{ backgroundColor: type.color_code }}></div>
                                            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">{type.color_code}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-blue-600">{Number(type.base_price).toLocaleString()} đ</td>
                                    <td className="p-4 text-sm text-gray-500 max-w-xs truncate">{type.description}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => handleEdit(type)} className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg"><Edit size={18} /></button>
                                        <button onClick={() => confirmDelete(type)} className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">Chưa có loại vé nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">{currentType ? "Cập nhật Loại vé" : "Thêm Loại vé mới"}</h3>
                    <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên hạng vé</label>
                        <input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Màu hiển thị</label>
                        <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-300 shadow-sm cursor-pointer">
                                <input type="color" className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                    value={formData.color_code} onChange={(e) => setFormData({...formData, color_code: e.target.value})} />
                            </div>
                            <input type="text" className="flex-1 w-full border rounded-lg px-3 py-2 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.color_code} onChange={(e) => setFormData({...formData, color_code: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá vé cơ bản (VNĐ)</label>
                        <input type="number" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.base_price} onChange={(e) => setFormData({...formData, base_price: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                        <textarea rows="3" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Hủy</button>
                        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm"><Save size={16}/> Lưu</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><AlertTriangle size={24} /></div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xóa?</h3>
                <p className="text-gray-500 text-sm mb-6">Bạn có chắc muốn xóa loại vé <strong>{ticketToDelete?.name}</strong>?</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Hủy bỏ</button>
                    <button onClick={handleDeleteExecute} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Xóa ngay</button>
                </div>
            </div>
        </div>
      )}
    </AdminLayout>
  );
}