// src/pages/home/HomePage.jsx
import React, { useState, useEffect } from "react";
import { Ticket, TrendingUp, Trophy, Star } from "lucide-react";
import UserLayout from "../../components/UserLayout.jsx";

// Dữ liệu trận đấu mới — sử dụng hình ảnh
const hotMatches = [
  {
    id: 1,
    img: "https://placehold.co/500x300/1A3A6B/FFF?text=MU+vs+Liverpool",
  },
  {
    id: 2,
    img: "https://placehold.co/500x300/7B1E20/FFF?text=Real+Madrid+vs+Barca",
  },
  {
    id: 3,
    img: "https://placehold.co/500x300/004477/FFF?text=Bayern+vs+Dortmund",
  },
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

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <UserLayout>
      <div className="bg-gray-50">

        {/* ====================== 1. BANNER ====================== */}
        <section className="relative h-[420px] w-full overflow-hidden">
          {images.map((img, i) => (
            <div
              key={i}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
                index === i ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url(${img})` }}
            ></div>
          ))}

          <div className="absolute inset-0 bg-black/60"></div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Săn vé trận cầu đỉnh cao – Nhanh chóng & An toàn
            </h1>

            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-6">
              Cập nhật lịch thi đấu – đặt vé ngay trong vài giây.
            </p>

            <div className="flex gap-4">
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                Xem Review
              </button>

              <button className="bg-white hover:bg-gray-200 text-black px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                Xem Đánh Giá
              </button>
            </div>
          </div>
        </section>

        {/* ====================== 2. TRẬN ĐẤU HOT – mới ====================== */}
        <section className="container mx-auto p-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <TrendingUp size={28} className="text-red-500" /> Trận đấu HOT
            </h2>

            <a
              href="/matches"
              className="text-blue-600 hover:text-red-600 font-medium transition-colors"
            >
              Xem tất cả →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {hotMatches.map((m) => (
              <div
                key={m.id}
                className="rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform bg-white"
              >
                <img src={m.img} className="w-full h-56 object-cover" />

                <div className="p-4 text-center">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold flex items-center justify-center gap-2 mx-auto">
                    <Ticket size={18} /> Mua ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================== 3. MUA THEO GIẢI ĐẤU ====================== */}
        <section className="bg-gray-100 py-16">
          <div className="container mx-auto p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12 flex items-center justify-center gap-3">
              <Trophy size={28} className="text-yellow-600" /> Mua vé theo Giải
              đấu
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {leagueData.map((league, index) => (
                <a
                  key={index}
                  href={`/leagues/${league.name
                    .toLowerCase()
                    .replace(" ", "-")}`}
                  className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all border-t-4 border-red-500"
                >
                  <Trophy size={40} className={league.color} />
                  <span className="mt-3 text-lg font-semibold">
                    {league.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ====================== 4. TIN TỨC ====================== */}
        <section className="container mx-auto px-8 py-16">
          <h2 className="text-3xl font-bold mb-8">📰 Tin tức bóng đá</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow hover:shadow-xl transition"
              >
                <img
                  src={`https://placehold.co/400x250/0A2450/FFF?text=News+${i}`}
                  className="w-full h-48 object-cover"
                />

                <div className="p-5">
                  <h3 className="text-lg font-bold">Tin tức {i}</h3>
                  <p className="text-gray-600 mt-2 text-sm">
                    Cập nhật nhanh & chính xác các sự kiện bóng đá mới nhất.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================== 5. REVIEW KHÁCH HÀNG ====================== */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-8 text-center">
            <h2 className="text-3xl font-bold mb-10">
              ⭐ Khách hàng nói gì về chúng tôi
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((id) => (
                <div
                  key={id}
                  className="p-6 rounded-xl border shadow hover:shadow-lg transition bg-gray-50"
                >
                  <div className="flex justify-center mb-3">
                    <Star size={22} className="text-yellow-500" />
                    <Star size={22} className="text-yellow-500" />
                    <Star size={22} className="text-yellow-500" />
                    <Star size={22} className="text-yellow-500" />
                    <Star size={22} className="text-yellow-500" />
                  </div>

                  <p className="text-gray-700 italic">
                    “Mua vé nhanh, uy tín, nhận vé đúng giờ. Sẽ ủng hộ dài lâu!”
                  </p>

                  <p className="mt-3 font-semibold">Khách hàng #{id}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================== 6. CTA EMAIL ====================== */}
        <section className="container mx-auto p-8 py-16 text-center">
          <div className="bg-blue-300 text-gray-800 p-12 rounded-2xl shadow-2xl">
            <h2 className="text-4xl font-extrabold mb-3">
              Bạn không tìm thấy trận đấu?
            </h2>
            <p className="text-lg mb-6 opacity-80">
              Nhập email để nhận thông báo sớm nhất!
            </p>

            <div className="flex justify-center">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="py-3 px-5 text-gray-900 rounded-l-full w-full max-w-sm focus:outline-none"
              />
              <button className="bg-red-500 text-black px-6 py-3 rounded-r-full font-bold hover:bg-red-600 transition-colors">
                Đăng ký
              </button>
            </div>
          </div>
        </section>
      </div>
    </UserLayout>
  );
}
