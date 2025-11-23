import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import { 
  Plus, MapPin, Users, Edit, Trash2, Search, X, Save, Loader2, AlertTriangle, CheckCircle 
} from "lucide-react";

export default function ManageStadiums() {
  // --- 1. STATE MANAGEMENT ---
  const [stadiums, setStadiums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal Form (Thêm/Sửa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStadium, setCurrentStadium] = useState(null);
  
  // Modal Delete (Xác nhận xóa)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [stadiumToDelete, setStadiumToDelete] = useState(null);

  // Notification (Thông báo góc màn hình)
  const [notification, setNotification] = useState(null); // { message: "", type: "success" | "error" }

  // Form Data
  const [formData, setFormData] = useState({
    name: "", location: "", capacity: 0, image: "", status: "ACTIVE"
  });

  // --- 2. HELPERS ---
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Tự tắt sau 3s
  };

  // --- 3. FETCH DATA ---
  const fetchStadiums = async () => {
    setIsLoading(true);
    try {
      // Giả lập API
      setTimeout(() => {
        setStadiums([
            { id: 1, name: "Sân Mỹ Đình", location: "Hà Nội", capacity: 40192, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/My_Dinh_National_Stadium.jpg/800px-My_Dinh_National_Stadium.jpg", status: "ACTIVE" },
            { id: 2, name: "Sân Hàng Đẫy", location: "Hà Nội", capacity: 22500, image: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Hang_Day_Stadium.jpg", status: "MAINTENANCE" },
            { id: 3, name: "Sân Thống Nhất", location: "TP.HCM", capacity: 15000, image: "", status: "ACTIVE" },
        ]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Lỗi:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStadiums();
  }, []);

  // --- 4. HANDLERS ---
  const handleAddNew = () => {
    setCurrentStadium(null);
    setFormData({ name: "", location: "", capacity: 0, image: "", status: "ACTIVE" });
    setIsModalOpen(true);
  };

  const handleEdit = (stadium) => {
    setCurrentStadium(stadium);
    setFormData(stadium);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
        if (currentStadium) {
            // API PUT...
            setStadiums(stadiums.map(s => s.id === currentStadium.id ? { ...formData, id: s.id } : s));
            showNotification("Cập nhật sân thành công!");
        } else {
            // API POST...
            const newId = stadiums.length + 1;
            setStadiums([...stadiums, { ...formData, id: newId }]);
            showNotification("Thêm sân mới thành công!");
        }
        setIsModalOpen(false);
    } catch (error) {
        showNotification("Có lỗi xảy ra!", "error");
    }
  };

  // Bấm nút xóa -> Mở Modal xác nhận trước
  const confirmDelete = (stadium) => {
    setStadiumToDelete(stadium);
    setDeleteModalOpen(true);
  };

  // Thực sự xóa khi bấm "Đồng ý"
  const handleDeleteExecute = async () => {
    if (!stadiumToDelete) return;
    try {
        // API DELETE...
        setStadiums(stadiums.filter(s => s.id !== stadiumToDelete.id));
        showNotification("Đã xóa sân vận động");
    } catch (error) {
        showNotification("Xóa thất bại!", "error");
    } finally {
        setDeleteModalOpen(false);
        setStadiumToDelete(null);
    }
  };

  const filteredStadiums = stadiums.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen relative">
        
        {/* --- NOTIFICATION TOAST (Góc phải trên) --- */}
        {notification && (
            <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white transform transition-all animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                <span className="font-medium">{notification.message}</span>
            </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sân vận động</h1>
            <p className="text-gray-500 text-sm">Quản lý danh sách sân thi đấu.</p>
          </div>
          <button onClick={handleAddNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={20} />
            <span>Thêm mới</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* --- TABLE VIEW (Nhỏ gọn hơn Grid) --- */}
        {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
                        <tr>
                            <th className="p-4 w-20">Ảnh</th>
                            <th className="p-4">Tên sân</th>
                            <th className="p-4">Địa điểm</th>
                            <th className="p-4">Sức chứa</th>
                            <th className="p-4 text-center">Trạng thái</th>
                            <th className="p-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredStadiums.length > 0 ? (
                            filteredStadiums.map((stadium) => (
                                <tr key={stadium.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-3">
                                        <img 
                                            src={stadium.image || "https://via.placeholder.com/100?text=NoImg"} 
                                            alt="" 
                                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                            onError={(e) => e.target.src="https://via.placeholder.com/100?text=Error"}
                                        />
                                    </td>
                                    <td className="p-3 font-medium text-gray-800">{stadium.name}</td>
                                    <td className="p-3 text-gray-600 text-sm">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={14} className="text-gray-400"/>
                                            {stadium.location}
                                        </div>
                                    </td>
                                    <td className="p-3 text-gray-600 text-sm">
                                        {stadium.capacity.toLocaleString()}
                                    </td>
                                    <td className="p-3 text-center">
                                        {stadium.status === 'ACTIVE' ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                Hoạt động
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                Bảo trì
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right space-x-2">
                                        <button 
                                            onClick={() => handleEdit(stadium)}
                                            className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                            title="Sửa"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => confirmDelete(stadium)}
                                            className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="p-6 text-center text-gray-500">Không có dữ liệu</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* --- MODAL FORM (THÊM / SỬA) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">{currentStadium ? "Cập nhật" : "Thêm mới"}</h3>
                    <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sân</label>
                        <input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                        <input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                            <input type="number" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="MAINTENANCE">Bảo trì</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link ảnh</label>
                        <input type="url" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Hủy</button>
                        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm"><Save size={16}/> Lưu</button>
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
                    Bạn có chắc muốn xóa sân <strong>{stadiumToDelete?.name}</strong>? Hành động này không thể hoàn tác.
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