import React, { useState } from "react";
import { Search, Clock, User, MessageSquare, ChevronRight, Flame, Tag, Filter, ArrowRight } from "lucide-react";
import UserLayout from "../../layouts/UserLayout.jsx";

// --- 1. DỮ LIỆU GIẢ LẬP (MOCK DATA) ---

// Tin nổi bật (Hero Section)
const featuredNews = [
  {
    id: 1,
    title: "CHÍNH THỨC: Kylian Mbappé gia nhập Real Madrid với bản hợp đồng kỷ lục",
    summary: "Thương vụ tốn nhiều giấy mực nhất lịch sử bóng đá đã đi đến hồi kết. Siêu sao người Pháp sẽ khoác áo Kền Kền Trắng từ mùa giải tới.",
    image: "https://placehold.co/800x500/0F172A/FFF?text=Mbappe+Real+Madrid",
    category: "Chuyển nhượng",
    date: "2 giờ trước",
    author: "Minh Long"
  },
  {
    id: 2,
    title: "Tổng hợp vòng 12 Premier League: Man City sẩy chân, Arsenal lên đỉnh",
    image: "https://placehold.co/400x250/1e3a8a/FFF?text=Premier+League",
    category: "Tổng hợp",
    date: "4 giờ trước",
  },
  {
    id: 3,
    title: "Ronaldo lập hat-trick ở tuổi 39: Huyền thoại không tuổi",
    image: "https://placehold.co/400x250/b91c1c/FFF?text=CR7+Hattrick",
    category: "Siêu sao",
    date: "6 giờ trước",
  }
];

// Danh sách tin tức chính
const latestNews = [
  {
    id: 101,
    title: "Lịch thi đấu C1 tuần này: Đại chiến Bayern vs Barcelona",
    excerpt: "Tâm điểm của lượt trận Champions League tuần này sẽ đổ dồn về Allianz Arena, nơi Hùm xám tiếp đón gã khổng lồ xứ Catalan...",
    image: "https://placehold.co/300x200/333/FFF?text=C1+Match",
    category: "Champions League",
    date: "15/11/2025",
    comments: 45,
    views: "12K"
  },
  {
    id: 102,
    title: "Sao trẻ MU chấn thương nặng, nguy cơ nghỉ hết mùa",
    excerpt: "Tin dữ cho Quỷ đỏ khi tiền vệ trụ cột gặp chấn thương dây chằng trong buổi tập chiều qua. Ten Hag đau đầu tìm người thay thế.",
    image: "https://placehold.co/300x200/7f1d1d/FFF?text=Injury+Update",
    category: "Tin chấn thương",
    date: "14/11/2025",
    comments: 120,
    views: "34K"
  },
  {
    id: 103,
    title: "Vé trận Chung kết Cúp Quốc gia cháy hàng chỉ sau 10 phút mở bán",
    excerpt: "Sức hút của trận derby thủ đô là không thể bàn cãi. Hệ thống bán vé ghi nhận lượng truy cập kỷ lục.",
    image: "https://placehold.co/300x200/166534/FFF?text=Sold+Out",
    category: "Bên lề",
    date: "14/11/2025",
    comments: 8,
    views: "5K"
  },
  {
    id: 104,
    title: "Góc chiến thuật: Tại sao Liverpool đang bay cao với sơ đồ mới?",
    excerpt: "Phân tích chi tiết cách vận hành của The Kop dưới triều đại HLV mới. Sự linh hoạt của hàng tiền vệ là chìa khóa.",
    image: "https://placehold.co/300x200/991b1b/FFF?text=Tactics",
    category: "Phân tích",
    date: "13/11/2025",
    comments: 67,
    views: "18K"
  },
  {
    id: 105,
    title: "Phỏng vấn độc quyền: Messi nói gì về khả năng trở lại Barca?",
    excerpt: "Trong buổi phỏng vấn mới nhất, El Pulga đã có những chia sẻ đầy cảm xúc về đội bóng cũ và tương lai của mình.",
    image: "https://placehold.co/300x200/1e40af/FFF?text=Messi+Interview",
    category: "Phỏng vấn",
    date: "12/11/2025",
    comments: 230,
    views: "102K"
  },
];

// Tin đọc nhiều (Trending Sidebar)
const trendingNews = [
  { id: 1, title: "Bảng xếp hạng FIFA tháng 11: Việt Nam tăng 2 bậc" },
  { id: 2, title: "Vợ cầu thủ A lộ tin nhắn gây sốc" },
  { id: 3, title: "Kết quả bốc thăm vòng 1/8 Europa League" },
  { id: 4, title: "Top 10 cầu thủ chạy nhanh nhất thế giới hiện tại" },
];

const categories = [
  { name: "Premier League", count: 142 },
  { name: "La Liga", count: 98 },
  { name: "Chuyển nhượng", count: 256 },
  { name: "Bên lề sân cỏ", count: 45 },
  { name: "Phân tích - Nhận định", count: 72 },
];

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <UserLayout>
      <div className="bg-gray-50 min-h-screen pb-16">
        
        {/* ================= HEADER CỦA TRANG TIN ================= */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-sm uppercase tracking-wide">News</span>
                        Thế giới bóng đá
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Cập nhật 24/7 các tin tức nóng hổi nhất</p>
                </div>

                {/* Search Box */}
                <div className="relative w-full md:w-96">
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm tin tức, cầu thủ..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 border rounded-full transition-all outline-none"
                    />
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>
        </div>

        <div className="container mx-auto px-6 py-8">
            
            {/* ================= 1. HERO SECTION (Tin nổi bật) ================= */}
            <section className="mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tin lớn bên trái */}
                    <div className="group relative h-96 md:h-[500px] rounded-2xl overflow-hidden cursor-pointer shadow-lg">
                        <img src={featuredNews[0].image} alt="Main News" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
                        <div className="absolute bottom-0 left-0 p-6 md:p-8">
                            <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                                {featuredNews[0].category}
                            </span>
                            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight group-hover:text-blue-200 transition-colors">
                                {featuredNews[0].title}
                            </h2>
                            <p className="text-gray-200 line-clamp-2 mb-4 text-sm md:text-base opacity-90">
                                {featuredNews[0].summary}
                            </p>
                            <div className="flex items-center gap-4 text-gray-300 text-xs md:text-sm">
                                <span className="flex items-center gap-1"><Clock size={14}/> {featuredNews[0].date}</span>
                                <span className="flex items-center gap-1"><User size={14}/> {featuredNews[0].author}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2 Tin nhỏ bên phải */}
                    <div className="flex flex-col gap-6">
                        {featuredNews.slice(1).map((news) => (
                            <div key={news.id} className="group relative h-48 md:h-[238px] rounded-2xl overflow-hidden cursor-pointer shadow-md">
                                <img src={news.image} alt="Sub News" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                                <div className="absolute bottom-0 left-0 p-5">
                                    <span className="inline-block bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded mb-2">
                                        {news.category}
                                    </span>
                                    <h3 className="text-lg md:text-xl font-bold text-white leading-snug group-hover:underline decoration-2 underline-offset-4">
                                        {news.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-gray-300 text-xs mt-2">
                                        <span className="flex items-center gap-1"><Clock size={12}/> {news.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= 2. MAIN CONTENT & SIDEBAR ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* --- Cột Trái: Danh sách tin tức --- */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">Tin mới nhất</h3>
                        <div className="flex gap-2">
                            <button className="p-2 bg-white rounded-lg shadow text-gray-500 hover:text-blue-600"><Filter size={18}/></button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {latestNews.map((item) => (
                            <article key={item.id} className="group flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 h-full sm:h-48">
                                <div className="sm:w-1/3 overflow-hidden relative">
                                    <img src={item.image} alt={item.title} className="w-full h-48 sm:h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                        {item.category}
                                    </div>
                                </div>
                                <div className="p-5 sm:w-2/3 flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                                            {item.title}
                                        </h4>
                                        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                                            {item.excerpt}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1"><Clock size={14}/> {item.date}</span>
                                            <span className="flex items-center gap-1"><MessageSquare size={14}/> {item.comments}</span>
                                        </div>
                                        <span className="flex items-center gap-1 text-blue-500 font-medium cursor-pointer group-hover:translate-x-1 transition-transform">
                                            Đọc tiếp <ArrowRight size={14}/>
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-10 flex justify-center">
                        <button className="px-6 py-2 border rounded-full hover:bg-gray-100 text-gray-600 font-medium transition">
                            Xem thêm tin cũ hơn
                        </button>
                    </div>
                </div>

                {/* --- Cột Phải: Sidebar --- */}
                <aside className="space-y-8">
                    
                    {/* Widget 1: Trending */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                            <Flame size={20} className="text-red-500 fill-red-500"/> Đọc nhiều nhất
                        </h4>
                        <ul className="space-y-4">
                            {trendingNews.map((item, idx) => (
                                <li key={item.id} className="flex gap-3 group cursor-pointer">
                                    <span className={`text-3xl font-black opacity-20 group-hover:text-red-500 group-hover:opacity-100 transition-all w-8 ${idx === 0 ? 'text-red-500 opacity-80' : 'text-gray-300'}`}>
                                        0{idx + 1}
                                    </span>
                                    <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors leading-relaxed pt-1">
                                        {item.title}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Widget 2: Categories */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                            <Tag size={20} className="text-blue-500"/> Chủ đề HOT
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat, idx) => (
                                <span 
                                    key={idx} 
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-transparent rounded-lg text-sm text-gray-600 transition-all cursor-pointer flex items-center gap-2"
                                >
                                    {cat.name}
                                    <span className="bg-white text-[10px] px-1.5 rounded-full text-gray-400 border shadow-sm">{cat.count}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Widget 3: Newsletter (Mini) */}
                    <div className="bg-gradient-to-br from-blue-900 to-indigo-800 p-6 rounded-xl text-white text-center">
                        <h4 className="font-bold text-lg mb-2">Nhận tin VIP</h4>
                        <p className="text-xs text-blue-200 mb-4">Đừng bỏ lỡ các tin tức chuyển nhượng quan trọng.</p>
                        <input type="email" placeholder="Email của bạn" className="w-full px-3 py-2 rounded text-white text-sm mb-2 outline-none"/>
                        <button className="w-full bg-red-600 hover:bg-red-700 text-gray-800 py-2 rounded text-sm font-bold transition">Đăng ký ngay</button>
                    </div>

                </aside>
            </div>

        </div>
      </div>
    </UserLayout>
  );
}