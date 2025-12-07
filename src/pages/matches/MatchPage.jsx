import React, { useState, useEffect } from "react";
import { 
    Search, Calendar, MapPin, Filter, ChevronDown, Ticket, 
    Loader2, ChevronLeft, ChevronRight, Flame, Check, X 
} from "lucide-react"; 
import { Link, useSearchParams } from "react-router-dom"; 
import UserLayout from "../../layouts/UserLayout.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_MATCHES = `${API_BASE}/api/matches`;

// Component con: Nút X (Dùng Lucide X thay vì SVG tự vẽ)
const CloseIcon = ({size}) => <X size={size} />; 

function MatchCard({ match }) {
    const formatDate = (isoString) => isoString ? new Date(isoString).toLocaleString('vi-VN', {weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}) : "";
    const isSelling = match.status === 'SELLING';

    return (
        <Link 
            to={`/matches/${match.id}`} 
            className="group bg-white rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="relative h-36 bg-gray-900 overflow-hidden">
                <img src={match.bannerUrl || match.homeLogo || "https://via.placeholder.com/400x200"} alt="Match" className="w-full h-full object-cover opacity-70 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute top-2 right-2">
                    {isSelling ? <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse flex items-center gap-1"><Flame size={10} className="fill-current"/> HOT</span> : <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">SẮP TỚI</span>}
                </div>
                <div className="absolute bottom-0 left-0 w-full p-2 flex justify-between items-end">
                    <div className="flex flex-col items-center w-1/3"><img src={match.homeLogo} className="w-8 h-8 object-contain drop-shadow-md bg-white/10 rounded-full p-0.5 backdrop-blur-sm"/></div>
                    <div className="text-white font-black text-lg italic pb-1">VS</div>
                    <div className="flex flex-col items-center w-1/3"><img src={match.awayLogo} className="w-8 h-8 object-contain drop-shadow-md bg-white/10 rounded-full p-0.5 backdrop-blur-sm"/></div>
                </div>
            </div>

            <div className="p-3 flex flex-col flex-1">
                <div className="grid grid-cols-5 gap-1 items-center mt-2 mb-3 w-full">
                    <h3 className="col-span-2 font-bold text-gray-900 text-xs leading-tight uppercase group-hover:text-blue-600 transition-colors text-right truncate" title={match.homeTeam}>
                        {match.homeTeam}
                    </h3>
                    <span className="col-span-1 text-center text-[10px] font-black text-gray-400 shrink-0">VS</span>
                    <h3 className="col-span-2 font-bold text-gray-900 text-xs leading-tight uppercase group-hover:text-red-600 transition-colors text-left truncate" title={match.awayTeam}>
                        {match.awayTeam}
                    </h3>
                </div>

                <div className="mt-auto space-y-1 border-t border-dashed border-gray-100 pt-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium"><Calendar size={10} className="text-blue-500"/> <span>{formatDate(match.start_time)}</span></div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium"><MapPin size={10} className="text-red-500"/> <span className="truncate">{match.stadium}</span></div>
                </div>
                <button className={`w-full mt-2 py-1.5 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${isSelling ? 'bg-gray-900 text-white group-hover:bg-red-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                    {isSelling ? "Mua vé ngay" : "Chi tiết"}
                </button>
            </div>
        </Link>
    );
}

// --- COMPONENT CHÍNH ---
export default function MatchPage() {
    const [searchParams] = useSearchParams();
    
    // Data State
    const [matches, setMatches] = useState([]);
    const [leagues, setLeagues] = useState([]); // Lấy danh sách giải đấu từ API
    const [bannerImages, setBannerImages] = useState([]); // Lấy banner từ API
    const [isLoading, setIsLoading] = useState(true);
    
    // Filter State
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [selectedLeagues, setSelectedLeagues] = useState([]); 
    const [filterStatus, setFilterStatus] = useState("ALL");    
    const [sortBy, setSortBy] = useState("LATEST"); 
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; 

    // Banner State
    const [currentBanner, setCurrentBanner] = useState(0);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Lấy danh sách trận đấu
                const res = await fetch(API_MATCHES);
                const data = await res.json();
                
                // Format dữ liệu
                const formattedMatches = data.map(m => ({
                    id: m.id,
                    homeTeam: m.home_team,
                    awayTeam: m.away_team,
                    homeLogo: m.home_logo,
                    awayLogo: m.away_logo,
                    bannerUrl: m.banner_url,
                    stadium: m.stadium_name,
                    start_time: m.start_time,
                    status: m.status,
                    league: m.league || "Giao Hữu",
                    price: m.price_min || 0 
                }));
                setMatches(formattedMatches);

                // 2. Trích xuất danh sách giải đấu (Unique Leagues) từ dữ liệu trận đấu
                // Thay vì dùng MOCK DATA, ta lấy thực tế từ DB có gì hiện nấy
                const uniqueLeagues = [...new Set(formattedMatches.map(m => m.league))].filter(Boolean);
                setLeagues(uniqueLeagues);

                // 3. Lấy ảnh Banner từ các trận đấu nổi bật (hoặc trận sắp tới)
                // Lấy 3 trận mới nhất có banner để làm slider
                const banners = formattedMatches
                    .filter(m => m.bannerUrl)
                    .slice(0, 3)
                    .map(m => m.bannerUrl);
                
                // Nếu không có banner nào, dùng ảnh placeholder hoặc ảnh mặc định
                if (banners.length > 0) {
                    setBannerImages(banners);
                } else {
                    setBannerImages(["https://via.placeholder.com/1200x400?text=Football+Tic"]);
                }

            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- AUTO SLIDE BANNER ---
    useEffect(() => {
        if (bannerImages.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % bannerImages.length);
        }, 5000); 
        return () => clearInterval(timer);
    }, [bannerImages]);

    // --- LOGIC LỌC & SẮP XẾP ---
    let processedMatches = matches.filter((match) => {
        const matchInfo = `${match.homeTeam} ${match.awayTeam} ${match.stadium}`.toLowerCase();
        const matchesSearch = matchInfo.includes(searchTerm.toLowerCase());
        const matchesLeague = selectedLeagues.length === 0 || selectedLeagues.includes(match.league);
        let matchesStatus = true;
        if (filterStatus !== 'ALL') {
            matchesStatus = match.status === filterStatus;
        }
        return matchesSearch && matchesLeague && matchesStatus;
    });

    processedMatches.sort((a, b) => {
        if (sortBy === 'LATEST') return new Date(b.start_time) - new Date(a.start_time);
        if (sortBy === 'OLDEST') return new Date(a.start_time) - new Date(b.start_time);
        if (sortBy === 'A-Z') return a.homeTeam.localeCompare(b.homeTeam);
        if (sortBy === 'Z-A') return b.homeTeam.localeCompare(a.homeTeam);
        return 0;
    });

    // --- PHÂN TRANG ---
    useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedLeagues, filterStatus, sortBy]); 

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMatches = processedMatches.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(processedMatches.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 500, behavior: 'smooth' }); 
    };

    const toggleLeague = (league) => {
        setSelectedLeagues(prev => 
            prev.includes(league) ? prev.filter(l => l !== league) : [...prev, league]
        );
    };

    return (
        <UserLayout>
            <div className="bg-gray-100 min-h-screen pb-20 font-sans">
                
                {/* --- BANNER --- */}
                <div className="relative h-[300px] md:h-[400px] bg-gray-900 overflow-hidden group">
                    {bannerImages.map((img, index) => (
                        <div 
                            key={index} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}>
                            <img src={img} alt="Banner" className="w-full h-full object-cover opacity-60"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                        </div>
                    ))}
                    
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-10 px-4">
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl mb-4 animate-in slide-in-from-bottom-10 fade-in duration-700">
                            SÀN ĐẤU <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">RỰC LỬA</span>
                        </h1>
                        <p className="text-gray-300 text-lg md:text-xl font-light max-w-2xl drop-shadow-md">
                            Đặt vé ngay hôm nay để đồng hành cùng đội bóng bạn yêu thích.
                        </p>
                    </div>
                    
                    {bannerImages.length > 1 && (
                        <>
                            <button onClick={() => setCurrentBanner((prev) => (prev - 1 + bannerImages.length) % bannerImages.length)} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/60 text-white rounded-full transition opacity-0 group-hover:opacity-100">
                                <ChevronLeft size={32}/>
                            </button>
                            <button onClick={() => setCurrentBanner((prev) => (prev + 1) % bannerImages.length)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/60 text-white rounded-full transition opacity-0 group-hover:opacity-100">
                                <ChevronRight size={32}/>
                            </button>
                        </>
                    )}
                </div>

                {/* --- MAIN CONTENT --- */}
                <div className="container mx-auto px-4 py-8 relative"> 
                    <div className="flex flex-col lg:flex-row gap-6 items-start"> 
                        
                        {/* --- SIDEBAR BỘ LỌC --- */}
                        <div className="w-full lg:w-1/5 space-y-6 flex-shrink-0 sticky top-24 z-10 h-fit">
                            
                            {/* Tìm kiếm */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide"><Search size={16}/> Tìm kiếm</h3>
                                <div className="relative">
                                    <input 
                                        type="text" placeholder="Tên đội, sân..." 
                                        className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                                            <CloseIcon size={14}/> 
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Lọc Giải đấu (Dynamic from API) */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide"><Filter size={16}/> Giải đấu</h3>
                                <div className="space-y-2">
                                    {leagues.length > 0 ? (
                                        leagues.map((league) => (
                                            <label key={league} className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 p-1 rounded-md transition-colors">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedLeagues.includes(league) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                                    {selectedLeagues.includes(league) && <Check size={12} className="text-white"/>}
                                                </div>
                                                <input 
                                                    type="checkbox" className="hidden" 
                                                    checked={selectedLeagues.includes(league)} 
                                                    onChange={() => toggleLeague(league)}/>
                                                <span className={`text-xs ${selectedLeagues.includes(league) ? 'font-bold text-blue-700' : 'text-gray-600'}`}>{league}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">Đang tải giải đấu...</p>
                                    )}
                                </div>
                            </div>

                            {/* Lọc Trạng thái (Giữ nguyên Static) */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide"><Ticket size={16}/> Trạng thái</h3>
                                <div className="space-y-1">
                                    {[
                                        { val: 'ALL', label: 'Tất cả' },
                                        { val: 'SELLING', label: 'Đang mở bán' },
                                        { val: 'UPCOMING', label: 'Sắp diễn ra' },
                                        { val: 'SOLD_OUT', label: 'Đã hết vé' },
                                    ].map((opt) => (
                                        <label key={opt.val} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-gray-50 transition">
                                            <input 
                                                type="radio" name="status" value={opt.val} 
                                                checked={filterStatus === opt.val} 
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 accent-blue-600" />
                                            <span className="text-xs text-gray-700 font-medium">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* --- DANH SÁCH TRẬN ĐẤU --- */}
                        <div className="w-full lg:w-4/5">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-800 mb-2 sm:mb-0">
                                    Danh sách trận đấu <span className="text-sm font-normal text-gray-500 ml-2 bg-gray-100 px-2 py-1 rounded-full">{processedMatches.length} kết quả</span>
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 font-medium">Sắp xếp theo:</span>
                                    <div className="relative group">
                                        <select 
                                            className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1.5 pl-3 pr-8 rounded-lg cursor-pointer text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-gray-100 transition-colors"
                                            value={sortBy} onChange={(e) => setSortBy(e.target.value)} >
                                            <option value="LATEST">Mới nhất</option>
                                            <option value="OLDEST">Cũ nhất</option>
                                            <option value="A-Z">Tên đội (A-Z)</option>
                                            <option value="Z-A">Tên đội (Z-A)</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-gray-800"/>
                                    </div>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40}/></div>
                            ) : currentMatches.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {currentMatches.map((match) => (
                                            <MatchCard key={match.id} match={match} />
                                        ))}
                                    </div>
                                    
                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center mt-12 gap-2">
                                            <button 
                                                onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} 
                                                className="w-9 h-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 transition">
                                                <ChevronLeft size={18}/>
                                            </button>
                                            
                                            {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                                                <button 
                                                    key={page} onClick={() => handlePageChange(page)} 
                                                    className={`w-9 h-9 rounded-lg font-bold text-xs transition shadow-sm ${
                                                        currentPage === page 
                                                        ? 'bg-gray-900 text-white border-gray-900' 
                                                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                                    }`}>
                                                    {page}
                                                </button>
                                            ))}

                                            <button 
                                                onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} 
                                                className="w-9 h-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 transition">
                                                <ChevronRight size={18}/>
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                    <Search size={48} className="mx-auto text-gray-300 mb-4"/>
                                    <p className="text-gray-500 font-medium">Không tìm thấy trận đấu nào phù hợp.</p>
                                    <button onClick={() => {setSearchTerm(""); setFilterStatus("ALL"); setSelectedLeagues([]); setSortBy("LATEST");}} className="mt-4 text-blue-600 font-bold hover:underline text-sm">Xóa bộ lọc</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}