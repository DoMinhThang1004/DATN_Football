import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import { 
  Plus, Tag, Edit, Trash2, X, Save, Loader2, AlertTriangle, CheckCircle 
} from "lucide-react";

export default function ManageTickets() {
  // --- 1. STATE MANAGEMENT ---
  const [types, setTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State cho Modal Form (Thêm/Sửa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState(null); // null = Thêm mới, object = Sửa

  // State cho Modal Delete (Xác nhận xóa)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  // Notification (Thông báo)
  const [notification, setNotification] = useState(null);

  // State dữ liệu Form
  const [formData, setFormData] = useState({
    name: "", basePrice: 0, color: "#3B82F6", description: ""
  });

  // --- 2. HELPERS ---
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- 3. FETCH DATA ---
  const fetchTicketTypes = async () => {
    setIsLoading(true);
    try {
      setTimeout(() => {
        setTypes([
          { id: 1, name: "VIP", basePrice: 500000, color: "#F59E0B", description: "Khu vực khán đài A, có mái che, ghế đệm." },
          { id: 2, name: "Standard A", basePrice: 300000, color: "#3B82F6", description: "Khu vực khán đài B, nhìn thẳng sân." },
          { id: 3, name: "Standard B", basePrice: 150000, color: "#10B981", description: "Khu vực khán đài C, D (sau cầu môn)." },
        ]);
        setIsLoading(false);
      }, 600);
    } catch (error) {
      console.error("Lỗi tải dữ liệu", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketTypes();
  }, []);

  // --- 4. HANDLERS ---
  const handleAddNew = () => {
    setCurrentType(null);
    setFormData({ name: "", basePrice: 0, color: "#3B82F6", description: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (type) => {
    setCurrentType(type);
    setFormData(type);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
        if (currentType) {
            // API PUT...
            setTypes(types.map(t => t.id === currentType.id ? { ...formData, id: t.id } : t));
            showNotification("Cập nhật loại vé thành công!");
        } else {
            // API POST...
            const newId = types.length + 1;
            setTypes([...types, { ...formData, id: newId }]);
            showNotification("Thêm loại vé mới thành công!");
        }
        setIsModalOpen(false);
    } catch (error) {
        showNotification("Lỗi khi lưu dữ liệu!", "error");
    }
  };

  // Mở modal xác nhận xóa
  const confirmDelete = (type) => {
    setTicketToDelete(type);
    setDeleteModalOpen(true);
  };

  // Thực hiện xóa
  const handleDeleteExecute = async () => {
    if (!ticketToDelete) return;
    try {
        // API DELETE...
        setTypes(types.filter(t => t.id !== ticketToDelete.id));
        showNotification("Đã xóa loại vé thành công");
    } catch (error) {
        showNotification("Xóa thất bại!", "error");
    } finally {
        setDeleteModalOpen(false);
        setTicketToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen relative">
        
        {/* --- NOTIFICATION TOAST --- */}
        {notification && (
            <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white transform transition-all animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                <span className="font-medium">{notification.message}</span>
            </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Cấu hình Loại Vé</h1>
            <p className="text-gray-500 text-sm">Định nghĩa các hạng vé và màu sắc hiển thị trên sơ đồ.</p>
          </div>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus size={20} />
            <span>Thêm loại vé</span>
          </button>
        </div>

        {/* Table Content */}
        {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
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
                                        <Tag size={16} className="text-gray-400"/>
                                        {type.name}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-8 h-8 rounded-full border border-gray-200 shadow-sm ring-2 ring-offset-2 ring-transparent" 
                                                style={{ backgroundColor: type.color }}
                                            ></div>
                                            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                                {type.color}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-blue-600">
                                        {type.basePrice.toLocaleString()} đ
                                    </td>
                                    <td className="p-4 text-sm text-gray-500 max-w-xs truncate">
                                        {type.description}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button 
                                            onClick={() => handleEdit(type)}
                                            className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => confirmDelete(type)}
                                            className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">
                                    Chưa có loại vé nào được cấu hình.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* --- MODAL FORM (POPUP) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">
                        {currentType ? "Cập nhật Loại vé" : "Thêm Loại vé mới"}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSave}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên hạng vé</label>
                            <input type="text" required placeholder="Ví dụ: VIP, Standard..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Màu hiển thị</label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-300 shadow-sm cursor-pointer hover:opacity-90">
                                    <input type="color" className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                        value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} />
                                </div>
                                <div className="flex-1">
                                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} placeholder="#000000" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá vé cơ bản (VNĐ)</label>
                            <div className="relative">
                                <input type="number" required min="0" step="1000"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.basePrice} onChange={(e) => setFormData({...formData, basePrice: parseInt(e.target.value) || 0})} />
                                <span className="absolute right-3 top-2 text-gray-400 text-sm">VNĐ</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                            <textarea rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium">Hủy</button>
                        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium shadow-sm"><Save size={18}/> {currentType ? "Lưu thay đổi" : "Thêm mới"}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- MODAL CONFIRM DELETE (XÁC NHẬN XÓA) --- */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xóa?</h3>
                <p className="text-gray-500 text-sm mb-6">
                    Bạn có chắc muốn xóa loại vé <strong>{ticketToDelete?.name}</strong>? Các vé đã bán thuộc loại này có thể bị ảnh hưởng.
                </p>
                <div className="flex gap-3 justify-center">
                    <button 
                        onClick={() => setDeleteModalOpen(false)} 
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={handleDeleteExecute} 
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                    >
                        Xóa ngay
                    </button>
                </div>
            </div>
        </div>
      )}

    </AdminLayout>
  );
}