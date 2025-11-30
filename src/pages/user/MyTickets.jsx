import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, QrCode, Download, X, Ticket, CheckCircle, Ban, AlertCircle, Loader2 } from "lucide-react";
import QRCode from "react-qr-code"; 

const API_URL = "http://localhost:5000/api/tickets";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("VALID"); // Giá trị khớp với DB: VALID, USED, INVALID
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
        const storedUser = localStorage.getItem("currentUser");
        if (!storedUser) {
            setLoading(false);
            return;
        }
        
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        try {
            console.log("Đang lấy vé cho User ID:", parsedUser.id);
            const res = await fetch(`${API_URL}/user/${parsedUser.id}`);
            
            if (!res.ok) throw new Error("Lỗi tải vé");
            
            const data = await res.json();
            console.log("Dữ liệu vé nhận được:", data); // Kiểm tra log này trong F12

            const formattedData = data.map(t => ({
                id: t.id,
                match: `${t.home_team} vs ${t.away_team}`,
                date: t.start_time ? new Date(t.start_time).toLocaleDateString('vi-VN') : "",
                time: t.start_time ? new Date(t.start_time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : "",
                stadium: t.stadium_name,
                seat: t.seat_number || "Tự do",
                zone: t.zone_name,
                price: Number(t.price),
                status: t.status, // VALID, USED, INVALID
                qrCode: t.qr_code_string,
                image: t.home_logo 
            }));

            setTickets(formattedData);
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchTickets();
  }, []);

  // --- FILTER LOGIC ---
  // Lọc dựa trên status thực tế từ DB (VALID, USED, INVALID)
  const filteredTickets = tickets.filter(t => {
      // Nếu filter là VALID -> Lấy vé VALID (Sắp diễn ra)
      // Nếu filter là USED -> Lấy vé USED (Đã sử dụng)
      // Nếu filter là INVALID -> Lấy vé INVALID (Đã hủy)
      return t.status === filter;
  });

  const renderQrSection = (ticket) => {
    if (ticket.status === 'VALID') {
        return (
            <div className="bg-white p-4 rounded-2xl shadow-xl flex justify-center">
                <QRCode value={ticket.qrCode || ticket.id} size={140} />
            </div>
        );
    } 
    if (ticket.status === 'USED') {
        return (
            <div className="relative bg-gray-100 p-4 rounded-2xl border-2 border-gray-200 opacity-70 flex justify-center">
                <QRCode value={ticket.id} size={140} fgColor="#9CA3AF"/>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="bg-green-100 p-2 rounded-full border-2 border-green-500 mb-1">
                        <CheckCircle size={32} className="text-green-600"/>
                    </div>
                    <span className="font-black text-green-700 text-sm bg-white/90 px-2 py-1 rounded shadow-sm">ĐÃ SỬ DỤNG</span>
                </div>
            </div>
        );
    }
    return (
        <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-100 flex flex-col items-center justify-center w-[172px] h-[172px]">
            <Ban size={48} className="text-red-500 mb-2"/>
            <span className="font-bold text-red-600 text-lg">ĐÃ HỦY</span>
        </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[500px] flex flex-col">
      
      {/* Header & Filter */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Ticket className="text-blue-600"/> Vé của tôi</h2>
        <div className="flex gap-2">
            <button onClick={() => setFilter("VALID")} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === 'VALID' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Sắp diễn ra</button>
            <button onClick={() => setFilter("USED")} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === 'USED' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Đã sử dụng</button>
            <button onClick={() => setFilter("INVALID")} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === 'INVALID' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Đã hủy</button>
        </div>
      </div>

      {/* List */}
      <div className="p-6 flex-1">
        {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600"/></div>
        ) : filteredTickets.length > 0 ? (
            <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                    <div key={ticket.id} className="group border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 hover:border-blue-400 hover:shadow-md transition-all bg-white cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                        <img src={ticket.image || "https://via.placeholder.com/100?text=Ticket"} alt="Match" className="w-16 h-16 rounded-lg object-contain bg-gray-50 p-1 grayscale group-hover:grayscale-0 transition"/>
                        
                        <div className="flex-1 w-full text-center md:text-left">
                            <h3 className="font-bold text-lg text-gray-900">{ticket.match}</h3>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-1 text-sm text-gray-600">
                                <span className="flex items-center gap-1"><Calendar size={14}/> {ticket.date}</span>
                                <span className="flex items-center gap-1"><Clock size={14}/> {ticket.time}</span>
                                <span className="flex items-center gap-1"><MapPin size={14}/> {ticket.stadium}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-xs text-gray-500">{ticket.zone}</p>
                                <p className="font-bold text-blue-600 text-lg">{ticket.seat}</p>
                            </div>
                            <button className="px-5 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition flex items-center gap-2">
                                <QrCode size={18}/> <span className="hidden md:inline">Chi tiết</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12 border-2 border-dashed border-gray-100 rounded-xl">
                <Ticket size={48} className="mb-4 opacity-20"/>
                <p>Không tìm thấy vé nào trong mục này.</p>
                <p className="text-xs mt-2">(Kiểm tra lại tab trạng thái khác xem)</p>
            </div>
        )}
      </div>

      {/* --- MODAL CHI TIẾT VÉ --- */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedTicket(null)}>
            <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-1 rounded-full transition z-10"><X size={20}/></button>
                
                <div className={`p-6 text-center text-white pt-10 pb-12 relative overflow-hidden ${selectedTicket.status === 'INVALID' ? 'bg-gray-600' : 'bg-gradient-to-br from-blue-600 to-blue-900'}`}>
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <h3 className="font-bold text-xl relative z-10">{selectedTicket.match}</h3>
                    <p className="opacity-90 text-sm mt-1 relative z-10">{selectedTicket.stadium}</p>
                </div>

                <div className="bg-white px-6 pb-8 -mt-6 rounded-t-3xl relative z-20">
                    <div className="flex justify-center -mt-10 mb-4">
                        {renderQrSection(selectedTicket)}
                    </div>
                    
                    <div className="text-center mb-6">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Mã vé</p>
                        <p className="text-xl font-mono font-black text-gray-800 tracking-widest truncate px-4">{selectedTicket.id.slice(0, 8).toUpperCase()}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div><p className="text-gray-400 text-xs">Ngày</p><p className="font-bold text-gray-900">{selectedTicket.date}</p></div>
                        <div className="text-right"><p className="text-gray-400 text-xs">Giờ</p><p className="font-bold text-gray-900">{selectedTicket.time}</p></div>
                        <div><p className="text-gray-400 text-xs">Khu vực</p><p className="font-bold text-gray-900 truncate pr-2">{selectedTicket.zone}</p></div>
                        <div className="text-right"><p className="text-gray-400 text-xs">Ghế</p><p className="font-bold text-blue-600 text-lg">{selectedTicket.seat}</p></div>
                    </div>

                    {selectedTicket.status === 'VALID' && (
                        <button className="w-full mt-8 py-3.5 bg-gray-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-black shadow-lg transition-all">
                            <Download size={20}/> Tải vé về máy
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}