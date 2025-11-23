// src/pages/home/HomePage.jsx
import React, { useState, useEffect } from "react";
// Thêm X và MessageSquare vào import
import { Ticket, TrendingUp, Trophy, Star, ChevronLeft, ChevronRight, MapPin, Calendar, Clock, ArrowRight, X, MessageSquare } from "lucide-react";
import UserLayout from "../../layouts/UserLayout.jsx";

// 1. Dữ liệu trận đấu HOT (Dạng Card to)
const hotMatches = [
  {
    id: 1,
    title: "MU vs Liverpool",
    time: "20:00 - 15/11/2025",
    stadium: "Old Trafford",
    img: "https://placehold.co/500x400/1A3A6B/FFF?text=MU+vs+Liverpool",
  },
  {
    id: 2,
    title: "Real Madrid vs Barca",
    time: "02:00 - 16/11/2025",
    stadium: "Santiago Bernabéu",
    img: "https://placehold.co/500x400/7B1E20/FFF?text=El+Clasico",
  },
  {
    id: 3,
    title: "Bayern vs Dortmund",
    time: "23:30 - 17/11/2025",
    stadium: "Allianz Arena",
    img: "https://placehold.co/500x400/004477/FFF?text=Der+Klassiker",
  },
];

// === MỚI: Dữ liệu Lịch thi đấu sắp tới (Dạng List) ===
const upcomingMatches = [
    { id: 1, home: "Arsenal", away: "Chelsea", time: "19:30", date: "18/11", price: "1.500.000đ", league: "Premier League" },
    { id: 2, home: "Man City", away: "Tottenham", time: "21:00", date: "18/11", price: "1.200.000đ", league: "Premier League" },
    { id: 3, home: "Juventus", away: "AC Milan", time: "01:45", date: "19/11", price: "900.000đ", league: "Serie A" },
    { id: 4, home: "PSG", away: "Marseille", time: "02:00", date: "19/11", price: "2.100.000đ", league: "Ligue 1" },
    { id: 5, home: "Inter Miami", away: "LA Galaxy", time: "07:00", date: "20/11", price: "3.500.000đ", league: "MLS" },
];

// Dữ liệu Review
const reviewsData = [
    { id: 1, user: "Nguyễn Văn A", comment: "Dịch vụ tuyệt vời, vé nhận ngay tức thì!", rating: 5 },
    { id: 2, user: "Trần Thị B", comment: "Hỗ trợ nhiệt tình, giá vé hợp lý.", rating: 5 },
    { id: 3, user: "Lê Hoàng C", comment: "Giao diện dễ dùng, thanh toán nhanh.", rating: 4 },
    { id: 4, user: "Phạm D", comment: "Sẽ quay lại mua vé cho trận sau.", rating: 5 },
    { id: 5, user: "Hoàng E", comment: "Trải nghiệm tốt, nhưng cần thêm nhiều giải đấu hơn.", rating: 4 },
    { id: 6, user: "Vũ F", comment: "Uy tín, vé check-in mượt mà.", rating: 5 },
];

// Giải đấu
const leagueData = [
  { name: "Premier League", color: "text-indigo-600" },
  { name: "La Liga", color: "text-red-600" },
  { name: "Champions League", color: "text-yellow-600" },
  { name: "Bundesliga", color: "text-gray-600" },
  { name: "Serie A", color: "text-green-600" },
];

export default function HomePage() {
  const images = [
    "https://placehold.co/1920x420/0F204E/FFFFFF?text=Banner+1",
    "https://placehold.co/1920x420/7B1E20/FFFFFF?text=Banner+2",
    "https://placehold.co/1920x420/004477/FFFFFF?text=Banner+3",
  ];
  const [bannerIndex, setBannerIndex] = useState(0);
  const [currentReviewPage, setCurrentReviewPage] = useState(0);
  
  // --- STATE CHO MODAL ĐÁNH GIÁ ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  const reviewsPerPage = 3;
  const totalReviewPages = Math.ceil(reviewsData.length / reviewsPerPage);
  const visibleReviews = reviewsData.slice(
    currentReviewPage * reviewsPerPage,
    (currentReviewPage + 1) * reviewsPerPage
  );

  const nextReview = () => setCurrentReviewPage((prev) => (prev + 1) % totalReviewPages);
  const prevReview = () => setCurrentReviewPage((prev) => (prev - 1 + totalReviewPages) % totalReviewPages);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <UserLayout>
      <div className="bg-gray-50">
        {/* 1. BANNER */}
        <section className="relative h-[420px] w-full overflow-hidden group">
          {images.map((img, i) => (
            <div
              key={i}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                bannerIndex === i ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url(${img})` }}
            ></div>
          ))}
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <h4 className="text-2xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
              Săn vé trận cầu đỉnh cao
            </h4>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-8 drop-shadow-md">
              Trải nghiệm không khí bóng đá sôi động ngay tại sân vận động.
            </p>
           {/*<button className="bg-red-600 hover:bg-red-700 text-gray-800 px-8 py-3 rounded-full font-bold text-lg shadow-lg transition transform hover:scale-105">
                Đặt vé ngay
            </button>*/}
          </div>
        </section>

        {/* 2. TRẬN ĐẤU HOT */}
        <section className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <TrendingUp size={32} className="text-red-600" /> Trận đấu HOT
            </h2>
            <a href="/matches" className="text-blue-600 hover:text-red-600 font-medium transition flex items-center gap-1">
              Xem tất cả <ChevronRight size={20}/>
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {hotMatches.map((m) => (
              <div key={m.id} className="group relative h-80 rounded-2xl overflow-hidden shadow-xl cursor-pointer">
                <img src={m.img} alt={m.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to from-black via-black/40 to-transparent opacity-90"></div>
                <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2 leading-tight">{m.title}</h3>
                  <div className="flex flex-col gap-1 text-gray-300 text-sm mb-4">
                    <span className="flex items-center gap-2"><Calendar size={16}/> {m.time}</span>
                    <span className="flex items-center gap-2"><MapPin size={16}/> {m.stadium}</span>
                  </div>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-gray-800 py-2 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-colors">
                    <Ticket size={18} /> Mua vé
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* === 2.5 LỊCH THI ĐẤU SẮP TỚI === */}
        <section className="bg-white py-12 border-t border-gray-200">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <Calendar size={28} className="text-blue-600" /> Lịch thi đấu sắp tới
                    </h2>
                    <a href="/schedule" className="text-sm text-gray-500 hover:text-blue-600">Xem lịch tháng này →</a>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {upcomingMatches.map((match, idx) => (
                        <div 
                            key={match.id} 
                            className={`flex flex-col md:flex-row items-center justify-between p-5 hover:bg-blue-50 transition-colors ${idx !== upcomingMatches.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                            {/* Thời gian & Giải đấu */}
                            <div className="flex items-center gap-4 w-full md:w-1/4 mb-3 md:mb-0">
                                <div className="bg-gray-100 p-2 rounded-lg text-center min-w-[60px]">
                                    <p className="font-bold text-gray-800">{match.date}</p>
                                    <p className="text-xs text-gray-500">{match.time}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                        {match.league}
                                    </span>
                                </div>
                            </div>

                            {/* Cặp đấu */}
                            <div className="flex-1 flex items-center justify-center md:justify-start gap-4 w-full mb-3 md:mb-0">
                                <span className="font-bold text-lg text-gray-800 text-right w-1/3 md:w-auto">{match.home}</span>
                                <span className="text-gray-400 font-medium text-sm px-2">VS</span>
                                <span className="font-bold text-lg text-gray-800 text-left w-1/3 md:w-auto">{match.away}</span>
                            </div>

                            {/* Giá vé & Button */}
                            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-1/3">
                                <div className="text-right hidden md:block">
                                    <p className="text-xs text-gray-500">Giá từ</p>
                                    <p className="font-bold text-red-600">{match.price}</p>
                                </div>
                                <button className="flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg font-medium transition-all text-sm w-full md:w-auto justify-center">
                                    Chi tiết <ArrowRight size={16}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Nút xem thêm ở dưới list */}
                <div className="text-center mt-6">
                    <button className="text-gray-700 font-medium hover:text-black hover:underline transition-all">
                        Xem thêm 12 trận khác...
                    </button>
                </div>
            </div>
        </section>

        {/* 3. MUA THEO GIẢI ĐẤU */}
        <section className="bg-gray-50 py-16">
           <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12 flex items-center justify-center gap-3">
              <Trophy size={32} className="text-yellow-500" /> Giải Đấu Hàng Đầu
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {leagueData.map((league, index) => (
                <a key={index} href="#" className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-gray-100">
                  <Trophy size={40} className={`${league.color} mb-3`} />
                  <span className="text-base font-bold text-gray-700">{league.name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 4. TIN TỨC */}
        <section className="container mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">📰 Tin tức bóng đá</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <article key={i} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100">
                <img src={`https://placehold.co/400x250/0A2450/FFF?text=News+${i}`} className="w-full h-48 object-cover" alt="News"/>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">Cập nhật tình hình chuyển nhượng mùa giải mới {i}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">Thông tin nóng hổi về thị trường chuyển nhượng...</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 5. REVIEW KHÁCH HÀNG (Đã thêm nút mở Modal) */}
        <section className="bg-blue-50 py-16 relative">
          <div className="container mx-auto px-6">
            
            {/* Header của phần Review: Tên + Nút viết đánh giá */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-10">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    ⭐ Khách hàng nói gì?
                </h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 md:mt-0 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold border border-blue-200 px-5 py-2 rounded-full bg-white shadow-sm hover:shadow-md transition-all group"
                >
                    <MessageSquare size={18} className="group-hover:scale-110 transition-transform"/> 
                    Viết đánh giá
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {visibleReviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col h-full">
                    <div className="flex text-yellow-400 mb-3">
                        {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < review.rating ? "fill-current" : "text-gray-300"} />)}
                    </div>
                    <p className="text-gray-700 italic mb-4 line-clamp-3 flex-2">“{review.comment}”</p>
                    <div className="font-bold text-sm text-gray-900">{review.user}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4">
                <button onClick={prevReview} className="p-2 rounded-full bg-white shadow text-gray-600 hover:text-blue-600 transition"><ChevronLeft/></button>
                <button onClick={nextReview} className="p-2 rounded-full bg-white shadow text-gray-600 hover:text-blue-600 transition"><ChevronRight/></button>
            </div>
          </div>
        </section>

        {/* 6. CTA EMAIL */}
        <section className="container mx-auto px-6 py-20">
          <div 
            className="relative text-white p-10 md:p-16 rounded-3xl text-center shadow-2xl overflow-hidden"
            style={{ 
                backgroundImage: "url('https://placehold.co/1200x400/0f172a/FFFFFF?text=Fan+Crowd+Image')", 
                backgroundSize: 'cover', 
                backgroundPosition: 'center' 
            }}
          >
            <div className="absolute inset-0 bg-black/60"></div>
            
            <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Nhận thông báo vé VIP</h2>
                <p className="mb-8 text-gray-200 text-lg">Đừng bỏ lỡ những trận cầu đinh. Đăng ký ngay để nhận ưu đãi!</p>
                
                <div className="bg-white rounded-full flex items-center justify-between max-w-lg mx-auto shadow-lg overflow-hidden">
                  <input 
                    type="email" 
                    placeholder="Nhập email của bạn..." 
                    className="w-full bg-transparent text-gray-900 placeholder-gray-500 px-6 py-4 text-base outline-none" 
                  />
                  <button className="bg-red-600 text-black px-8 py-4 font-bold hover:bg-red-700 transition-colors whitespace-nowrap">
                    Gửi đi
                  </button>
                </div>
            </div>

          </div>
        </section>

        {/* ====================== MODAL FORM ĐÁNH GIÁ (Mới) ====================== */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                    {/* Header Modal */}
                    <div className="flex justify-between items-center p-5 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                             <MessageSquare size={20} className="text-blue-600"/> Gửi đánh giá
                        </h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors bg-gray-100 p-2 rounded-full hover:bg-red-50">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body Modal (Form) */}
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                            <input type="text" placeholder="Nhập tên của bạn" className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Không công khai)</label>
                            <input type="email" placeholder="email@example.com" className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đánh giá trải nghiệm</label>
                            <div className="flex gap-2 text-gray-300 cursor-pointer">
                                {[1,2,3,4,5].map((star) => (
                                    <Star key={star} size={32} className="hover:text-yellow-400 hover:fill-yellow-400 transition-colors" />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                            <textarea rows="3" placeholder="Chia sẻ cảm nhận của bạn về dịch vụ..." className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"></textarea>
                        </div>
                    </div>

                    {/* Footer Modal */}
                    <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition"
                        >
                            Hủy
                        </button>
                        <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition transform active:scale-95">
                            Gửi ngay
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </UserLayout>
  );
}