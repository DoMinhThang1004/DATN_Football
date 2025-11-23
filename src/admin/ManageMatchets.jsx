import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import { 
  Search, Plus, Filter, Calendar, MapPin, Edit, Trash2, Ticket, 
  X, Save, Loader2, AlertTriangle, CheckCircle 
} from "lucide-react";

export default function ManageMatches() {
  const navigate = useNavigate(); // 2. Khai báo hook

  // --- 1. STATE MANAGEMENT ---
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Modal Form (Thêm/Sửa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);

  // Modal Delete (Xác nhận xóa)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState(null);

  // Notification
  const [notification, setNotification] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    homeTeam: "", awayTeam: "", 
    homeLogo: "", awayLogo: "",
    stadium: "", startTime: "", 
    status: "UPCOMING", totalTickets: 0
  });

  // --- 2. HELPERS ---
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

  // --- 3. FETCH DATA ---
  const fetchMatches = async () => {
    setIsLoading(true);
    try {
        // --- TODO: GỌI API THẬT ---
        // const res = await axios.get('/api/matches'); setMatches(res.data);
        setTimeout(() => {
            setMatches([
                { id: 1, homeTeam: "Việt Nam", awayTeam: "Thái Lan", homeLogo: "https://flagcdn.com/w40/vn.png", awayLogo: "https://flagcdn.com/w40/th.png", stadium: "Sân vận động Mỹ Đình", startTime: "2025-11-20T19:30", status: "SELLING", totalTickets: 40000, soldTickets: 15200 },
                { id: 2, homeTeam: "Hà Nội FC", awayTeam: "Công An Hà Nội", homeLogo: "https://ui-avatars.com/api/?name=HN&background=random", awayLogo: "https://ui-avatars.com/api/?name=CA&background=random", stadium: "Sân vận động Hàng Đẫy", startTime: "2025-11-25T18:00", status: "UPCOMING", totalTickets: 15000, soldTickets: 0 },
                { id: 3, homeTeam: "SLNA", awayTeam: "HAGL", homeLogo: "https://ui-avatars.com/api/?name=SL&background=random", awayLogo: "https://ui-avatars.com/api/?name=HA&background=random", stadium: "Sân Vinh", startTime: "2025-10-10T17:00", status: "ENDED", totalTickets: 10000, soldTickets: 9800 }
            ]);
            setIsLoading(false);
        }, 600);
    } catch (error) {
        console.error("Lỗi tải dữ liệu", error);
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // --- 4. HANDLERS ---
  
  // Mở form thêm mới
  const handleAddNew = () => {
    setCurrentMatch(null);
    setFormData({ 
        homeTeam: "", awayTeam: "", homeLogo: "", awayLogo: "",
        stadium: "", startTime: "", status: "UPCOMING", totalTickets: 0 
    });
    setIsModalOpen(true);
  };

  // Mở form sửa
  const handleEdit = (match) => {
    setCurrentMatch(match);
    setFormData({ ...match }); // Copy dữ liệu vào form
    setIsModalOpen(true);
  };

  // Xử lý Lưu
  const handleSave = async (e) => {
    e.preventDefault();
    // Validate đơn giản
    if (!formData.homeTeam || !formData.awayTeam || !formData.stadium || !formData.startTime) {
        showNotification("Vui lòng nhập đầy đủ thông tin!", "error");
        return;
    }

    try {
        if (currentMatch) {
            // --- API PUT ---
            setMatches(matches.map(m => m.id === currentMatch.id ? { ...formData, id: m.id, soldTickets: m.soldTickets } : m));
            showNotification("Cập nhật trận đấu thành công!");
        } else {
            // --- API POST ---
            const newId = matches.length + 1;
            setMatches([...matches, { ...formData, id: newId, soldTickets: 0 }]);
            showNotification("Thêm trận đấu mới thành công!");
        }
        setIsModalOpen(false);
    } catch (error) {
        showNotification("Có lỗi xảy ra!", "error");
    }
  };

  // Xóa
  const confirmDelete = (match) => {
    setMatchToDelete(match);
    setDeleteModalOpen(true);
  };

  const handleDeleteExecute = async () => {
    if (!matchToDelete) return;
    try {
        //API DELETE...
        setMatches(matches.filter(m => m.id !== matchToDelete.id));
        showNotification("Đã xóa trận đấu");
    } catch (error) {
        showNotification("Xóa thất bại!", "error");
    } finally {
        setDeleteModalOpen(false);
        setMatchToDelete(null);
    }
  };

  // Xử lý nút "Vé" - CẬP NHẬT LINK VÀ THÔNG BÁO
  const handleTicketConfig = (matchId) => {
      // showNotification("Đang chuyển đến trang cấu hình vé..."); 
      // Thường khi chuyển trang ta không cần hiện notification vì trang sẽ load lại,
      // nhưng nếu bạn muốn user thấy phản hồi thì có thể dùng delay nhỏ hoặc chỉ cần navigate.
      // Ở đây mình navigate thẳng cho nhanh và mượt.
      
      navigate(`/admin/mticketconfig/${matchId}`);
  };

  const filteredMatches = matches.filter(match => {
    const matchInfo = `${match.homeTeam} ${match.awayTeam} ${match.stadium}`.toLowerCase();
    const matchesSearch = matchInfo.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || match.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen relative">
        
        {/* --- TOAST NOTIFICATION --- */}
        {notification && (
            <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white transform transition-all animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                <span className="font-medium">{notification.message}</span>
            </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Trận đấu</h1>
            <p className="text-gray-500 text-sm mt-1">Lên lịch thi đấu và theo dõi trạng thái bán vé.</p>
          </div>
          <button onClick={handleAddNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
            <Plus size={20} />
            <span>Thêm trận mới</span>
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Tìm đội bóng, sân vận động..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter size={18} className="text-gray-500" />
            <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="ALL">Tất cả trạng thái</option>
              <option value="UPCOMING">Sắp diễn ra</option>
              <option value="SELLING">Đang mở bán</option>
              <option value="SOLD_OUT">Hết vé</option>
              <option value="ENDED">Đã kết thúc</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-100">
                    <th className="p-4 font-semibold">Trận đấu</th>
                    <th className="p-4 font-semibold">Thời gian / Địa điểm</th>
                    <th className="p-4 font-semibold text-center">Tiến độ</th>
                    <th className="p-4 font-semibold text-center">Trạng thái</th>
                    <th className="p-4 font-semibold text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredMatches.map((match) => (
                        <tr key={match.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center w-12">
                                    <img src={match.homeLogo} alt="" className="w-8 h-8 object-contain mb-1" onError={(e) => e.target.src="https://via.placeholder.com/32"}/>
                                    <span className="text-[10px] font-bold text-gray-500 text-center truncate w-16">{match.homeTeam}</span>
                                </div>
                                <span className="text-gray-400 font-bold">VS</span>
                                <div className="flex flex-col items-center w-12">
                                    <img src={match.awayLogo} alt="" className="w-8 h-8 object-contain mb-1" onError={(e) => e.target.src="https://via.placeholder.com/32"}/>
                                    <span className="text-[10px] font-bold text-gray-500 text-center truncate w-16">{match.awayTeam}</span>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-800"><Calendar size={14} className="text-blue-500" /> {formatDate(match.startTime)}</div>
                                <div className="flex items-center gap-2 text-xs text-gray-500"><MapPin size={14} /> {match.stadium}</div>
                            </div>
                        </td>
                        <td className="p-4 align-middle">
                            <div className="w-full max-w-[120px] mx-auto">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">{match.soldTickets}/{match.totalTickets}</span>
                                    <span className="font-semibold">{match.totalTickets > 0 ? Math.round((match.soldTickets/match.totalTickets)*100) : 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${match.totalTickets > 0 ? (match.soldTickets/match.totalTickets)*100 : 0}%` }}></div>
                                </div>
                            </div>
                        </td>
                        <td className="p-4 text-center">
                            {match.status === 'SELLING' && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">Đang bán</span>}
                            {match.status === 'UPCOMING' && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">Sắp tới</span>}
                            {match.status === 'SOLD_OUT' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">Hết vé</span>}
                            {match.status === 'ENDED' && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200">Kết thúc</span>}
                        </td>
                        <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                {/* NÚT CẤU HÌNH VÉ (Đã sửa link chuyển hướng) */}
                                <button onClick={() => handleTicketConfig(match.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg tooltip" title="Cấu hình giá vé">
                                    <Ticket size={18} />
                                </button>
                                <button onClick={() => handleEdit(match)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Chỉnh sửa">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => confirmDelete(match)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Xóa">
                                    <Trash2 size={18} />
                                </button>
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

      {/* --- MODAL FORM (THÊM / SỬA) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">{currentMatch ? "Cập nhật Trận đấu" : "Thêm Trận đấu mới"}</h3>
                    <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                </div>
                <form onSubmit={handleSave}>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đội chủ nhà</label>
                                <input type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.homeTeam} onChange={(e) => setFormData({...formData, homeTeam: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Đội nhà (URL)</label>
                                <input type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.homeLogo} onChange={(e) => setFormData({...formData, homeLogo: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đội khách</label>
                                <input type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.awayTeam} onChange={(e) => setFormData({...formData, awayTeam: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Đội khách (URL)</label>
                                <input type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.awayLogo} onChange={(e) => setFormData({...formData, awayLogo: e.target.value})} />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sân vận động</label>
                                <input type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.stadium} onChange={(e) => setFormData({...formData, stadium: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian thi đấu</label>
                                <input type="datetime-local" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số vé phát hành</label>
                                <input type="number" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.totalTickets} onChange={(e) => setFormData({...formData, totalTickets: parseInt(e.target.value)})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                                    <option value="UPCOMING">Sắp diễn ra</option>
                                    <option value="SELLING">Đang mở bán</option>
                                    <option value="SOLD_OUT">Hết vé</option>
                                    <option value="ENDED">Đã kết thúc</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Hủy</button>
                        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm shadow-sm"><Save size={16}/> {currentMatch ? "Lưu thay đổi" : "Tạo trận đấu"}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- MODAL CONFIRM DELETE --- */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xóa?</h3>
                <p className="text-gray-500 text-sm mb-6">
                    Bạn có chắc muốn xóa trận đấu <strong>{matchToDelete?.homeTeam} vs {matchToDelete?.awayTeam}</strong>? Hành động này không thể hoàn tác.
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