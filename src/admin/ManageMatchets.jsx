import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Calendar, MapPin, Edit, Trash2, Ticket, X, Save, Loader2, AlertTriangle, CheckCircle, UploadCloud, Image as ImageIcon,ChevronLeft, ChevronRight, Trophy} from "lucide-react";


const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/matches`;
const STADIUM_API_URL = `${API_BASE}/api/stadiums`;
const UPLOAD_URL = `${API_BASE}/api/upload`;

//ds giải đấu phổ biến
const LEAGUES = ["Cúp Quốc Gia (V-League1)", "AFF Cup (ASEAN Cup)", "SEA Games", 
                "U23 Châu Á","Giao Hữu"];

export default function ManageMatches() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterLeague, setFilterLeague] = useState("ALL"); //lọc giải đấu
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  
  //cập nhật trạng thái
  const [isUploadingHome, setIsUploadingHome] = useState(false);
  const [isUploadingAway, setIsUploadingAway] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  //form data
  const [formData, setFormData] = useState({
    home_team: "", away_team: "", 
    home_logo: "", away_logo: "",
    stadium_id: "", start_time: "", 
    status: "UPCOMING", total_tickets: 0,
    league: "V-League 1",
    banner_url: "" 
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

  //logic lọc dl
  const filteredMatches = matches.filter(match => {
    const stadiumName = match.stadium_name || "";
    const matchInfo = `${match.home_team} ${match.away_team} ${stadiumName}`.toLowerCase();
    const matchesSearch = matchInfo.includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "ALL" || match.status === filterStatus;
    const matchesLeague = filterLeague === "ALL" || match.league === filterLeague; //lọc giải đấu

    return matchesSearch && matchesStatus && matchesLeague;
  });

  // logic phân ttang và rs về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterLeague]);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMatches = filteredMatches.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage);
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
    }
  };
  const selectedStadium = stadiums.find(s => s.id == formData.stadium_id);

  const handleAddNew = () => {
    setCurrentMatch(null);
    setFormData({ 
        home_team: "", away_team: "", home_logo: "", away_logo: "",
        stadium_id: "", start_time: "", status: "UPCOMING", total_tickets: 0,
        league: "V-League 1", banner_url: ""
    });
    setIsModalOpen(true);
  };

  const handleEdit = (match) => {
    setCurrentMatch(match);
    const rawDate = match.start_time ? new Date(match.start_time).toISOString().slice(0, 16) : "";
    setFormData({ 
        home_team: match.home_team, away_team: match.away_team, home_logo: match.home_logo || "", away_logo: match.away_logo || "", stadium_id: match.stadium_id, start_time: rawDate, status: match.status, total_tickets: match.total_tickets, league: match.league || "V-League 1", banner_url: match.banner_url || "" 
    });
    setIsModalOpen(true);
  };

  const handleFileChange = async (e, type) => {
      const file = e.target.files[0];
      if (!file) return;
      if (type === 'home') setIsUploadingHome(true);
      else if (type === 'away') setIsUploadingAway(true);
      else setIsUploadingBanner(true);
      const data = new FormData(); data.append("file", file);
      try {
          const res = await fetch(UPLOAD_URL, { method: "POST", body: data });
          const result = await res.json();
          if (type === 'home') setFormData(prev => ({ ...prev, home_logo: result.url }));
          else if (type === 'away') setFormData(prev => ({ ...prev, away_logo: result.url }));
          else setFormData(prev => ({ ...prev, banner_url: result.url }));
          showNotification("Upload thành công!");
      } catch (error) { showNotification("Lỗi upload ảnh!", "error"); } 
      finally { if (type === 'home') setIsUploadingHome(false); else if (type === 'away') setIsUploadingAway(false); else setIsUploadingBanner(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...formData, total_tickets: Number(formData.total_tickets) || 0 };
    if (!payload.stadium_id) { showNotification("Vui lòng chọn Sân vận động!", "error"); return; }
    if (selectedStadium && payload.total_tickets > selectedStadium.capacity) { showNotification(`Số vé vượt quá sức chứa sân (${selectedStadium.capacity})!`, "error"); return; }

    try {
        let response;
        if (currentMatch) { response = await fetch(`${API_URL}/${currentMatch.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); } 
        else { response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); }
        if (response.ok) { showNotification(currentMatch ? "Cập nhật thành công!" : "Thêm mới thành công!"); fetchData(); setIsModalOpen(false); } 
        else { showNotification("Lỗi khi lưu dữ liệu!", "error"); }
    } catch (error) { showNotification("Lỗi kết nối!", "error"); }
  };

  const handleDeleteExecute = async () => {
      if (!matchToDelete) return;
      try {
          const response = await fetch(`${API_URL}/${matchToDelete.id}`, { method: 'DELETE' });
          if (response.ok) { showNotification("Đã xóa trận đấu"); fetchData(); } 
          else { const err = await response.json(); showNotification(err.message || "Xóa thất bại!", "error"); }
      } catch (error) { showNotification("Lỗi kết nối!", "error"); } 
      finally { setDeleteModalOpen(false); setMatchToDelete(null); }
  };

  const handleTicketConfig = (matchId) => { navigate(`/admin/mticketconfig/${matchId}`); };

  return (
    <AdminLayout>
       <div className="p-6 bg-gray-50 min-h-screen relative">
        {notification && <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}<span className="font-medium">{notification.message}</span></div>}
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Trận đấu</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Tổng số: <span className="font-bold text-blue-600">{filteredMatches.length}</span> trận đấu
                </p>
            </div>
            <button onClick={handleAddNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"><Plus size={20} /><span>Thêm trận mới</span></button>
        </div>

        {/*công cụ lọc*/}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Tìm đội bóng, sân vận động..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
                {/*lọc giải đấu*/}
                <div className="relative min-w-[200px]">
                    <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" value={filterLeague} onChange={(e) => setFilterLeague(e.target.value)}>
                        <option value="ALL">Tất cả giải đấu</option>
                        {LEAGUES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>

                {/* lọc trạng thái*/}
                <div className="relative min-w-[180px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="UPCOMING">Sắp diễn ra</option>
                        <option value="SELLING">Đang mở bán</option>
                        <option value="SOLD_OUT">Hết vé</option>
                        <option value="ENDED">Đã kết thúc</option>
                    </select>
                </div>
            </div>
        </div>

        {isLoading ? <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div> : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase border-b border-gray-200">
                            <tr>
                                <th className="p-4 w-16 text-center">ID</th>
                                <th className="p-4">Trận đấu</th>
                                <th className="p-4">Thời gian / Địa điểm</th>
                                <th className="p-4 text-center">Vé phát hành</th>
                                <th className="p-4 text-center">Trạng thái</th>
                                <th className="p-4 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700 text-sm">
                            {currentMatches.map((match) => (
                                <tr key={match.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4 text-center font-mono text-gray-500">#{match.id}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center w-12 gap-1">
                                                <img src={match.home_logo || "https://via.placeholder.com/32"} alt="" className="w-8 h-8 object-contain"/>
                                                <span className="text-[10px] font-bold text-gray-500 text-center truncate w-full">{match.home_team}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-gray-400 font-bold text-xs">VS</span>
                                                <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 mt-1 whitespace-nowrap">{match.league}</span>
                                            </div>
                                            <div className="flex flex-col items-center w-12 gap-1">
                                                <img src={match.away_logo || "https://via.placeholder.com/32"} alt="" className="w-8 h-8 object-contain"/>
                                                <span className="text-[10px] font-bold text-gray-500 text-center truncate w-full">{match.away_team}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 font-medium text-gray-800"><Calendar size={14} className="text-blue-500" /> {formatDate(match.start_time)}</div>
                                            <div className="flex items-center gap-2 text-gray-500 text-xs"><MapPin size={14} /> {match.stadium_name}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center font-bold">{match.total_tickets?.toLocaleString()}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                            match.status === 'SELLING' ? 'bg-green-50 text-green-700 border-green-200' :
                                            match.status === 'UPCOMING' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            match.status === 'SOLD_OUT' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-gray-100 text-gray-600 border-gray-200'
                                        }`}>
                                            {match.status === 'SELLING' ? 'Đang bán' : match.status === 'UPCOMING' ? 'Sắp tới' : match.status === 'SOLD_OUT' ? 'Hết vé' : 'Kết thúc'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleTicketConfig(match.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg tooltip" title="Cấu hình giá vé"><Ticket size={16} /></button>
                                            <button onClick={() => handleEdit(match)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Chỉnh sửa"><Edit size={16} /></button>
                                            <button onClick={() => { setMatchToDelete(match); setDeleteModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {currentMatches.length === 0 && (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Không tìm thấy trận đấu nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* phântrang */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                        <span className="text-xs text-gray-500">
                            Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredMatches.length)} của {filteredMatches.length} trận đấu
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)} 
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16}/>
                            </button>
                            
                            {/* hiểnn thị số trang */}
                            {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                                <button 
                                    key={page}  onClick={() => handlePageChange(page)}className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                                        currentPage === page 
                                        ? 'bg-blue-600 text-white shadow-sm' 
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                    }`} >
                                    {page}
                                </button>
                            ))}

                            <button 
                                onClick={() => handlePageChange(currentPage + 1)} 
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <ChevronRight size={16}/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                    <h3 className="text-lg font-bold text-gray-800">{currentMatch ? "Cập nhật Trận đấu" : "Tạo mới"}</h3>
                    <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner trận đấu</label>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative overflow-hidden">
                            {isUploadingBanner ? <Loader2 className="animate-spin text-blue-500"/> : (formData.banner_url ? <img src={formData.banner_url} className="w-full h-full object-cover"/> : <div className="flex flex-col items-center"><UploadCloud size={24} className="text-gray-400"/><span className="text-xs text-gray-500 mt-1">Upload Banner</span></div>)}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đội chủ nhà</label>
                            <input type="text" className="w-full border rounded-lg px-3 py-2 mb-2" value={formData.home_team} onChange={(e) => setFormData({...formData, home_team: e.target.value})} required />
                            <label className="flex items-center gap-2 border border-dashed rounded-lg p-2 cursor-pointer bg-gray-50">
                                {isUploadingHome ? <Loader2 className="animate-spin text-blue-500"/> : (formData.home_logo ? <img src={formData.home_logo} className="w-6 h-6 object-contain"/> : <ImageIcon size={20} className="text-gray-400"/>)}
                                <span className="text-xs text-gray-500 truncate">{formData.home_logo ? "Đổi logo" : "Logo Đội nhà"}</span>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'home')} />
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đội khách</label>
                            <input type="text" className="w-full border rounded-lg px-3 py-2 mb-2" value={formData.away_team} onChange={(e) => setFormData({...formData, away_team: e.target.value})} required />
                            <label className="flex items-center gap-2 border border-dashed rounded-lg p-2 cursor-pointer bg-gray-50">
                                {isUploadingAway ? <Loader2 className="animate-spin text-blue-500"/> : (formData.away_logo ? <img src={formData.away_logo} className="w-6 h-6 object-contain"/> : <ImageIcon size={20} className="text-gray-400"/>)}
                                <span className="text-xs text-gray-500 truncate">{formData.away_logo ? "Đổi logo" : "Logo Đội khách"}</span>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'away')} />
                            </label>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sân vận động</label>
                            <select className="w-full border rounded-lg px-3 py-2" value={formData.stadium_id} onChange={(e) => setFormData({...formData, stadium_id: e.target.value})} required>
                                <option value="">-- Chọn sân --</option>
                                {stadiums.map(s => (<option key={s.id} value={s.id}>{s.name} (Sức chứa: {s.capacity})</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian thi đấu</label>
                            <input type="datetime-local" className="w-full border rounded-lg px-3 py-2" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giải đấu</label>
                            <select className="w-full border rounded-lg px-3 py-2" value={formData.league} onChange={(e) => setFormData({...formData, league: e.target.value})}>
                                {LEAGUES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label><select className="w-full border rounded-lg px-3 py-2" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}><option value="UPCOMING">Sắp diễn ra</option><option value="SELLING">Đang mở bán</option><option value="SOLD_OUT">Hết vé</option><option value="ENDED">Đã kết thúc</option></select></div>
                    </div>
                    <div className="mt-2">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Tổng vé dự kiến</label>
                         <input type="number" className="w-full border rounded-lg px-3 py-2" value={formData.total_tickets} onChange={(e) => setFormData({...formData, total_tickets: e.target.value})} required />
                         {selectedStadium && parseInt(formData.total_tickets) > selectedStadium.capacity && (
                             <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertTriangle size={12}/> Cảnh báo: Số lượng vé vượt quá sức chứa sân ({selectedStadium.capacity.toLocaleString()})!</p>
                         )}
                    </div>

                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3 mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Hủy</button>
                        <button type="submit" disabled={isUploadingHome || isUploadingAway || isUploadingBanner} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm shadow-sm disabled:opacity-50"><Save size={16}/> Lưu</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/*xóa */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center text-red-600"><AlertTriangle size={24} /></div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xóa?</h3>
                <p className="text-gray-500 text-sm mb-6">Bạn có chắc muốn xóa trận đấu <strong>{matchToDelete?.home_team} vs {matchToDelete?.away_team}</strong>?</p>
                <div className="flex gap-3 justify-center"><button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">Hủy bỏ</button><button onClick={handleDeleteExecute} className="px-4 py-2 bg-red-600 text-white rounded-lg">Xóa ngay</button></div>
            </div>
        </div>
      )}
    </AdminLayout>
  );
}