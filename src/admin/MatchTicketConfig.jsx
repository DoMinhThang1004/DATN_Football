// ... (Giữ nguyên import và các phần trên)
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout.jsx";
import { 
  ArrowLeft, Plus, Save, Trash2, Tag, MapPin, Edit, X, 
  Loader2, CheckCircle, AlertTriangle, PieChart 
} from "lucide-react";

const API_HOST = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = `${API_HOST}/api`;


export default function MatchTicketConfig() {
  //state trạgn thái
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [matchInfo, setMatchInfo] = useState(null);       
  const [ticketConfigs, setTicketConfigs] = useState([]); 
  const [availableTypes, setAvailableTypes] = useState([]); 
  const [stadiumZones, setStadiumZones] = useState([]);   
  const [formData, setFormData] = useState({ typeId: "", zoneId: "", price: 0, quantity: 0 });
  const [editingId, setEditingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  //data
  const fetchAllData = async () => {
      try {
          setIsLoading(true);
          const [resMatches, resTypes, resZones, resConfigs] = await Promise.all([
              fetch(`${API_BASE}/matches`), 
              fetch(`${API_BASE}/ticket-types`),
              fetch(`${API_BASE}/match-t-configs/zones/${id}`),
              fetch(`${API_BASE}/match-t-configs/match/${id}`)
          ]);
          if (!resMatches.ok || !resTypes.ok || !resZones.ok || !resConfigs.ok) throw new Error("Lỗi kết nối API");

          const matches = await resMatches.json();
          const types = await resTypes.json();
          const zones = await resZones.json();
          const configs = await resConfigs.json();

          const currentMatch = matches.find(m => m.id == id);
          setMatchInfo(currentMatch);
          setAvailableTypes(types);
          setStadiumZones(zones);

          const formattedConfigs = configs.map(c => ({
              id: c.id,
              typeId: c.ticket_type_id,
              typeName: c.type_name,      
              colorCode: c.color_code,    
              zoneName: c.zone_name,      
              zoneId: c.stadium_zone_id,
              price: Number(c.price),
              quantity: c.quantity_allocated,
              sold: c.quantity_sold || 0,
              //lưu capacity để hiển thị
              capacity: c.zone_capacity 
          }));
          setTicketConfigs(formattedConfigs);

          if (!editingId) {
              if (types.length > 0) setFormData(prev => ({ ...prev, typeId: types[0].id, price: Number(types[0].base_price) }));
              if (zones.length > 0) setFormData(prev => ({ ...prev, zoneId: zones[0].id }));
          }
      } catch (error) {
          console.error("Lỗi tải dữ liệu:", error);
          showNotification("Lỗi kết nối Server!", "error");
      } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAllData(); }, [id]);
  const maxTickets = matchInfo ? parseInt(matchInfo.total_tickets) : 0;
  const allocatedTickets = ticketConfigs.reduce((sum, item) => sum + item.quantity, 0);
  const remainingTickets = maxTickets - allocatedTickets;

  const handleTypeChange = (e) => {
    const typeId = Number(e.target.value);
    const selectedType = availableTypes.find(t => t.id === typeId);
    setFormData(prev => ({ ...prev, typeId: typeId, price: selectedType ? Number(selectedType.base_price) : 0 }));
  };

  const handleEditClick = (config) => {
      setEditingId(config.id);
      setFormData({ typeId: config.typeId, zoneId: config.zoneId, price: config.price, quantity: config.quantity });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
      setEditingId(null);
      const defaultType = availableTypes.length > 0 ? availableTypes[0] : null;
      const defaultZone = stadiumZones.length > 0 ? stadiumZones[0] : null;
      setFormData({
          typeId: defaultType ? defaultType.id : "",
          zoneId: defaultZone ? defaultZone.id : "",
          price: defaultType ? Number(defaultType.base_price) : 0,
          quantity: 0
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.zoneId) { showNotification("Vui lòng chọn khu vực!", "error"); return; }
    const inputQty = parseInt(formData.quantity);
    if (inputQty <= 0) { showNotification("Số lượng phải lớn hơn 0", "error"); return; }

    try {
        const payload = {
            match_id: id,
            ticket_type_id: formData.typeId,
            stadium_zone_id: formData.zoneId,
            price: formData.price,
            total_quantity: inputQty
        };
        let response;
        if (editingId) {
            response = await fetch(`${API_BASE}/match-t-configs/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        } else {
            response = await fetch(`${API_BASE}/match-t-configs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        }
        const result = await response.json();

        if (response.ok) {
            showNotification(editingId ? "Cập nhật thành công!" : "Đã thêm cấu hình vé!");
            fetchAllData(); 
            if (editingId) handleCancelEdit();
            else setFormData(prev => ({ ...prev, quantity: 0 }));
        } else {
            showNotification(result.message || "Lỗi khi lưu!", "error");
        }
    } catch (error) { showNotification("Lỗi kết nối!", "error"); }
  };

  const confirmDelete = (config) => { setConfigToDelete(config); setDeleteModalOpen(true); };
  const handleDeleteExecute = async () => {
    if (!configToDelete) return;
    try {
        const response = await fetch(`${API_BASE}/match-t-configs/${configToDelete.id}`, { method: 'DELETE' });
        if (response.ok) { showNotification("Đã xóa thành công"); fetchAllData(); if (editingId === configToDelete.id) handleCancelEdit(); } 
        else { const result = await response.json(); showNotification(result.message || "Xóa thất bại", "error"); }
    } catch (error) { showNotification("Lỗi kết nối!", "error"); } finally { setDeleteModalOpen(false); setConfigToDelete(null); }
  };

  if (isLoading) return <AdminLayout><div className="flex h-screen justify-center items-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen relative">
        {notification && <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}<span className="font-medium">{notification.message}</span></div>}

        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/manage-matches')} className="p-2 bg-white border rounded-full hover:bg-gray-100 transition"><ArrowLeft size={20} className="text-gray-600"/></button>
                <div><h1 className="text-2xl font-bold text-gray-800">{matchInfo?.home_team} vs {matchInfo?.away_team}</h1><p className="text-sm text-gray-500 flex items-center gap-2 mt-1"><MapPin size={14}/> {matchInfo?.stadium_name}</p></div>
            </div>
            <div className="bg-white border px-5 py-3 rounded-xl shadow-sm flex items-center gap-6"><div className="text-center border-r pr-6"><p className="text-xs text-gray-500 uppercase font-bold">Tổng sức chứa</p><p className="text-xl font-black text-gray-800">{maxTickets.toLocaleString()}</p></div><div className="text-center border-r pr-6"><p className="text-xs text-gray-500 uppercase font-bold">Đã phân bổ</p><p className="text-xl font-black text-blue-600">{allocatedTickets.toLocaleString()}</p></div><div className="text-center"><p className="text-xs text-gray-500 uppercase font-bold">Còn lại</p><p className={`text-xl font-black ${remainingTickets < 0 ? 'text-red-600' : 'text-green-600'}`}>{remainingTickets.toLocaleString()}</p></div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <div className={`bg-white p-6 rounded-xl shadow-sm border sticky top-24 transition-all ${editingId ? 'border-blue-500 ring-1 ring-blue-500' : 'border-blue-100'}`}>
                    <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">{editingId ? <Edit size={20} className="text-blue-600"/> : <Plus size={20} className="text-green-600"/>} {editingId ? "Chỉnh sửa cấu hình" : "Phát hành vé mới"}</h3>{editingId && (<button onClick={handleCancelEdit} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600">Hủy bỏ</button>)}</div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Loại vé</label><select className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.typeId} onChange={handleTypeChange}>{availableTypes.map(t => (<option key={t.id} value={t.id}>{t.name} (Gốc: {Number(t.base_price).toLocaleString()}đ)</option>))}</select></div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực / Khán đài</label>
                            <select className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.zoneId} onChange={e => setFormData({...formData, zoneId: e.target.value})}>
                                {stadiumZones.length === 0 ? (<option value="" disabled>⚠️ Sân này chưa có khu vực nào!</option>) : (<><option value="" disabled>-- Chọn khu vực --</option>{stadiumZones.map(z => (<option key={z.id} value={z.id}>{z.zone_name} (Max: {z.capacity} ghế)</option>))}</>)}
                            </select>
                        </div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Giá bán trận này (VNĐ)</label><input type="number" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} /></div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng vé phát hành</label>
                             <input type="number" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} />
                             {/* hiển thị max sức chứa*/}
                             {formData.zoneId && (
                                 <p className="text-xs text-gray-400 mt-1 text-right">
                                     Sức chứa khu vực: <span className="font-bold text-gray-600">{stadiumZones.find(z => z.id == formData.zoneId)?.capacity || 0}</span> ghế
                                 </p>
                             )}
                        </div>
                        <button type="submit" className={`w-full text-white py-2 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 transition-colors ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}><Save size={18}/> {editingId ? "Lưu thay đổi" : "Lưu cấu hình"}</button>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center"><h3 className="font-bold text-gray-800">Danh sách vé đang bán</h3><div className="text-sm text-gray-500">Tổng: <span className="font-bold text-blue-600">{allocatedTickets.toLocaleString()}</span> vé</div></div>
                    {ticketConfigs.length > 0 ? (
                        <table className="w-full text-left"><thead className="bg-white text-gray-500 text-sm border-b"><tr><th className="p-4">Loại vé</th><th className="p-4">Khu vực</th><th className="p-4">Giá bán</th><th className="p-4 text-center">SL</th><th className="p-4 text-right">Đã bán</th><th className="p-4 text-right">Hành động</th></tr></thead><tbody className="divide-y divide-gray-50 text-sm">{ticketConfigs.map(config => (<tr key={config.id} className={`hover:bg-gray-50 transition-colors ${editingId === config.id ? 'bg-blue-50' : ''}`}><td className="p-4 font-medium text-blue-600 flex items-center gap-2"><Tag size={16} className="text-gray-400"/> {config.typeName} <span className="w-3 h-3 rounded-full border shadow-sm" style={{backgroundColor: config.colorCode}}></span></td><td className="p-4 text-gray-800">{config.zoneName}</td><td className="p-4 font-bold text-green-600">{Number(config.price).toLocaleString()} đ</td><td className="p-4 text-center font-medium">{config.quantity.toLocaleString()}</td><td className="p-4 text-right text-gray-500">{config.sold}</td><td className="p-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => handleEditClick(config)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition" title="Sửa"><Edit size={18}/></button><button onClick={() => confirmDelete(config)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition" title="Xóa" disabled={config.sold > 0}><Trash2 size={18}/></button></div></td></tr>))}</tbody></table>
                    ) : (<div className="p-10 text-center text-gray-400"><p>Chưa có vé nào được cấu hình cho trận này.</p></div>)}
                </div>
            </div>
        </div>
      </div>
      {deleteModalOpen && (<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"><div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all scale-100"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><AlertTriangle size={24} /></div><h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xóa?</h3><p className="text-gray-500 text-sm mb-6">Bạn có chắc muốn xóa lô vé <strong>{configToDelete?.typeName} - {configToDelete?.zoneName}</strong>?</p><div className="flex gap-3 justify-center"><button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors">Hủy bỏ</button><button onClick={handleDeleteExecute} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors shadow-md">Xóa ngay</button></div></div></div>)}
    </AdminLayout>
  );
}