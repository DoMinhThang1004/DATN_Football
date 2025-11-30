// ... (Giữ nguyên các import)
import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import { useNavigate } from "react-router-dom";
import { 
  Search, Plus, Filter, Calendar, MapPin, Edit, Trash2, Ticket, 
  X, Save, Loader2, AlertTriangle, CheckCircle, UploadCloud 
} from "lucide-react";

const API_URL = "http://localhost:5000/api/matches";
const STADIUM_API_URL = "http://localhost:5000/api/stadiums";
const UPLOAD_URL = "http://localhost:5000/api/upload";

// Danh sách giải đấu mẫu
const LEAGUES = ["V-League", "Cúp Quốc Gia", "Premier League", "La Liga", "Champions League", "Giao Hữu"];

export default function ManageMatches() {
  // ... (Các phần khác giữ nguyên)
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isUploadingHome, setIsUploadingHome] = useState(false);
  const [isUploadingAway, setIsUploadingAway] = useState(false);

  // 1. CẬP NHẬT STATE FORM (Thêm league)
  const [formData, setFormData] = useState({
    home_team: "", away_team: "", 
    home_logo: "", away_logo: "",
    stadium_id: "", start_time: "", 
    status: "UPCOMING", total_tickets: 0,
    league: "V-League" // Mặc định
  });

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const fetchData = async () => {
      setIsLoading(true);
      try {
          const [resMatches, resStadiums] = await Promise.all([fetch(API_URL), fetch(STADIUM_API_URL)]);
          if (!resMatches.ok || !resStadiums.ok) throw new Error("Lỗi kết nối Server");
          const matchesData = await resMatches.json();
          const stadiumsData = await resStadiums.json();
          setMatches(matchesData);
          setStadiums(stadiumsData);
      } catch (error) { console.error(error); showNotification("Lỗi tải dữ liệu", "error"); } 
      finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- HANDLERS ---
  const handleAddNew = () => {
    setCurrentMatch(null);
    // Reset form (có league)
    setFormData({ 
        home_team: "", away_team: "", home_logo: "", away_logo: "",
        stadium_id: "", start_time: "", status: "UPCOMING", total_tickets: 0,
        league: "V-League"
    });
    setIsModalOpen(true);
  };

  const handleEdit = (match) => {
    setCurrentMatch(match);
    const rawDate = match.start_time ? new Date(match.start_time).toISOString().slice(0, 16) : "";
    
    // Đổ dữ liệu vào form (có league)
    setFormData({ 
        home_team: match.home_team,
        away_team: match.away_team,
        home_logo: match.home_logo || "",
        away_logo: match.away_logo || "",
        stadium_id: match.stadium_id,
        start_time: rawDate,
        status: match.status,
        total_tickets: match.total_tickets,
        league: match.league || "V-League"
    });
    setIsModalOpen(true);
  };

  const handleFileChange = async (e, teamType) => {
      const file = e.target.files[0];
      if (!file) return;
      if (teamType === 'home') setIsUploadingHome(true); else setIsUploadingAway(true);
      const data = new FormData(); data.append("file", file);
      try {
          const res = await fetch(UPLOAD_URL, { method: "POST", body: data });
          const result = await res.json();
          setFormData(prev => ({ ...prev, [teamType === 'home' ? 'home_logo' : 'away_logo']: result.url }));
          showNotification("Upload logo thành công!");
      } catch (error) { showNotification("Lỗi upload ảnh!", "error"); } 
      finally { if (teamType === 'home') setIsUploadingHome(false); else setIsUploadingAway(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...formData, total_tickets: Number(formData.total_tickets) || 0 };
    if (!payload.stadium_id) { showNotification("Vui lòng chọn Sân vận động!", "error"); return; }

    try {
        let response;
        if (currentMatch) {
            response = await fetch(`${API_URL}/${currentMatch.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        } else {
            response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        }
        if (response.ok) {
            showNotification(currentMatch ? "Cập nhật thành công!" : "Thêm mới thành công!");
            fetchData(); setIsModalOpen(false);
        } else { showNotification("Lỗi khi lưu dữ liệu!", "error"); }
    } catch (error) { showNotification("Lỗi kết nối!", "error"); }
  };

  const handleDeleteExecute = async () => {
      if (!matchToDelete) return;
      try {
          const response = await fetch(`${API_URL}/${matchToDelete.id}`, { method: 'DELETE' });
          if (response.ok) { showNotification("Đã xóa trận đấu"); fetchData(); } 
          else { showNotification("Xóa thất bại!", "error"); }
      } catch (error) { showNotification("Lỗi kết nối!", "error"); } 
      finally { setDeleteModalOpen(false); setMatchToDelete(null); }
  };

  const handleTicketConfig = (matchId) => { navigate(`/admin/mticketconfig/${matchId}`); };

  const filteredMatches = matches.filter(match => {
    const stadiumName = match.stadium_name || "";
    const matchInfo = `${match.home_team} ${match.away_team} ${stadiumName}`.toLowerCase();
    const matchesSearch = matchInfo.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || match.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
        {/* ... (Phần Header, Notification, Filter giữ nguyên) */}
       <div className="p-6 bg-gray-50 min-h-screen relative">
        {notification && <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}<span className="font-medium">{notification.message}</span></div>}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"><div><h1 className="text-2xl font-bold text-gray-800">Quản lý Trận đấu</h1><p className="text-gray-500 text-sm mt-1">Lên lịch thi đấu và theo dõi trạng thái bán vé.</p></div><button onClick={handleAddNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"><Plus size={20} /><span>Thêm trận mới</span></button></div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4"><div className="relative w-full md:w-96"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Tìm đội bóng, sân vận động..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><div className="flex items-center gap-3 w-full md:w-auto"><Filter size={18} className="text-gray-500" /><select className="border border-gray-200 rounded-lg px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}><option value="ALL">Tất cả trạng thái</option><option value="UPCOMING">Sắp diễn ra</option><option value="SELLING">Đang mở bán</option><option value="SOLD_OUT">Hết vé</option><option value="ENDED">Đã kết thúc</option></select></div></div>

        {isLoading ? <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div> : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                    <tr><th className="p-4 w-16 text-center">ID</th><th className="p-4">Trận đấu</th><th className="p-4">Thời gian / Địa điểm</th><th className="p-4 text-center">Vé phát hành</th><th className="p-4 text-center">Trạng thái</th><th className="p-4 text-right">Hành động</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredMatches.map((match) => (
                        <tr key={match.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="p-4 text-center font-mono text-gray-500 text-sm">#{match.id}</td>
                            <td className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center w-12"><img src={match.home_logo || "https://via.placeholder.com/32"} alt="" className="w-8 h-8 object-contain mb-1"/><span className="text-[10px] font-bold text-gray-500 text-center truncate w-16">{match.home_team}</span></div>
                                    <div className="flex flex-col items-center"><span className="text-gray-400 font-bold text-xs">VS</span>
                                    {/* HIỂN THỊ TÊN GIẢI ĐẤU NHỎ DƯỚI CHỮ VS */}
                                    <span className="text-[9px] bg-gray-100 px-1 rounded text-gray-500 mt-1">{match.league}</span>
                                    </div>
                                    <div className="flex flex-col items-center w-12"><img src={match.away_logo || "https://via.placeholder.com/32"} alt="" className="w-8 h-8 object-contain mb-1"/><span className="text-[10px] font-bold text-gray-500 text-center truncate w-16">{match.away_team}</span></div>
                                </div>
                            </td>
                            <td className="p-4"><div className="flex flex-col gap-1"><div className="flex items-center gap-2 text-sm font-medium text-gray-800"><Calendar size={14} className="text-blue-500" /> {formatDate(match.start_time)}</div><div className="flex items-center gap-2 text-xs text-gray-500"><MapPin size={14} /> {match.stadium_name}</div></div></td>
                            <td className="p-4 text-center"><span className="font-bold text-gray-700">{match.total_tickets?.toLocaleString()}</span></td>
                            <td className="p-4 text-center">
                                {match.status === 'SELLING' && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Đang bán</span>}
                                {match.status === 'UPCOMING' && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Sắp tới</span>}
                                {match.status === 'SOLD_OUT' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Hết vé</span>}
                                {match.status === 'ENDED' && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">Kết thúc</span>}
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => handleTicketConfig(match.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg tooltip" title="Cấu hình giá vé"><Ticket size={18} /></button>
                                    <button onClick={() => handleEdit(match)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Chỉnh sửa"><Edit size={18} /></button>
                                    <button onClick={() => { setMatchToDelete(match); setDeleteModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">{currentMatch ? "Cập nhật Trận đấu" : "Tạo mới"}</h3>
                    <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Đội nhà & Logo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đội chủ nhà</label>
                            <input type="text" className="w-full border rounded-lg px-3 py-2 mb-2" value={formData.home_team} onChange={(e) => setFormData({...formData, home_team: e.target.value})} required />
                            <label className="flex items-center gap-2 border border-dashed rounded-lg p-2 cursor-pointer bg-gray-50">
                                {isUploadingHome ? <Loader2 className="animate-spin text-blue-500"/> : (formData.home_logo ? <img src={formData.home_logo} className="w-6 h-6 object-contain"/> : <UploadCloud className="w-5 h-5 text-gray-400"/>)}
                                <span className="text-xs text-gray-500 truncate">{formData.home_logo ? "Đổi logo" : "Upload Logo"}</span>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'home')} />
                            </label>
                        </div>

                        {/* Đội khách & Logo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đội khách</label>
                            <input type="text" className="w-full border rounded-lg px-3 py-2 mb-2" value={formData.away_team} onChange={(e) => setFormData({...formData, away_team: e.target.value})} required />
                            <label className="flex items-center gap-2 border border-dashed rounded-lg p-2 cursor-pointer bg-gray-50">
                                {isUploadingAway ? <Loader2 className="animate-spin text-blue-500"/> : (formData.away_logo ? <img src={formData.away_logo} className="w-6 h-6 object-contain"/> : <UploadCloud className="w-5 h-5 text-gray-400"/>)}
                                <span className="text-xs text-gray-500 truncate">{formData.away_logo ? "Đổi logo" : "Upload Logo"}</span>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'away')} />
                            </label>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sân vận động</label>
                            <select className="w-full border rounded-lg px-3 py-2" value={formData.stadium_id} onChange={(e) => setFormData({...formData, stadium_id: e.target.value})} required>
                                <option value="">-- Chọn sân --</option>
                                {stadiums.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} (Sức chứa: {s.capacity})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian thi đấu</label>
                            <input type="datetime-local" className="w-full border rounded-lg px-3 py-2" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Ô CHỌN GIẢI ĐẤU MỚI */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giải đấu</label>
                            <select className="w-full border rounded-lg px-3 py-2" value={formData.league} onChange={(e) => setFormData({...formData, league: e.target.value})}>
                                {LEAGUES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select className="w-full border rounded-lg px-3 py-2" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                                <option value="UPCOMING">Sắp diễn ra</option>
                                <option value="SELLING">Đang mở bán</option>
                                <option value="SOLD_OUT">Hết vé</option>
                                <option value="ENDED">Đã kết thúc</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Total tickets, nếu bạn muốn giữ lại để nhập hoặc tự động tính thì tùy, ở đây giữ lại để nhập dự kiến */}
                    <div className="mt-2">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Tổng vé dự kiến</label>
                         <input type="number" className="w-full border rounded-lg px-3 py-2" value={formData.total_tickets} onChange={(e) => setFormData({...formData, total_tickets: e.target.value})} required />
                    </div>

                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3 mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Hủy</button>
                        <button type="submit" disabled={isUploadingHome || isUploadingAway} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm shadow-sm disabled:opacity-50"><Save size={16}/> Lưu</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center text-red-600"><AlertTriangle size={24} /></div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xóa?</h3>
                <p className="text-gray-500 text-sm mb-6">
                    Bạn có chắc muốn xóa trận đấu <strong>{matchToDelete?.home_team} vs {matchToDelete?.away_team}</strong>? Hành động này không thể hoàn tác.
                </p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Hủy bỏ</button>
                    <button onClick={handleDeleteExecute} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">Xóa ngay</button>
                </div>
            </div>
        </div>
      )}
    </AdminLayout>
  );
}