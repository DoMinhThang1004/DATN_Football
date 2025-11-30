import React, { useState, useEffect } from "react";
import { Search, Calendar, MapPin, Filter, ChevronDown, ArrowRight,RotateCcw, Ticket, Clock, TrendingUp, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom"; 
import UserLayout from "../../layouts/UserLayout.jsx";

const API_URL = "http://localhost:5000/api/matches";
const leagues = ["Tất cả", "V-League", "Cúp Quốc Gia", "Giao Hữu"];

export default function MatchPage() {
  const [searchParams] = useSearchParams();
  
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const initialSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedLeague, setSelectedLeague] = useState("Tất cả");

  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Số trận mỗi trang (Nên là số chẵn để đẹp grid 2 cột)

  // Cập nhật searchTerm khi URL thay đổi
  useEffect(() => {
    const query = searchParams.get("search");
    if (query !== null) {
        setSearchTerm(query);
    }
  }, [searchParams]);

  // Fetch Data
  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        
        const formattedData = data.map(m => ({
            id: m.id,
            homeTeam: m.home_team,
            awayTeam: m.away_team,
            homeLogo: m.home_logo,
            awayLogo: m.away_logo,
            stadium: m.stadium_name,
            date: new Date(m.start_time).toLocaleDateString('vi-VN'),
            time: new Date(m.start_time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}),
            status: m.status,
            league: m.league || "V-LEAGUE",
            price: 0 
        }));

        setMatches(formattedData);
      } catch (error) {
        console.error("Lỗi tải trận đấu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // --- FILTER LOGIC ---
  const filteredMatches = matches.filter((match) => {
    const matchInfo = `${match.homeTeam} ${match.awayTeam} ${match.stadium}`.toLowerCase();
    const matchesSearch = matchInfo.includes(searchTerm.toLowerCase());
    const matchesLeague = selectedLeague === "Tất cả" || match.league === selectedLeague;
    return matchesSearch && matchesLeague;
  });

  // --- PAGINATION LOGIC ---
  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLeague]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMatches = filteredMatches.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Cuộn lên đầu danh sách khi chuyển trang
    document.getElementById('match-list-top')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "SELLING": return <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-xs font-bold border border-orange-100 shadow-sm"><TrendingUp size={14} /> Đang bán chạy</div>;
      case "SOLD_OUT": return <div className="flex items-center gap-1 text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 shadow-sm">Hết vé</div>;
      case "ENDED": return <div className="flex items-center gap-1 text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 shadow-sm">Kết thúc</div>;
      default: return <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-100 shadow-sm"><Ticket size={14} /> Sắp mở bán</div>;
    }
  };

  return (
    <UserLayout>
      <div className="bg-gray-50 min-h-screen pb-20" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"}}>
        
        {/* BANNER & FILTER SECTION */}
        <div className="relative bg-gray-900 text-white shadow-lg sticky top-16 z-20">
            <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{backgroundImage: "url('https://placehold.co/1920x400/1e293b/FFFFFF?text=Stadium')"}}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/50"></div>

            <div className="container mx-auto px-6 py-10 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">Lịch thi đấu</h1>
                        <p className="text-gray-300 mt-2 text-base font-light">Đặt vé trực tuyến - Nhận vé tức thì - Cổ vũ đam mê</p>
                    </div>
                    <div className="text-sm font-medium bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-xl shadow-inner">
                        Tìm thấy <span className="font-bold text-xl text-yellow-400 mx-1">{filteredMatches.length}</span> trận đấu
                    </div>
                </div>

                {/* TOOLBAR */}
                <div className="flex flex-col md:flex-row gap-4 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Tìm đội bóng, sân vận động..." 
                            className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative min-w-[240px]">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"><Filter size={20} /></div>
                        <select 
                            className="w-full pl-12 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm appearance-none cursor-pointer shadow-sm font-medium"
                            value={selectedLeague}
                            onChange={(e) => setSelectedLeague(e.target.value)}
                        >
                            {leagues.map((league) => (<option key={league} value={league}>{league}</option>))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>
        </div>

        {/* LIST TRẬN ĐẤU */}
        <div id="match-list-top" className="container mx-auto px-6 py-10">
            {isLoading ? (
                <div className="flex justify-center py-32"><Loader2 className="animate-spin text-blue-600" size={48}/></div>
            ) : currentMatches.length > 0 ? (
                <>
                    {/* Grid hiển thị (Tăng gap và padding) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {currentMatches.map((match) => (
                            <div key={match.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col sm:flex-row h-auto min-h-[12rem]">
                                
                                {/* CỘT TRÁI: THỜI GIAN */}
                                <div className="sm:w-[35%] bg-gray-50 p-6 flex flex-col justify-center items-center sm:items-start border-b sm:border-b-0 sm:border-r border-gray-100 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div> {/* Line trang trí */}
                                    
                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-3 bg-white border border-blue-100 px-2.5 py-1 rounded-md shadow-sm">
                                        {match.league}
                                    </span>
                                    <div className="text-center sm:text-left mb-3">
                                        <p className="text-4xl font-black text-gray-800 leading-none tracking-tight">{match.date.split('/')[0]}</p>
                                        <p className="text-sm text-gray-500 uppercase font-bold mt-1">Tháng {match.date.split('/')[1]}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700 font-semibold bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-sm whitespace-nowrap shadow-sm">
                                        <Clock size={16} className="text-blue-500"/> {match.time}
                                    </div>
                                </div>

                                {/* CỘT PHẢI: CHI TIẾT */}
                                <div className="sm:w-[65%] p-6 flex flex-col justify-between relative">
                                    <div className="absolute top-4 right-4 z-10">{getStatusBadge(match.status)}</div>

                                    {/* Logo & Tên đội */}
                                    <div className="flex items-center justify-between mt-6 mb-4 px-2">
                                        <div className="flex flex-col items-center gap-2 w-1/3 group-hover:-translate-y-1 transition-transform duration-300">
                                            <img src={match.homeLogo || "https://via.placeholder.com/60"} alt={match.homeTeam} className="w-14 h-14 object-contain drop-shadow-md"/>
                                            <span className="text-sm font-bold text-center text-gray-900 line-clamp-2 h-10 flex items-center justify-center leading-tight">{match.homeTeam}</span>
                                        </div>
                                        
                                        <div className="text-2xl font-black text-gray-200 italic select-none">VS</div>
                                        
                                        <div className="flex flex-col items-center gap-2 w-1/3 group-hover:-translate-y-1 transition-transform duration-300">
                                            <img src={match.awayLogo || "https://via.placeholder.com/60"} alt={match.awayTeam} className="w-14 h-14 object-contain drop-shadow-md"/>
                                            <span className="text-sm font-bold text-center text-gray-900 line-clamp-2 h-10 flex items-center justify-center leading-tight">{match.awayTeam}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-medium bg-gray-50 py-2 rounded-lg mx-2 mb-4">
                                        <MapPin size={14} className="text-red-500"/> {match.stadium}
                                    </div>

                                    {/* Footer: Nút Mua */}
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Giá vé từ</p>
                                            <p className="text-lg font-bold text-red-600 leading-none">
                                                {match.price > 0 ? match.price.toLocaleString()+'₫' : 'Liên hệ'}
                                            </p>
                                        </div>
                                        
                                        {match.status === 'SOLD_OUT' ? (
                                            <button disabled className="bg-gray-100 text-gray-400 px-5 py-2.5 rounded-xl font-bold cursor-not-allowed text-sm border border-gray-200">
                                                Đã hết vé
                                            </button>
                                        ) : (
                                            <Link 
                                                to={`/matches/${match.id}`}
                                                className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-gray-300 flex items-center gap-2 transition-all hover:bg-blue-600 hover:shadow-blue-200 active:scale-95 text-sm whitespace-nowrap"
                                            >
                                                <Ticket size={16}/> Mua vé ngay
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- PHÂN TRANG (PAGINATION) --- */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-12 gap-2">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                            >
                                <ChevronLeft size={20} className="text-gray-600"/>
                            </button>

                            {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-11 h-11 rounded-xl font-bold text-sm transition-all shadow-sm ${
                                        currentPage === page 
                                        ? 'bg-blue-600 text-white shadow-blue-200 scale-105' 
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                            >
                                <ChevronRight size={20} className="text-gray-600"/>
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm mx-auto max-w-2xl">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search size={32} className="text-gray-400"/>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy trận đấu phù hợp</h3>
                    <p className="text-gray-500 mb-8">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc giải đấu.</p>
                    <button 
                        onClick={() => {setSearchTerm(""); setSelectedLeague("Tất cả")}}
                        className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
                    >
                        <RotateCcw size={16}/> Xóa bộ lọc và tìm lại
                    </button>
                </div>
            )}
        </div>
      </div>
    </UserLayout>
  );
}