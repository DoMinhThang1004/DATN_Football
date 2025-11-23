import React, { useState } from "react";
import { MapPin, Calendar, Clock, ChevronLeft, ZoomIn, ZoomOut, RotateCcw, ShoppingCart, Info, Check, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, AlertCircle, X } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout.jsx";
import { useCart } from "../../context/CartContext.jsx"; // Đã sửa đường dẫn import cho phù hợp cấu trúc chung
import CommentSection from "../../components/user/CommentsSection.jsx"; // <--- ĐÃ THÊM COMPONENT BÌNH LUẬN

export default function MatchDetailPage() {
  const { id } = useParams();

  // --- STATE ---
  const [viewMode, setViewMode] = useState("stadium"); // 'stadium' | 'zone'
  const [selectedZone, setSelectedZone] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // State hiển thị Modal cảnh báo quá giới hạn vé
  const [showLimitModal, setShowLimitModal] = useState(false);

  // --- MOCK DATA ---
  const matchInfo = {
    home: "Hà Nội FC",
    away: "Công An Hà Nội",
    stadium: "Sân vận động Hàng Đẫy",
    date: "27-11-2025",
    time: "19:15",
  };

  // Danh sách loại vé
  const ticketTypes = [
    { id: "CAT1", name: "Vé Phổ Thông (CAT1)", price: 150000, color: "bg-blue-600", targetZone: "A5-T1" },
    { id: "CAT2", name: "Vé Phổ Thông (CAT2)", price: 150000, color: "bg-blue-500", targetZone: "B10-T1" },
    { id: "VIP", name: "Vé VIP (A2/A3)", price: 300000, color: "bg-orange-500", targetZone: "A3-T1" }, 
    { id: "SVIP", name: "Vé Super VIP (A1)", price: 500000, color: "bg-red-600", targetZone: "A1-T1" }, 
  ];

  // DỮ LIỆU CÁC KHỐI TRÊN SÂN
  const zones = [
    // KHÁN ĐÀI A (Trên) - Tầng 2
    { id: "A5-T2", name: "A5-T2", type: "CAT1", side: "top", style: { top: "8%", left: "15%", width: "12%", height: "6%", bg: "bg-blue-600" } },
    { id: "A3-T2", name: "A3-T2", type: "CAT1", side: "top", style: { top: "8%", left: "29%", width: "12%", height: "6%", bg: "bg-yellow-400" } },
    { id: "A1-T2", name: "A1-T2", type: "VIP",  side: "top", style: { top: "8%", left: "43%", width: "14%", height: "6%", bg: "bg-orange-500" } },
    { id: "A2-T2", name: "A2-T2", type: "VIP",  side: "top", style: { top: "8%", left: "59%", width: "12%", height: "6%", bg: "bg-orange-500" } },
    { id: "A4-T2", name: "A4-T2", type: "CAT1", side: "top", style: { top: "8%", left: "73%", width: "12%", height: "6%", bg: "bg-blue-600" } },
    
    // Tầng 1
    { id: "A5-T1", name: "A5-T1", type: "CAT1", side: "top", style: { top: "16%", left: "15%", width: "12%", height: "8%", bg: "bg-blue-600" } },
    { id: "A3-T1", name: "A3-T1", type: "VIP",  side: "top", style: { top: "16%", left: "29%", width: "12%", height: "8%", bg: "bg-orange-500" } },
    { id: "A1-T1", name: "A1-T1", type: "SVIP", side: "top", style: { top: "16%", left: "43%", width: "14%", height: "8%", bg: "bg-red-600" } },    
    { id: "A2-T1", name: "A2-T1", type: "VIP",  side: "top", style: { top: "16%", left: "59%", width: "12%", height: "8%", bg: "bg-orange-500" } }, 
    { id: "A4-T1", name: "A4-T1", type: "CAT1", side: "top", style: { top: "16%", left: "73%", width: "12%", height: "8%", bg: "bg-blue-600" } },

    // KHÁN ĐÀI B (Dưới)
    { id: "B14-T1", name: "B14", type: "CAT2", side: "bottom", style: { bottom: "12%", left: "22%", width: "11%", height: "9%", bg: "bg-blue-400" } },
    { id: "B13-T1", name: "B13", type: "CAT2", side: "bottom", style: { bottom: "10%", left: "35%", width: "11%", height: "9%", bg: "bg-yellow-400" } },
    { id: "B10-T1", name: "B10", type: "CAT2", side: "bottom", style: { bottom: "10%", left: "54%", width: "11%", height: "9%", bg: "bg-green-500" } },
    { id: "B9-T1",  name: "B9",  type: "CAT2", style: { bottom: "12%", left: "67%", width: "11%", height: "9%", bg: "bg-blue-400" } },

    // KHÁN ĐÀI C/D (Hai bên)
    { id: "B15-T1", name: "B15", type: "CAT2", side: "left", style: { top: "38%", left: "8%", width: "6%", height: "24%", bg: "bg-purple-500" } }, 
    { id: "B8-T1",  name: "B8",  type: "CAT2", side: "right", style: { top: "38%", right: "8%", width: "6%", height: "24%", bg: "bg-purple-500" } }, 
  ];

  // --- LOGIC ---
    const navigate = useNavigate();
    const { cartItems, addToCart, removeFromCart } = useCart();
  
  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
    setViewMode("zone");
    setZoomLevel(1);
  };

  const handleBackToStadium = () => {
    setViewMode("stadium");
    setSelectedZone(null);
    setZoomLevel(1);
  };

  const handleTicketTypeClick = (targetZoneId) => {
    const zone = zones.find(z => z.id === targetZoneId);
    if (zone) {
        setSelectedZone(zone);
        setViewMode("zone");
        setZoomLevel(1);
    } else {
        alert("Khu vực này hiện chưa mở bán online.");
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 2.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.6));
  const handleResetZoom = () => setZoomLevel(1);

    // --- LOGIC CHỌN GHẾ ---
    const handleSeatClick = (seatId, price) => {
        const isSelected = cartItems.find((s) => s.id === seatId);

        if (isSelected) {
            // Bỏ chọn
            removeFromCart(seatId);
        } else {
            // Thêm vào giỏ - Kiểm tra giới hạn 4 vé
            if (cartItems.length >= 4) {
                setShowLimitModal(true);
                return;
            }
            addToCart([{ id: seatId, price, zone: selectedZone?.name || "" }]);
        }
    };

  // Helper render ghế
  const renderSeats = (zone) => {
    return Array.from({ length: 60 }).map((_, idx) => {
        const seatId = `${zone.id}-${idx + 1}`;
        const isSelected = cartItems.find(s => s.id === seatId);
        const isSold = Math.random() < 0.1;
        
        let ticketType = ticketTypes[0]; 
        if (zone.type === "SVIP") ticketType = ticketTypes.find(t => t.id === "SVIP");
        else if (zone.type === "VIP") ticketType = ticketTypes.find(t => t.id === "VIP");
        else if (zone.type === "CAT2") ticketType = ticketTypes.find(t => t.id === "CAT2");
        
        return (
            <button
                key={seatId}
                disabled={isSold}
                onClick={() => handleSeatClick(seatId, ticketType.price)}
                className={`
                    w-8 h-8 rounded text-[10px] font-bold flex items-center justify-center transition-all 
                    ${isSold 
                        ? "bg-gray-300 text-gray-400 cursor-not-allowed" 
                        : isSelected 
                            ? "bg-green-600 text-white shadow-lg scale-110" 
                            : "bg-white border border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600"
                    }
                `}
            >
                {isSold ? "" : idx + 1}
            </button>
        );
    });
  };

  return (
    <UserLayout>
      <div className="bg-gray-100 min-h-screen pb-12 relative">
        
        {/* --- MODAL CẢNH BÁO QUÁ GIỚI HẠN VÉ --- */}
        {showLimitModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center relative">
                    {/* Nút đóng góc trên */}
                    <button onClick={() => setShowLimitModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                    
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <AlertCircle size={32} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Thông báo</h3>
                    <p className="text-gray-600 mb-6">
                        Mỗi tài khoản chỉ được chọn tối đa <span className="font-bold text-red-600">4 vé</span> cho mỗi lần đặt để đảm bảo quyền lợi cho các cổ động viên khác.
                    </p>
                    
                    <button 
                        onClick={() => setShowLimitModal(false)}
                        className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition"
                    >
                        Đã hiểu
                    </button>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm">
            <div className="container mx-auto px-6 py-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <Link to="/matches" className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronLeft/></Link>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {matchInfo.home} <span className="text-gray-400">vs</span> {matchInfo.away}
                            </h2>
                            <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><MapPin size={14}/> {matchInfo.stadium}</span>
                                <span className="flex items-center gap-1"><Calendar size={14}/> {matchInfo.date}</span>
                                <span className="flex items-center gap-1"><Clock size={14}/> {matchInfo.time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row gap-6 h-[80vh]">
                
                {/* === CỘT TRÁI: SƠ ĐỒ SÂN / GHẾ === */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative flex flex-col">
                    
                    {/* Toolbar */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-white p-1.5 rounded-lg shadow-lg border border-gray-200">
                        <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded-md text-gray-700 transition-colors" title="Phóng to"><ZoomIn size={20}/></button>
                        <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded-md text-gray-700 transition-colors" title="Thu nhỏ"><ZoomOut size={20}/></button>
                        <button onClick={handleResetZoom} className="p-2 hover:bg-gray-100 rounded-md text-gray-700 transition-colors" title="Mặc định"><RotateCcw size={20}/></button>
                    </div>

                    {/* Header Khu vực */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 text-center relative z-10">
                        {viewMode === "stadium" ? (
                            <h2 className="font-bold text-lg text-gray-800">Sơ đồ sân vận động</h2>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={handleBackToStadium} className="text-sm text-blue-600 hover:underline flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-blue-100 shadow-sm"><ChevronLeft size={16}/> Quay lại sơ đồ</button>
                                <span className="text-gray-300">|</span>
                                <h2 className="font-bold text-lg text-gray-800">Khu vực {selectedZone?.name}</h2>
                            </div>
                        )}
                    </div>

                    {/* MAIN VIEWPORT */}
                    <div className="flex-1 bg-white relative overflow-hidden flex items-center justify-center p-4 select-none">
                        <div style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.3s ease" }} className="w-full h-full flex items-center justify-center relative">
                            
                            {/* VIEW 1: TOÀN CẢNH SÂN */}
                            {viewMode === "stadium" && (
                                <div className="relative w-[800px] h-[500px]">
                                    {/* Sân cỏ */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[55%] h-[40%] bg-green-600 rounded-[30px] border-4 border-white flex items-center justify-center shadow-xl z-0">
                                        <div className="w-full h-[1px] bg-white/50 absolute"></div>
                                        <div className="w-[1px] h-full bg-white/50 absolute"></div>
                                        <div className="w-20 h-20 border border-white/50 rounded-full absolute"></div>
                                        <div className="w-[15%] h-[40%] border border-white/50 absolute left-0"></div>
                                        <div className="w-[15%] h-[40%] border border-white/50 absolute right-0"></div>
                                    </div>
                                    
                                    {/* Các khu vực */}
                                    {zones.map((zone) => (
                                        <div 
                                            key={zone.id}
                                            onClick={() => handleZoneClick(zone)}
                                            className={`absolute cursor-pointer flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-md hover:scale-105 hover:brightness-110 transition-all duration-200 z-10 rounded-md border border-white/20 ${zone.style.bg}`}
                                            style={{
                                                top: zone.style.top, bottom: zone.style.bottom, left: zone.style.left, right: zone.style.right,
                                                width: zone.style.width, height: zone.style.height, borderRadius: zone.style.borderRadius
                                            }}
                                        >
                                            {zone.name}
                                        </div>
                                    ))}

                                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 font-bold text-gray-300 text-sm">Khán đài B</div>
                                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 font-bold text-gray-300 text-sm">Khán đài A</div>
                                </div>
                            )}

                            {/* VIEW 2: CHI TIẾT GHẾ & HƯỚNG SÂN */}
                            {viewMode === "zone" && (
                                <div className="flex flex-col items-center justify-center w-full h-full">
                                    
                                    {/* HƯỚNG SÂN: Nếu ngồi khán đài A (Top) -> Hướng sân ở DƯỚI */}
                                    {selectedZone.side === 'top' && (
                                        <>
                                            <div className="grid gap-2 md:gap-3 p-6 bg-white border border-gray-200 rounded-xl shadow-sm inline-grid" style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}>
                                                {renderSeats(selectedZone)}
                                            </div>
                                            <div className="w-[60%] h-10 bg-gray-100 rounded-b-2xl text-gray-400 font-bold flex items-center justify-center shadow-inner text-xs gap-1 mt-4">
                                                <ArrowDown size={14}/> HƯỚNG SÂN <ArrowDown size={14}/>
                                            </div>
                                        </>
                                    )}

                                    {/* HƯỚNG SÂN: Nếu ngồi khán đài B (Bottom) -> Hướng sân ở TRÊN */}
                                    {selectedZone.side === 'bottom' && (
                                        <>
                                            <div className="w-[60%] h-10 bg-gray-100 rounded-t-2xl text-gray-400 font-bold flex items-center justify-center shadow-inner text-xs gap-1 mb-4">
                                                <ArrowUp size={14}/> HƯỚNG SÂN <ArrowUp size={14}/>
                                            </div>
                                            <div className="grid gap-2 md:gap-3 p-6 bg-white border border-gray-200 rounded-xl shadow-sm inline-grid" style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}>
                                                {renderSeats(selectedZone)}
                                            </div>
                                        </>
                                    )}

                                    {/* HƯỚNG SÂN: Nếu ngồi khán đài C (Left) -> Hướng sân ở PHẢI */}
                                    {selectedZone.side === 'left' && (
                                        <div className="flex items-center gap-4">
                                            <div className="grid gap-2 p-4 bg-white border border-gray-200 rounded-xl shadow-sm" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                                                {renderSeats(selectedZone)}
                                            </div>
                                            <div className="h-40 w-10 bg-gray-100 rounded-r-2xl text-gray-400 font-bold flex flex-col items-center justify-center shadow-inner text-xs gap-2 writing-vertical-lr">
                                                <ArrowRight size={14}/> <span className="rotate-90">HƯỚNG SÂN</span> <ArrowRight size={14}/>
                                            </div>
                                        </div>
                                    )}

                                    {/* HƯỚNG SÂN: Nếu ngồi khán đài D (Right) -> Hướng sân ở TRÁI */}
                                    {selectedZone.side === 'right' && (
                                        <div className="flex items-center gap-4">
                                            <div className="h-40 w-10 bg-gray-100 rounded-l-2xl text-gray-400 font-bold flex flex-col items-center justify-center shadow-inner text-xs gap-2">
                                                <ArrowLeft size={14}/> <span className="rotate-[-90deg] whitespace-nowrap">HƯỚNG SÂN</span> <ArrowLeft size={14}/>
                                            </div>
                                            <div className="grid gap-2 p-4 bg-white border border-gray-200 rounded-xl shadow-sm" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                                                {renderSeats(selectedZone)}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6 flex justify-center gap-8 text-xs font-medium">
                                        <div className="flex items-center gap-2"><div className="w-5 h-5 border border-gray-300 rounded bg-white shadow-sm"></div> Trống</div>
                                        <div className="flex items-center gap-2"><div className="w-5 h-5 bg-gray-300 rounded shadow-sm"></div> Đã đặt</div>
                                        <div className="flex items-center gap-2"><div className="w-5 h-5 bg-green-600 rounded shadow-sm"></div> Đang chọn</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* === CỘT PHẢI: DANH SÁCH VÉ === */}
                <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden h-full">
                    <div className="p-4 border-b border-gray-100 bg-red-50">
                        <h3 className="font-bold text-gray-800 text-lg">Danh sách vé</h3>
                        <p className="text-xs text-gray-500">Chọn loại vé để xem vị trí</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {ticketTypes.map((ticket) => (
                            <div 
                                key={ticket.id} 
                                onClick={() => handleTicketTypeClick(ticket.targetZone)}
                                className="group border border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition cursor-pointer relative overflow-hidden bg-white"
                            >
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${ticket.color}`}></div>
                                
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded ${ticket.color}`}>
                                        {ticket.id}
                                    </span>
                                    <Info size={16} className="text-gray-300 hover:text-blue-500"/>
                                </div>
                                
                                <h4 className="font-bold text-gray-900 mb-1">{ticket.name}</h4>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-lg font-bold text-red-600">{ticket.price.toLocaleString()} VND</p>
                                        <p className="text-[10px] text-gray-400">(Gồm 8% VAT)</p>
                                    </div>
                                </div>
                                
                                <p className="text-xs text-blue-600 mt-3 font-medium group-hover:underline text-right flex items-center justify-end gap-1">
                                    <Check size={12}/> Chọn trên sơ đồ
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={() => {
                            if (cartItems.length === 0) return;
                            navigate('/cart'); }}
                            disabled={cartItems.length === 0}
                            className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ShoppingCart size={18}/> Mua ngay
                        </button>
                    </div>                         
                </div>
            </div>

            {/* --- KHU VỰC BÌNH LUẬN (MỚI) --- */}
            <div className="mt-12">
                <CommentSection matchId={id} />
            </div>

        </div>
      </div>
    </UserLayout>
  );
}