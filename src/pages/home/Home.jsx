import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { Calendar, MapPin, ArrowRight, Loader2 } from "lucide-react";

// API URL
const API_URL = "http://localhost:5000/api/matches";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        // Lọc chỉ lấy các trận Sắp tới hoặc Đang bán
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

  return (
    <UserLayout>
      {/* Banner */}
      <div className="relative bg-gray-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522778119026-d647f0565c77?q=80&w=1920')] bg-cover bg-center opacity-40"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Săn Vé Bóng Đá <span className="text-blue-500">Đỉnh Cao</span></h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Đặt vé trực tuyến dễ dàng, an toàn và nhanh chóng cho các giải đấu hàng đầu Việt Nam.</p>
            <button onClick={() => document.getElementById('match-list').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-bold text-lg transition shadow-lg shadow-blue-500/30">Đặt vé ngay</button>
        </div>
      </div>

      {/* Danh sách trận đấu */}
      <div id="match-list" className="container mx-auto px-6 py-16">
        <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Trận đấu sắp diễn ra</h2>
                <p className="text-gray-500 mt-1">Đừng bỏ lỡ những khoảnh khắc sôi động nhất</p>
            </div>
            <Link to="/matches" className="text-blue-600 font-semibold hover:underline flex items-center gap-1">Xem tất cả <ArrowRight size={18}/></Link>
        </div>

        {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40}/></div>
        ) : matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {matches.map((match) => (
                    <div key={match.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                        {/* Header Trận đấu */}
                        <div className="p-6 flex justify-between items-center bg-gray-50/50">
                            <div className="flex flex-col items-center w-1/3">
                                <img src={match.home_logo || "https://via.placeholder.com/60"} alt={match.home_team} className="w-16 h-16 object-contain mb-2 drop-shadow-sm group-hover:scale-110 transition-transform"/>
                                <span className="font-bold text-gray-800 text-center text-sm line-clamp-1">{match.home_team}</span>
                            </div>
                            <div className="w-1/3 text-center">
                                <div className="text-2xl font-black text-gray-300">VS</div>
                                <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block mt-2">{formatDate(match.start_time)}</div>
                            </div>
                            <div className="flex flex-col items-center w-1/3">
                                <img src={match.away_logo || "https://via.placeholder.com/60"} alt={match.away_team} className="w-16 h-16 object-contain mb-2 drop-shadow-sm group-hover:scale-110 transition-transform"/>
                                <span className="font-bold text-gray-800 text-center text-sm line-clamp-1">{match.away_team}</span>
                            </div>
                        </div>

                        {/* Thông tin & Nút */}
                        <div className="p-6 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 mb-4 text-sm">
                                <MapPin size={16} className="text-blue-500"/>
                                <span className="truncate">{match.stadium_name}</span>
                            </div>
                            
                            <Link to={`/matches/${match.id}`} className="block w-full py-3 text-center bg-gray-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors">
                                Mua vé ngay
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-lg">Hiện chưa có trận đấu nào mở bán.</p>
            </div>
        )}
      </div>
    </UserLayout>
  );
}