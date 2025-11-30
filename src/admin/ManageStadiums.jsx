import React, { useState, useEffect } from "react";
import { 
  Plus, MapPin, Edit, Trash2, Search, X, Save, Loader2, AlertTriangle, CheckCircle, UploadCloud, LayoutDashboard, Menu, Image as ImageIcon
} from "lucide-react";
import AdminLayout from "../layouts/AdminLayout.jsx";
// CẤU HÌNH API
const API_URL = "http://localhost:5000/api/stadiums";
const UPLOAD_URL = "http://localhost:5000/api/upload"; 

export default function ManageStadiums() {
  // --- STATE ---
  const [stadiums, setStadiums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal & Notification
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStadium, setCurrentStadium] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [stadiumToDelete, setStadiumToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  // Form Data (Đã xóa image_extra, chỉ giữ 1 image_url)
  const [formData, setFormData] = useState({
    name: "", location: "", capacity: 0, image_url: "", status: "ACTIVE"
  });

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState(""); // Lưu tên file để hiển thị

  // Helper Notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- 2. FETCH DATA ---
  const fetchStadiums = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Lỗi kết nối Server");
      
      const data = await response.json();
      setStadiums(data); 
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      // Dữ liệu mẫu giả lập nếu API lỗi
      setStadiums([
          { id: 1, name: "Sân vận động Mỹ Đình", location: "Hà Nội", capacity: 40192, status: "ACTIVE", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/My_Dinh_National_Stadium.jpg/800px-My_Dinh_National_Stadium.jpg" },
          { id: 2, name: "Sân vận động Thống Nhất", location: "TP.HCM", capacity: 15000, status: "MAINTENANCE", image_url: "" }
      ]);
      showNotification("Đang dùng dữ liệu Demo (API chưa chạy)", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStadiums();
  }, []);

  // --- HANDLERS ---
  const handleAddNew = () => {
    setCurrentStadium(null);
    setFormData({ name: "", location: "", capacity: 0, image_url: "", status: "ACTIVE" });
    setFileName("");
    setIsModalOpen(true);
  };

  const handleEdit = (stadium) => {
    setCurrentStadium(stadium);
    setFormData({
        name: stadium.name,
        location: stadium.location,
        capacity: stadium.capacity,
        image_url: stadium.image_url || "", 
        status: stadium.status
    });
    setFileName(""); // Reset tên file khi mở edit
    setIsModalOpen(true);
  };

  // --- UPLOAD LOGIC (Đã sửa lỗi Base64 quá lớn) ---
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setIsUploading(true);

    const data = new FormData();
    data.append("file", file);

    try {
        // 1. Gọi API upload để lấy URL
        const res = await fetch(UPLOAD_URL, { method: "POST", body: data });
        
        if (!res.ok) throw new Error("API Upload failed");

        const result = await res.json();
        
        // 2. Gán URL trả về vào formData
        setFormData(prev => ({ ...prev, image_url: result.url }));
        showNotification("Upload ảnh thành công!");

    } catch (error) {
        console.warn("API Upload lỗi hoặc chưa có, dùng chế độ Preview cục bộ");
        
        // Fallback: Dùng URL tạm (blob) để hiển thị preview nếu không có server
        // Lưu ý: Blob URL này chỉ sống trong phiên làm việc hiện tại
        setTimeout(() => {
            const fakeUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, image_url: fakeUrl }));
            showNotification("Đã chọn ảnh (Chế độ Preview)");
            setIsUploading(false);
        }, 500);
        return;
    }
    setIsUploading(false);
  };

  // --- 3. LƯU DỮ LIỆU ---
  const handleSave = async (e) => {
    e.preventDefault();
    
    const payload = {
        ...formData,
        capacity: Number(formData.capacity) || 0
    };

    // LOG PAYLOAD RA CONSOLE ĐỂ KIỂM TRA
    console.log("Dữ liệu chuẩn bị gửi:", payload);

    try {
        // Thử gọi API thật
        let response;
        const url = currentStadium ? `${API_URL}/${currentStadium.id}` : API_URL;
        const method = currentStadium ? 'PUT' : 'POST';

        response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Lỗi Server: ${errText}`);
        }

        showNotification(currentStadium ? "Cập nhật thành công!" : "Thêm mới thành công!");
        fetchStadiums(); 
        setIsModalOpen(false);

    } catch (error) {
        console.error("Lỗi lưu dữ liệu:", error);
        
        // --- FALLBACK: DEMO MODE (Cập nhật UI ngay cả khi không có backend) ---
        if (currentStadium) {
            setStadiums(prev => prev.map(s => s.id === currentStadium.id ? { ...s, ...payload } : s));
            showNotification("Đã lưu (Chế độ Demo - API lỗi)", "success");
        } else {
            setStadiums(prev => [...prev, { id: Date.now(), ...payload }]);
            showNotification("Đã thêm (Chế độ Demo - API lỗi)", "success");
        }
        setIsModalOpen(false);
    }
  };

  const confirmDelete = (stadium) => {
    setStadiumToDelete(stadium);
    setDeleteModalOpen(true);
  };

  // --- 4. XÓA DỮ LIỆU ---
  const handleDeleteExecute = async () => {
    if (!stadiumToDelete) return;
    
    // Demo xóa trên UI trước để trải nghiệm mượt mà
    setStadiums(prev => prev.filter(s => s.id !== stadiumToDelete.id));
    showNotification("Đã xóa sân vận động");
    setDeleteModalOpen(false);
    setStadiumToDelete(null);

    try {
        await fetch(`${API_URL}/${stadiumToDelete.id}`, { method: 'DELETE' });
    } catch (error) {
        console.log("API Delete error (ignored in demo)");
    }
  };

  const filteredStadiums = stadiums.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen relative">
        
        {notification && (
            <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                <span className="font-medium">{notification.message}</span>
            </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sân vận động</h1>
            <p className="text-gray-500 text-sm">Quản lý danh sách sân thi đấu.</p>
          </div>
          <button onClick={handleAddNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm">
            <Plus size={20} />
            <span>Thêm mới</span>
          </button>
        </div>

        <div className="mb-6 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
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
                                        <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                                            {stadium.image_url ? (
                                                <img src={stadium.image_url} alt="" className="w-full h-full object-cover" onError={(e) => e.target.src="https://via.placeholder.com/100?text=Error"}/>
                                            ) : (
                                                <ImageIcon size={20} className="text-gray-300" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3 font-medium text-gray-800">{stadium.name}</td>
                                    <td className="p-3 text-gray-600 text-sm">
                                        <div className="flex items-center gap-1"><MapPin size={14} className="text-gray-400"/>{stadium.location}</div>
                                    </td>
                                    <td className="p-3 text-gray-600 text-sm">{stadium.capacity?.toLocaleString()}</td>
                                    <td className="p-3 text-center">
                                        {stadium.status === 'ACTIVE' ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Hoạt động</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Bảo trì</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right space-x-2">
                                        <button onClick={() => handleEdit(stadium)} className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg"><Edit size={18} /></button>
                                        <button onClick={() => confirmDelete(stadium)} className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="p-6 text-center text-gray-500">Chưa có dữ liệu. Hãy thêm mới!</td></tr>
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
                    <h3 className="text-lg font-bold text-gray-800">{currentStadium ? "Cập nhật Sân" : "Thêm Sân mới"}</h3>
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
                                value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} />
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
                    
                    {/* KHU VỰC UPLOAD ẢNH (1 Nút duy nhất) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh sân</label>
                        <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${formData.image_url ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                            {isUploading ? (
                                <div className="flex flex-col items-center">
                                    <Loader2 className="animate-spin text-blue-500 mb-2" />
                                    <span className="text-xs text-gray-500">Đang tải lên...</span>
                                </div>
                            ) : formData.image_url ? (
                                <div className="relative w-full h-full p-2 flex flex-col items-center justify-center group">
                                    <img src={formData.image_url} alt="Stadium" className="max-w-full max-h-[85%] object-contain rounded-md shadow-sm" />
                                    <div className="mt-1 flex items-center gap-2">
                                        {fileName && <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border truncate max-w-[150px]">{fileName}</span>}
                                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Thay đổi</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center pt-5 pb-6">
                                    <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500 font-semibold">Click để chọn ảnh</p>
                                    <p className="text-xs text-gray-400">PNG, JPG (Max 5MB)</p>
                                </div>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Hủy</button>
                        <button type="submit" disabled={isUploading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm disabled:opacity-50">
                            <Save size={16}/> {isUploading ? "Đang xử lý..." : "Lưu dữ liệu"}
                        </button>
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
                <p className="text-gray-500 text-sm mb-6">Bạn có chắc muốn xóa sân <strong>{stadiumToDelete?.name}</strong>? Hành động này không thể hoàn tác.</p>
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