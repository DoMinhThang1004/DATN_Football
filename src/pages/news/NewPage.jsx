import React, { useState, useEffect } from "react";
import { Search, Clock, User, MessageSquare, Flame, Tag, Filter, ArrowRight, ExternalLink, Globe, TrendingUp, Loader2 } from "lucide-react";
import UserLayout from "../../layouts/UserLayout.jsx";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_NEWS = `${API_BASE}/api/news`;

export default function NewsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [newsData, setNewsData] = useState([]); 
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(API_NEWS)
            .then(res => {
                if (!res.ok) throw new Error('Không thể tải dữ liệu tin tức');
                return res.json();
            })
            .then(data => {
                setNewsData(data); 
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi fetching news:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    //chia dl
    const featuredNews = newsData[0] || null; 
    const subFeaturedNews = newsData.slice(1, 3); 
    const latestNews = newsData.slice(3); 
    
    const hasNews = newsData.length > 0;
    
    const mockTrending = [
        { id: 1, title: "BXH FIFA tháng 12: Việt Nam trở lại Top 100", link: "#" },
        { id: 2, title: "Lịch thi đấu V-League vòng 8: Đại chiến Hàng Đẫy", link: "#" },
        { id: 3, title: "Kết quả bốc thăm chia bảng SEA Games 33", link: "#" },
    ];

    return (
        <UserLayout>
            <div className="bg-gray-50 min-h-screen pb-16 font-sans">
                <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                    <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Globe size={24} className="text-blue-600"/>
                                Bóng đá 24/7
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Tin tức nóng hổi từ V-League, ASEAN và Thế giới</p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <input 
                                type="text" placeholder="Tìm kiếm tin tức..." 
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 border rounded-full transition-all outline-none text-sm"/>
                            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    {error && <div className="bg-red-100 p-4 text-red-700 rounded-lg">Lỗi tải dữ liệu: {error}</div>}
                    
                    {loading && (
                        <div className="flex justify-center py-20 bg-white rounded-xl shadow-lg">
                             <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    )}
                    
                    {!loading && !hasNews && (
                         <div className="flex justify-center py-20 bg-white rounded-xl shadow-lg">
                             <p className="text-gray-500">Hiện tại chưa có tin tức nào được đăng tải.</p>
                         </div>
                    )}

                    {!loading && hasNews && (
                        <>
                            <section className="mb-12">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {featuredNews && (
                                        <Link to={`/news/${featuredNews.id}`} className="group relative h-96 md:h-[500px] rounded-2xl overflow-hidden cursor-pointer shadow-lg block">
                                            <img src={featuredNews.image_url || 'https://via.placeholder.com/1200x800?text=Featured'} alt="Main News" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90"></div>
                                            <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-yellow-400 transition-colors">
                                                    {featuredNews.title}
                                                </h2>
                                                <p className="text-gray-200 line-clamp-2 mb-4 text-sm md:text-base opacity-90">
                                                    {featuredNews.summary}
                                                </p>
                                                <div className="flex items-center gap-4 text-gray-300 text-xs md:text-sm">
                                                    <span className="flex items-center gap-1"><Clock size={14}/> {formatDate(featuredNews.published_date)}</span>
                                                    <span className="flex items-center gap-1"><User size={14}/> Tác giả: {featuredNews.author_id}</span>
                                                    <span className="flex items-center gap-1 text-yellow-400 ml-auto font-medium">Đọc tiếp <ExternalLink size={12}/></span>
                                                </div>
                                            </div>
                                        </Link>
                                    )}
                                    <div className="flex flex-col gap-6">
                                        {subFeaturedNews.map((news) => (
                                            <Link to={`/news/${news.id}`} key={news.id} className="group relative h-48 md:h-[238px] rounded-2xl overflow-hidden cursor-pointer shadow-md block">
                                                <img src={news.image_url || 'https://via.placeholder.com/800x400?text=Sub+Featured'} alt="Sub News" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                                                <div className="absolute bottom-0 left-0 p-5 w-full">
                                                    <h3 className="text-lg font-bold text-white leading-snug group-hover:underline decoration-2 underline-offset-4">
                                                        {news.title}
                                                    </h3>
                                                    <div className="flex items-center justify-between text-gray-300 text-xs mt-2">
                                                        <span className="flex items-center gap-1"><Clock size={12}/> {formatDate(news.published_date)}</span>
                                                        <ExternalLink size={12}/>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                <div className="lg:col-span-2">
                                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                            <span className="w-1 h-6 bg-red-600 rounded-full"></span> Tin mới nhất
                                        </h3>
                                        <div className="flex gap-2">
                                            <button className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-500 hover:text-blue-600"><Filter size={16}/></button>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {latestNews.map((item) => (
                                            <Link to={`/news/${item.id}`} key={item.id} className="group flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 h-full sm:h-44">
                                                <div className="sm:w-1/3 overflow-hidden relative">
                                                    <img src={item.image_url || 'https://via.placeholder.com/800x400?text=Latest'} alt={item.title} className="w-full h-44 sm:h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                                                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                                                    </div>
                                                </div>
                                                <div className="p-5 sm:w-2/3 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                            {item.title}
                                                        </h4>
                                                        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                                                            {item.summary}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex items-center gap-1"><Clock size={12}/> {formatDate(item.published_date)}</span>
                                                            <span className="flex items-center gap-1"><User size={12}/> Tác giả: {item.author_id}</span>
                                                        </div>
                                                        <span className="flex items-center gap-1 text-blue-500 font-medium group-hover:translate-x-1 transition-transform">
                                                            Chi tiết <ArrowRight size={12}/>
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>

                                    <div className="mt-10 flex justify-center">
                                        <button className="px-6 py-2.5 bg-white border border-gray-300 rounded-full hover:bg-gray-50 text-gray-600 font-medium transition shadow-sm text-sm">
                                            Xem thêm tin cũ hơn
                                        </button>
                                    </div>
                                </div>
                                <aside className="space-y-8">
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:sticky lg:top-24">
                                        <h4 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                                            <TrendingUp size={20} className="text-red-500"/> Xu hướng đọc
                                        </h4>
                                        <ul className="space-y-4">
                                            {mockTrending.map((item, idx) => (
                                                <li key={item.id}>
                                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex gap-3 group">
                                                        <span className={`text-2xl font-black transition-all w-6 text-center ${idx === 0 ? 'text-red-500' : idx === 1 ? 'text-orange-500' : idx === 2 ? 'text-yellow-500' : 'text-gray-300'}`}>
                                                            {idx + 1}
                                                        </span>
                                                        <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors leading-relaxed pt-1">
                                                            {item.title}
                                                        </p>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                        <h4 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                                            <Tag size={20} className="text-blue-500"/> Chủ đề HOT
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {["V-League", "Đội tuyển VN", "AFF Cup", "Chuyển nhượng"].map((cat, idx) => (
                                                <span 
                                                    key={idx} 
                                                    className="px-3 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-lg text-xs font-medium text-gray-600 transition-all cursor-pointer flex items-center gap-2">
                                                    {cat}
                                                    <span className="bg-white text-[9px] px-1.5 rounded-full text-gray-400 border">{idx * 50 + 10}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </UserLayout>
    );
}