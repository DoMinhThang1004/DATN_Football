import React, { useState } from "react";
import { Search, Calendar, MapPin, Filter, ChevronDown, ArrowRight, Ticket, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout.jsx";

// --- 1. MOCK DATA ---
const allMatches = [
  {
    id: 1,
    league: "Premier League",
    homeTeam: "Man United", 
    awayTeam: "Liverpool",
    homeLogo: "https://placehold.co/100x100/DA291C/FFF?text=MU",
    awayLogo: "https://placehold.co/100x100/C8102E/FFF?text=LIV",
    date: "15/11/2025",
    time: "20:00",
    stadium: "Old Trafford",
    price: 2500000,
    status: "selling_fast",
  },
  {
    id: 2,
    league: "La Liga",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    homeLogo: "https://placehold.co/100x100/FFFFFF/000?text=RM",
    awayLogo: "https://placehold.co/100x100/004D98/FFF?text=BAR",
    date: "16/11/2025",
    time: "02:00",
    stadium: "Bernabéu",
    price: 3200000,
    status: "available",
  },
  {
    id: 3,
    league: "Bundesliga",
    homeTeam: "Bayern",
    awayTeam: "Dortmund",
    homeLogo: "https://placehold.co/100x100/DC052D/FFF?text=BAY",
    awayLogo: "https://placehold.co/100x100/FDE100/000?text=DOR",
    date: "17/11/2025",
    time: "23:30",
    stadium: "Allianz Arena",
    price: 1800000,
    status: "available",
  },
  {
    id: 4,
    league: "Premier League",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    homeLogo: "https://placehold.co/100x100/EF0107/FFF?text=ARS",
    awayLogo: "https://placehold.co/100x100/034694/FFF?text=CHE",
    date: "18/11/2025",
    time: "19:30",
    stadium: "Emirates",
    price: 2100000,
    status: "selling_fast",
  },
  {
    id: 5,
    league: "Serie A",
    homeTeam: "Juventus",
    awayTeam: "AC Milan",
    homeLogo: "https://placehold.co/100x100/000000/FFF?text=JUV",
    awayLogo: "https://placehold.co/100x100/FB090B/000?text=ACM",
    date: "19/11/2025",
    time: "01:45",
    stadium: "Allianz Stadium",
    price: 1500000,
    status: "sold_out",
  },
  {
    id: 6,
    league: "V-League",
    homeTeam: "Hà Nội FC",
    awayTeam: "CAHN",
    homeLogo: "https://placehold.co/100x100/4B0082/FFF?text=HN",
    awayLogo: "https://placehold.co/100x100/DA291C/FFF?text=CAHN",
    date: "20/11/2025",
    time: "19:15",
    stadium: "Hàng Đẫy",
    price: 200000,
    status: "available",
  },
];

const leagues = ["Tất cả", "Premier League", "La Liga", "Bundesliga", "Serie A", "V-League"];

export default function MatchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("Tất cả");

  const filteredMatches = allMatches.filter((match) => {
    const matchesSearch = 
        match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) || 
        match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.stadium.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLeague = selectedLeague === "Tất cả" || match.league === selectedLeague;
    return matchesSearch && matchesLeague;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "selling_fast":
        return (
            <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-orange-100">
                <TrendingUp size={12} /> Sắp hết
            </div>
        );
      case "sold_out":
        return (
            <div className="flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full text-[10px] font-bold border border-gray-200">
                Hết vé
            </div>
        );
      default:
        return (
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-100">
                <Ticket size={12} /> Mở bán
            </div>
        );
    }
  };

  return (
    <UserLayout>
      <div className="bg-gray-100 min-h-screen pb-16" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"}}>
        
        {/* relative div dưới bị ép lỗi */} 
        <div className=" bg-gray-900 text-white shadow-lg sticky top-16 z-20">
            {/* Ảnh nền mờ */}
            <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{backgroundImage: "url('https://placehold.co/1920x400/1e293b/FFFFFF?text=Stadium')"}}></div>
            {/* Lớp phủ gradient */}
            <div className="absolute inset-0 from-gray-900/50 to-gray-900/90"></div>

            <div className="container mx-auto px-6 py-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Lịch thi đấu</h1>
                        <p className="text-gray-300 mt-1 text-sm">Đặt vé trực tuyến - Nhận vé tức thì</p>
                    </div>
                    <div className="text-sm font-medium bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg">
                        Tìm thấy <span className="font-bold text-lg text-yellow-400">{filteredMatches.length}</span> trận
                    </div>
                </div>

                {/* THANH CÔNG CỤ LỌC (Glassmorphism) */}
                <div className="flex flex-col md:flex-row gap-3 p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                    {/* Ô tìm kiếm */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Tìm đội bóng..." 
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Dropdown */}
                    <div className="relative min-w-[200px]">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                            <Filter size={16} />
                        </div>
                        <select 
                            className="w-full pl-9 pr-8 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm appearance-none cursor-pointer"
                            value={selectedLeague}
                            onChange={(e) => setSelectedLeague(e.target.value)}
                        >
                            {leagues.map((league) => (
                                <option key={league} value={league}>{league}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>

                    {/* Datepicker */}
                    <div className="relative min-w-[200px]">
                         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                            <Calendar size={16} />
                        </div>
                        <input 
                            type="date" 
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-600 text-sm cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* ================= DANH SÁCH TRẬN ĐẤU (NHỎ GỌN HƠN) ================= */}
        <div className="container mx-auto px-6 py-8">
            {filteredMatches.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filteredMatches.map((match) => (
                        // Đã sửa: h-auto min-h-[11rem] để tự giãn theo nội dung
                        <div key={match.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col sm:flex-row h-auto min-h-auto">
                            
                            {/* CỘT TRÁI: THỜI GIAN (Nhỏ hơn) */}
                            <div className="sm:w-1/3 bg-gray-50 p-4 flex flex-col justify-center items-center sm:items-start border-b sm:border-b-0 sm:border-r border-gray-100">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2 bg-white border border-blue-100 px-2 py-0.5 rounded">
                                    {match.league}
                                </span>
                                <div className="text-center sm:text-left mb-2">
                                    <p className="text-3xl font-black text-gray-800 leading-none">{match.date.split('/')[0]}</p>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Tháng {match.date.split('/')[1]}</p>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600 font-semibold bg-white px-2.5 py-1 rounded border border-gray-200 text-xs whitespace-nowrap">
                                    <Clock size={14} className="text-blue-500"/> {match.time}
                                </div>
                            </div>

                            {/* CỘT PHẢI: CHI TIẾT (Compact) */}
                            <div className="sm:w-2/3 p-4 flex flex-col justify-between relative">
                                <div className="absolute top-3 right-3">
                                    {getStatusBadge(match.status)}
                                </div>

                                {/* Logo & Tên đội (Size nhỏ hơn: w-12 h-12) */}
                                <div className="flex items-center justify-between mt-4 mb-3">
                                    <div className="flex flex-col items-center gap-1 w-1/3">
                                        <img src={match.homeLogo} alt={match.homeTeam} className="w-12 h-12 object-contain drop-shadow-sm group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold text-center text-gray-800 line-clamp-2 h-8 flex items-center justify-center leading-tight">{match.homeTeam}</span>
                                    </div>
                                    <div className="text-xl font-black text-gray-300 italic select-none">VS</div>
                                    <div className="flex flex-col items-center gap-1 w-1/3">
                                        <img src={match.awayLogo} alt={match.awayTeam} className="w-12 h-12 object-contain drop-shadow-sm group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold text-center text-gray-800 line-clamp-2 h-8 flex items-center justify-center leading-tight">{match.awayTeam}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 mb-3">
                                    <MapPin size={12} /> {match.stadium}
                                </div>

                                {/* Footer: Giá & Nút Đen */}
                                <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-auto">
                                    <div>
                                        <p className="text-[10px] text-gray-400">Giá từ</p>
                                        <p className="text-base font-bold text-red-600 leading-none">
                                            {match.price.toLocaleString('vi-VN')}₫
                                        </p>
                                    </div>
                                    
                                    {match.status === 'sold_out' ? (
                                        <button disabled className="bg-gray-100 text-gray-400 px-4 py-2 rounded-lg font-bold cursor-not-allowed text-xs">
                                            Hết vé
                                        </button>
                                    ) : (
                                        // NÚT MUA VÉ MÀU ĐEN (Hover mờ)
                                        <Link 
                                            to={`/matches/${match.id}/seats`}
                                            className="bg-gray-700 text-white px-4 py-2 rounded-lg font-bold shadow-md flex items-center gap-2 transition-opacity hover:opacity-80 active:scale-95 text-xs whitespace-nowrap"
                                        >
                                            <Ticket size={14}/> Mua vé ngay
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={24} className="text-gray-400"/>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Không tìm thấy trận đấu</h3>
                    <button 
                        onClick={() => {setSearchTerm(""); setSelectedLeague("Tất cả")}}
                        className="mt-4 text-blue-600 text-sm font-bold hover:underline"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            )}
            
            {filteredMatches.length > 0 && (
                <div className="flex justify-center mt-12">
                    <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-full text-gray-600 text-sm font-bold hover:bg-gray-50 hover:text-blue-600 transition shadow-sm flex items-center gap-2">
                        Xem thêm trận đấu <ArrowRight size={16}/>
                    </button>
                </div>
            )}
        </div>
      </div>
    </UserLayout>
  );
}