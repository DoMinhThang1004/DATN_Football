import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, QrCode, Download, X, Ticket, CheckCircle, Ban, AlertCircle } from "lucide-react";

export default function MyTickets() {
  // --- 1. QUẢN LÝ DỮ LIỆU (Chuẩn bị cho API) ---
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Giả lập gọi API (Sau này bạn thay nội dung trong useEffect này bằng axios.get)
  useEffect(() => {
    // API Call simulation
    const fetchTickets = () => {
        // const res = await axios.get('/api/my-tickets'); setTickets(res.data);
        
        // MOCK DATA (Thay thế cục này bằng dữ liệu server trả về)
        const mockData = [
            { id: "ORD-99315", match: "Hà Nội FC vs CAHN", date: "27-11-2025", time: "19:15", stadium: "Sân Hàng Đẫy", seat: "A1-15", price: 500000, status: "active", image: "https://placehold.co/100x100/1e293b/FFF?text=HN" },
            { id: "ORD-88210", match: "Viettel vs SLNA", date: "15-10-2025", time: "18:00", stadium: "Sân Mỹ Đình", seat: "B10-05", price: 150000, status: "completed", image: "https://placehold.co/100x100/dc2626/FFF?text=VT" },
            { id: "ORD-77111", match: "HAGL vs Hà Nội FC", date: "01-10-2025", time: "17:00", stadium: "Sân Pleiku", seat: "A2-20", price: 300000, status: "cancelled", image: "https://placehold.co/100x100/16a34a/FFF?text=HA" },
        ];
        
        setTickets(mockData);
        setLoading(false);
    };

    fetchTickets();
  }, []);

  // --- STATE GIAO DIỆN ---
  const [filter, setFilter] = useState("active"); 
  const [selectedTicket, setSelectedTicket] = useState(null);

  const filteredTickets = tickets.filter(t => t.status === filter);

  // --- HÀM RENDER TRẠNG THÁI QR TRONG MODAL ---
  const renderQrSection = (ticket) => {
    if (ticket.status === 'active') {
        return (
            <div className="bg-white p-2 rounded-2xl shadow-xl">
                <QrCode size={140} className="text-gray-900"/>
            </div>
        );
    } 
    
    if (ticket.status === 'completed') {
        return (
            <div className="relative bg-gray-100 p-2 rounded-2xl border-2 border-gray-200 opacity-70">
                <QrCode size={140} className="text-gray-400 blur-[1px]"/>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="bg-green-100 p-2 rounded-full border-2 border-green-500 mb-1">
                        <CheckCircle size={32} className="text-green-600"/>
                    </div>
                    <span className="font-black text-green-700 text-sm bg-white/80 px-2 rounded">ĐÃ SỬ DỤNG</span>
                </div>
            </div>
        );
    }

    if (ticket.status === 'cancelled') {
        return (
            <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-100 flex flex-col items-center justify-center w-[156px] h-[156px]">
                <Ban size={48} className="text-red-500 mb-2"/>
                <span className="font-bold text-red-600 text-lg">ĐÃ HỦY</span>
            </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[500px] flex flex-col">
      {/* Header & Filter */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Ticket className="text-blue-600"/> Vé của tôi</h2>
        <div className="flex gap-2">
            {['active', 'completed', 'cancelled'].map((status) => (
                <button 
                    key={status}
                    onClick={() => setFilter(status)} 
                    className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === status ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                    {status === 'active' ? 'Sắp diễn ra' : status === 'completed' ? 'Đã sử dụng' : 'Đã hủy'}
                </button>
            ))}
        </div>
      </div>

      {/* List */}
      <div className="p-6 flex-1">
        {loading ? (
            <p className="text-center text-gray-400 py-12">Đang tải dữ liệu...</p>
        ) : filteredTickets.length > 0 ? (
            <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                    <div key={ticket.id} className="group border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 hover:border-blue-400 hover:shadow-md transition-all bg-white">
                        <img src={ticket.image} alt="Logo" className="w-16 h-16 rounded-lg object-cover grayscale group-hover:grayscale-0 transition"/>
                        
                        <div className="flex-1 w-full text-center md:text-left">
                            <h3 className={`font-bold text-lg ${ticket.status === 'cancelled' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{ticket.match}</h3>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-1 text-sm text-gray-600">
                                <span className="flex items-center gap-1"><Calendar size={14}/> {ticket.date}</span>
                                <span className="flex items-center gap-1"><Clock size={14}/> {ticket.time}</span>
                                <span className="flex items-center gap-1"><MapPin size={14}/> {ticket.stadium}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-xs text-gray-500">Ghế ngồi</p>
                                <p className="font-bold text-blue-600 text-lg">{ticket.seat}</p>
                            </div>
                            <button onClick={() => setSelectedTicket(ticket)} className="px-5 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition flex items-center gap-2">
                                <QrCode size={18}/> <span className="hidden md:inline">Chi tiết</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                <Ticket size={48} className="mb-4 opacity-20"/>
                <p>Không tìm thấy vé nào.</p>
            </div>
        )}
      </div>

      {/* --- MODAL CHI TIẾT VÉ --- */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedTicket(null)}>
            <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-1 rounded-full transition z-10"><X size={20}/></button>
                
                {/* Header màu (Đổi màu nếu vé hủy) */}
                <div className={`p-6 text-center text-white pt-10 pb-12 relative overflow-hidden ${selectedTicket.status === 'cancelled' ? 'bg-gray-600' : 'bg-gradient-to-br from-blue-600 to-blue-800'}`}>
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <h3 className="font-bold text-xl relative z-10">{selectedTicket.match}</h3>
                    <p className="opacity-90 text-sm mt-1 relative z-10">{selectedTicket.stadium}</p>
                </div>

                {/* Phần nội dung vé */}
                <div className="bg-white px-6 pb-8 -mt-6 rounded-t-3xl relative z-20">
                    
                    {/* --- KHU VỰC HIỂN THỊ QR (HOẶC THÔNG BÁO) --- */}
                    <div className="flex justify-center -mt-10 mb-4">
                        {renderQrSection(selectedTicket)}
                    </div>
                    
                    <div className="text-center mb-6">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Mã vé</p>
                        <p className="text-2xl font-mono font-black text-gray-800 tracking-widest">{selectedTicket.id}</p>
                        
                        <div className="mt-2">
                            {selectedTicket.status === 'active' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">VÉ HỢP LỆ</span>}
                            {selectedTicket.status === 'completed' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">ĐÃ SỬ DỤNG</span>}
                            {selectedTicket.status === 'cancelled' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">KHÔNG HỢP LỆ</span>}
                        </div>
                    </div>

                    <div className="border-t-2 border-dashed border-gray-100 my-4 relative">
                        <div className="absolute -left-9 -top-3 w-6 h-6 bg-gray-800 rounded-full"></div>
                        <div className="absolute -right-9 -top-3 w-6 h-6 bg-gray-800 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div><p className="text-gray-400 text-xs">Ngày thi đấu</p><p className="font-bold text-gray-900">{selectedTicket.date}</p></div>
                        <div className="text-right"><p className="text-gray-400 text-xs">Giờ bắt đầu</p><p className="font-bold text-gray-900">{selectedTicket.time}</p></div>
                        <div><p className="text-gray-400 text-xs">Vị trí ghế</p><p className="font-bold text-blue-600 text-lg">{selectedTicket.seat}</p></div>
                        <div className="text-right"><p className="text-gray-400 text-xs">Giá vé</p><p className="font-bold text-gray-900">{selectedTicket.price.toLocaleString()}đ</p></div>
                    </div>

                    {/* Nút tải vé chỉ hiện khi Active */}
                    {selectedTicket.status === 'active' ? (
                        <button className="w-full mt-8 py-3.5 bg-gray-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-black shadow-lg active:scale-95 transition-all">
                            <Download size={20}/> Tải vé về máy
                        </button>
                    ) : (
                        <button disabled className="w-full mt-8 py-3.5 bg-gray-100 text-gray-400 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                            <Ban size={20}/> Không thể tải vé này
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}