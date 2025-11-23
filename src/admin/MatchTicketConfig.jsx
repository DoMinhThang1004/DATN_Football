import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout.jsx";
import { 
  ArrowLeft, Plus, Save, Trash2, Tag, MapPin, Edit, X, 
  Loader2, CheckCircle, AlertTriangle 
} from "lucide-react";

export default function MatchTicketConfig() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE DỮ LIỆU ---
  const [matchInfo, setMatchInfo] = useState(null);
  const [ticketConfigs, setTicketConfigs] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  
  // State cho Dropdown Khu vực
  const [stadiumZones, setStadiumZones] = useState([]);

  // State cho Form (Thêm/Sửa)
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    typeId: "",
    price: 0,
    quantity: 0,
    zoneName: ""
  });

  // State Thông báo (Toast)
  const [notification, setNotification] = useState(null);

  // --- STATE MODAL XÓA (MỚI THÊM) ---
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState(null);

  // --- HELPERS ---
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- 1. FETCH DATA ---
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setMatchInfo({
        id: id,
        homeTeam: "Việt Nam",
        awayTeam: "Thái Lan",
        stadium: "Sân vận động Mỹ Đình",
        startTime: "2025-11-20T19:30"
      });

      const types = [
        { id: 1, name: "VIP", defaultPrice: 500000 },
        { id: 2, name: "Standard A", defaultPrice: 300000 },
        { id: 3, name: "Standard B", defaultPrice: 150000 },
        { id: 4, name: "Away Fan", defaultPrice: 200000 },
      ];
      setAvailableTypes(types);

      setStadiumZones([
        "Khán đài A - Tầng 1", "Khán đài A - Tầng 2", "Khán đài A - VIP",
        "Khán đài B - Tầng 1", "Khán đài B - Tầng 2",
        "Khán đài C - Tầng 1", "Khán đài D - Tầng 1"
      ]);

      setTicketConfigs([
        { id: 101, typeId: 1, typeName: "VIP", zoneName: "Khán đài A - VIP", price: 1000000, quantity: 500, sold: 120 },
        { id: 102, typeId: 2, typeName: "Standard A", zoneName: "Khán đài B - Tầng 1", price: 300000, quantity: 2000, sold: 450 }
      ]);

      setFormData({ typeId: types[0].id, price: types[0].defaultPrice, quantity: 0, zoneName: "" });
      setIsLoading(false);
    }, 600);
  }, [id]);

  // --- 2. HANDLERS ---

  const handleTypeChange = (e) => {
    const typeId = parseInt(e.target.value);
    const selectedType = availableTypes.find(t => t.id === typeId);
    setFormData(prev => ({
      ...prev,
      typeId: typeId,
      price: selectedType ? selectedType.defaultPrice : 0
    }));
  };

  const handleEditClick = (config) => {
    setEditingId(config.id);
    setFormData({
        typeId: config.typeId,
        price: config.price,
        quantity: config.quantity,
        zoneName: config.zoneName
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    const defaultType = availableTypes[0];
    setFormData({
        typeId: defaultType?.id || "",
        price: defaultType?.defaultPrice || 0,
        quantity: 0,
        zoneName: "" 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.zoneName) {
        showNotification("Vui lòng chọn khu vực khán đài!", "error");
        return;
    }
    if (formData.quantity <= 0) {
        showNotification("Số lượng vé phải lớn hơn 0!", "error");
        return;
    }

    const selectedType = availableTypes.find(t => t.id === parseInt(formData.typeId));

    if (editingId) {
        setTicketConfigs(prev => prev.map(item => 
            item.id === editingId 
            ? { 
                ...item, 
                typeId: selectedType.id,
                typeName: selectedType.name,
                zoneName: formData.zoneName,
                price: formData.price,
                quantity: formData.quantity
              } 
            : item
        ));
        showNotification("Cập nhật vé thành công!");
        handleCancelEdit();
    } else {
        const isExist = ticketConfigs.some(t => t.zoneName === formData.zoneName && t.typeName === selectedType.name);
        if (isExist) {
            showNotification("Lô vé này đã tồn tại trong danh sách!", "error");
            return;
        }

        const newConfig = {
            id: Date.now(),
            typeId: selectedType.id,
            typeName: selectedType.name,
            zoneName: formData.zoneName,
            price: formData.price,
            quantity: formData.quantity,
            sold: 0
        };
        setTicketConfigs([...ticketConfigs, newConfig]);
        showNotification("Đã phát hành lô vé mới!");
        setFormData(prev => ({ ...prev, zoneName: "", quantity: 0 }));
    }
  };

  // --- LOGIC XÓA MỚI (CÓ MODAL) ---
  
  // 1. Bấm nút thùng rác -> Mở modal
  const confirmDelete = (config) => {
    setConfigToDelete(config);
    setDeleteModalOpen(true);
  };

  // 2. Bấm Đồng ý trong modal -> Xóa thật
  const handleDeleteExecute = () => {
    if (!configToDelete) return;

    setTicketConfigs(prev => prev.filter(c => c.id !== configToDelete.id));
    showNotification("Đã xóa lô vé thành công", "success");
    
    if (editingId === configToDelete.id) handleCancelEdit();
    
    // Đóng modal
    setDeleteModalOpen(false);
    setConfigToDelete(null);
  };

  if (isLoading) {
    return (
        <AdminLayout>
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-blue-600" size={40}/>
            </div>
        </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen relative">
        
        {/* TOAST NOTIFICATION */}
        {notification && (
            <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white transform transition-all animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                <span className="font-medium">{notification.message}</span>
            </div>
        )}

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate('/admin/manage-matches')} className="p-2 bg-white border rounded-full hover:bg-gray-100 transition">
                <ArrowLeft size={20} className="text-gray-600"/>
            </button>
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Cấu hình vé: {matchInfo?.homeTeam} vs {matchInfo?.awayTeam}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <MapPin size={14}/> {matchInfo?.stadium} 
                    <span className="mx-2">|</span> 
                    {new Date(matchInfo?.startTime).toLocaleString('vi-VN')}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* FORM (TRÁI) */}
            <div className="lg:col-span-1">
                <div className={`bg-white p-6 rounded-xl shadow-sm border sticky top-24 transition-colors ${editingId ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100'}`}>
                    
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            {editingId ? <Edit size={20} className="text-blue-600"/> : <Plus size={20} className="text-green-600"/>} 
                            {editingId ? "Chỉnh sửa lô vé" : "Phát hành vé mới"}
                        </h3>
                        {editingId && (
                            <button onClick={handleCancelEdit} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600">
                                Hủy bỏ
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại vé (Mẫu)</label>
                            <select 
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={formData.typeId}
                                onChange={handleTypeChange}
                            >
                                {availableTypes.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} - Gốc: {t.defaultPrice.toLocaleString()}đ</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực / Khán đài</label>
                            <select 
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={formData.zoneName}
                                onChange={e => setFormData({...formData, zoneName: e.target.value})}
                            >
                                <option value="">-- Chọn khu vực --</option>
                                {stadiumZones.map((zone, idx) => (
                                    <option key={idx} value={zone}>{zone}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán trận này (VNĐ)</label>
                            <input 
                                type="number" 
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng phát hành</label>
                            <input 
                                type="number" 
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.quantity}
                                onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className={`w-full text-white py-2 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 transition-colors ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            <Save size={18}/> {editingId ? "Cập nhật thay đổi" : "Lưu cấu hình"}
                        </button>
                    </form>
                </div>
            </div>

            {/* DANH SÁCH (PHẢI) */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Danh sách vé đang bán</h3>
                        <div className="text-sm text-gray-500">
                            Tổng cộng: <span className="font-bold text-blue-600">{ticketConfigs.reduce((acc, curr) => acc + curr.quantity, 0).toLocaleString()}</span> vé
                        </div>
                    </div>
                    
                    {ticketConfigs.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="bg-white text-gray-500 text-sm border-b">
                                <tr>
                                    <th className="p-4">Loại vé</th>
                                    <th className="p-4">Khu vực</th>
                                    <th className="p-4">Giá bán</th>
                                    <th className="p-4 text-center">SL</th>
                                    <th className="p-4 text-right">Đã bán</th>
                                    <th className="p-4 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {ticketConfigs.map(config => (
                                    <tr key={config.id} className={`hover:bg-gray-50 transition-colors ${editingId === config.id ? 'bg-blue-50' : ''}`}>
                                        <td className="p-4 font-medium text-blue-600 flex items-center gap-2">
                                            <Tag size={16} className="text-gray-400"/> {config.typeName}
                                        </td>
                                        <td className="p-4 text-gray-800">{config.zoneName}</td>
                                        <td className="p-4 font-bold text-green-600">{config.price.toLocaleString()} đ</td>
                                        <td className="p-4 text-center font-medium">{config.quantity.toLocaleString()}</td>
                                        <td className="p-4 text-right text-gray-500">{config.sold}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEditClick(config)}
                                                    className="p-2 text-gray-500 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit size={16}/>
                                                </button>
                                                <button 
                                                    onClick={() => confirmDelete(config)}
                                                    className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition"
                                                    title="Xóa"
                                                    disabled={config.sold > 0} // Không cho xóa nếu đã bán
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-10 text-center text-gray-400">
                            <Ticket size={40} className="mx-auto mb-2 opacity-20"/>
                            <p>Chưa có vé nào được cấu hình cho trận này.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>

      {/* --- MODAL CONFIRM DELETE (XÁC NHẬN XÓA GIỮA MÀN HÌNH) --- */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all scale-100">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xóa?</h3>
                <p className="text-gray-500 text-sm mb-6">
                    Bạn có chắc muốn xóa lô vé <strong>{configToDelete?.typeName} - {configToDelete?.zoneName}</strong>? Hành động này không thể hoàn tác.
                </p>
                <div className="flex gap-3 justify-center">
                    <button 
                        onClick={() => setDeleteModalOpen(false)} 
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={handleDeleteExecute} 
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors shadow-md"
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