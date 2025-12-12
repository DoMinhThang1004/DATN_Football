import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout.jsx";
import { Calendar, MapPin, ArrowRight, Loader2, Ticket, Flame, Zap, Trophy, Medal, Globe, ChevronLeft, ChevronRight, TrendingUp, Tag } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/matches`;

const FEATURED_LEAGUES = [
    { name: "Cúp Quốc Gia", icon: <Trophy size={32} />, color: "from-red-500 to-orange-500", desc: "Vô địch Quốc gia (V-League 1)" },
    { name: "Châu Á", icon: <Medal size={32} />, color: "from-yellow-400 to-yellow-600", desc: "Đỉnh cao Quốc tế" },
    { name: "AFF Cup", icon: <Globe size={32} />, color: "from-blue-500 to-cyan-500", desc: "Đấu trường khu vực" },
    { name: "SEA Games", icon: <Flame size={32} />, color: "from-green-500 to-emerald-500", desc: "Đại hội thể thao" },
    { name: "Giao Hữu", icon: <Zap size={32} />, color: "from-purple-500 to-pink-500", desc: "Giao lưu quốc tế" },
];
const BANNER_IMAGES = [
    `${API_BASE}/uploads/1764953369361-934511660.jpg`,
    `${API_BASE}/uploads/banner-2.jpg`,
    `${API_BASE}/uploads/banner-3.jpg`,
];

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % BANNER_IMAGES.length);
    }, 5000); //5s
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        //lọc ds trd sắp tới
        const activeMatches = data.filter(m => m.status === 'UPCOMING' || m.status === 'SELLING');
        setMatches(activeMatches);
      } catch (error) {
        console.error("Lỗi tải trận đấu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleString('vi-VN', {
      weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  const hotMatches = matches.slice(0, 4); 
  const upcomingMatches = matches.slice(4, 8); 

  return (
    <UserLayout>
      <div className="relative bg-gray-900 text-white py-20 md:py-28 overflow-hidden group h-[500px] md:h-[600px] flex items-center">
        {BANNER_IMAGES.map((img, index) => (
            <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}>
                <img src={img} alt="Banner" className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
            </div>
        ))}
        <button onClick={() => setCurrentBanner((prev) => (prev - 1 + BANNER_IMAGES.length) % BANNER_IMAGES.length)} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/30 text-white rounded-full transition opacity-0 group-hover:opacity-100 backdrop-blur-sm z-20">
            <ChevronLeft size={32}/>
        </button>
        <button onClick={() => setCurrentBanner((prev) => (prev + 1) % BANNER_IMAGES.length)} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/30 text-white rounded-full transition opacity-0 group-hover:opacity-100 backdrop-blur-sm z-20">
            <ChevronRight size={32}/>
        </button>

        <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl animate-in slide-in-from-left duration-700">
                <span className="inline-block py-1 px-3 rounded bg-red-600 text-white text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-red-600/50 animate-pulse">
                    Mùa giải 2025
                </span>
                <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight tracking-tight drop-shadow-2xl">
                    SĂN VÉ <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">ĐỈNH CAO</span> <br/>
                    CỔ VŨ ĐAM MÊ
                </h1>
                <p className="text-base md:text-xl text-gray-200 mb-8 font-light max-w-xl border-l-4 border-yellow-500 pl-4 drop-shadow-md">
                    Hệ thống đặt vé bóng đá trực tuyến số 1 Việt Nam. Đặt vé dễ dàng - Thanh toán an toàn - Nhận vé tức thì.
                </p>
                <div className="flex gap-4">
                    <button onClick={() => document.getElementById('match-list').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-black text-sm md:text-base uppercase skew-x-[-10deg] transition transform hover:-translate-y-1 shadow-lg shadow-yellow-500/20">
                        <span className="block skew-x-[10deg]">Đặt vé ngay</span>
                    </button>
                    <Link to="/matches" className="px-8 py-4 border-2 border-white text-white font-bold text-sm md:text-base uppercase skew-x-[-10deg] hover:bg-white hover:text-black transition transform hover:-translate-y-1 backdrop-blur-sm">
                         <span className="block skew-x-[10deg]">Lịch thi đấu</span>
                    </Link>
                </div>
            </div>
        </div>
      </div>
      <div className="bg-white py-12 border-b border-gray-100 shadow-sm relative z-20 -mt-4 rounded-t-3xl mx-2 md:mx-0">
          <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {FEATURED_LEAGUES.map((league, idx) => (
                      <Link to="/matches" key={idx} className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white hover:-translate-y-1">
                          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${league.color}`}></div>
                          <div className="p-4 flex flex-col items-center text-center">
                              <div className={`mb-3 p-3 rounded-full bg-gradient-to-br ${league.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                  {league.icon}
                              </div>
                              <h3 className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{league.name}</h3>
                              <p className="text-xs text-gray-400 mt-1">{league.desc}</p>
                          </div>
                      </Link>
                  ))}
              </div>
          </div>
      </div>
      <div id="match-list" className="bg-gray-50 py-16 space-y-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" size={48}/></div>
            ) : (
                <>
                    {hotMatches.length > 0 && (
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-red-600 rounded-lg text-white shadow-lg shadow-red-200"><Flame size={24} className="fill-current"/></div>
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Trận cầu <span className="text-red-600">Tâm điểm</span></h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {hotMatches.map((match) => (
                                    <MatchCard key={match.id} match={match} isHot={true} />
                                ))}
                            </div>
                        </div>
                    )}
                    {upcomingMatches.length > 0 && (
                        <div>
                            <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200"><Zap size={24} className="fill-current"/></div>
                                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Sắp <span className="text-blue-600">Diễn ra</span></h2>
                                </div>
                                <Link to="/matches" className="text-sm font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors px-3 py-1 rounded-full hover:bg-blue-50">
                                    Xem tất cả <ArrowRight size={16}/>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {upcomingMatches.map((match) => (
                                    <MatchCard key={match.id} match={match} isHot={false} />
                                ))}
                            </div>
                        </div>
                    )}

                    {matches.length === 0 && !isLoading && (
                        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
                            <p className="text-gray-400 text-lg font-medium">Hiện chưa có trận đấu nào được mở bán.</p>
                        </div>
                    )}
                </>
            )}
          </div>
      </div>
      
      <div className="bg-white py-16 border-t border-gray-200">
         <div className="container mx-auto px-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                 <div className="p-6 group hover:-translate-y-1 transition-transform">
                     <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">1</div>
                     <h3 className="font-bold text-xl mb-2">Chọn vé nhanh chóng</h3>
                     <p className="text-gray-500 text-sm">Giao diện trực quan, chọn ghế trên sơ đồ thực tế.</p>
                 </div>
                 <div className="p-6 group hover:-translate-y-1 transition-transform">
                     <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold group-hover:bg-yellow-500 group-hover:text-white transition-colors shadow-sm">2</div>
                     <h3 className="font-bold text-xl mb-2">Thanh toán an toàn</h3>
                     <p className="text-gray-500 text-sm">Đa dạng phương thức: VNPAY, MoMo, QR Code.</p>
                 </div>
                 <div className="p-6 group hover:-translate-y-1 transition-transform">
                     <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold group-hover:bg-red-600 group-hover:text-white transition-colors shadow-sm">3</div>
                     <h3 className="font-bold text-xl mb-2">Nhận vé tức thì</h3>
                     <p className="text-gray-500 text-sm">Vé điện tử gửi qua Email, check-in vào sân trong 1 giây.</p>
                 </div>
             </div>
         </div>
      </div>
    </UserLayout>
  );
}

// components match_card
function MatchCard({ match, isHot }) {
    const formatDate = (isoString) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleString('vi-VN', {
          weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <Link 
            to={`/matches/${match.id}`} 
            className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full hover:-translate-y-1" >
            <div className="relative h-40 bg-gray-900 overflow-hidden">
                <img 
                    src={match.banner_url || match.home_logo || "https://via.placeholder.com/400x200"} alt="Match Banner" 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                
                <div className="absolute top-2 right-2">
                    {isHot ? (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md animate-pulse flex items-center gap-1"><Flame size={10} className="fill-current"/> HOT</span>
                    ) : (
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md">
                            {match.status === 'SELLING' ? 'ĐANG BÁN' : 'SẮP ĐÁ'}
                        </span>
                    )}
                </div>
                <div className="absolute bottom-0 left-0 w-full p-3 flex justify-between items-end">
                    <div className="flex flex-col items-center w-1/3">
                        <img src={match.home_logo} className="w-10 h-10 object-contain drop-shadow-md bg-white/10 rounded-full p-1 backdrop-blur-md" alt="Home"/>
                    </div>
                    <div className="text-white/80 font-black text-lg italic pb-1">VS</div>
                    <div className="flex flex-col items-center w-1/3">
                        <img src={match.away_logo} className="w-10 h-10 object-contain drop-shadow-md bg-white/10 rounded-full p-1 backdrop-blur-md" alt="Away"/>
                    </div>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <div className="text-center mb-3">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors uppercase">
                        {match.home_team}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-bold block my-0.5">CHẠM TRÁN</span>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1 group-hover:text-red-600 transition-colors uppercase">
                        {match.away_team}
                    </h3>
                </div>

                <div className="mt-auto space-y-1.5 border-t border-dashed border-gray-100 pt-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <Calendar size={12} className="text-blue-500"/> 
                        <span>{formatDate(match.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <MapPin size={12} className="text-red-500"/> 
                        <span className="truncate">{match.stadium_name}</span>
                    </div>
                </div>

                <button className="w-full mt-3 py-2.5 bg-gray-50 text-gray-700 font-bold text-xs rounded-lg uppercase tracking-wider group-hover:bg-gray-900 group-hover:text-white transition-colors shadow-sm flex items-center justify-center gap-2">
                    <Ticket size={14}/> Mua vé ngay
                </button>
            </div>
        </Link>
    );
}