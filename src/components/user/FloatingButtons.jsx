import React, { useState, useEffect } from "react";
import { Phone, ArrowUp, X, Mail } from "lucide-react";

export default function FloatingButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  // hiển thị nút back to top khi cuộn
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-24 right-6 z-40 flex flex-col items-center gap-4 font-sans pointer-events-none">
      <div className="flex flex-col gap-4 pointer-events-auto items-end">

        {/* nút back tt */}
        {showScrollTop && (
            <button 
              onClick={scrollToTop}className="w-10 h-10 bg-white text-gray-500 hover:text-blue-600 shadow-md border border-gray-200 rounded-full flex items-center justify-center transition-all hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" 
              title="Lên đầu trang">
              <ArrowUp size={20} strokeWidth={2.5} />
            </button>
        )}

        {/* menu liên hệ mở rộng*/}
        {isMenuOpen && (
            <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-2 fade-in duration-200 items-end mb-1">
                <a href="tel:1900123456" className="flex items-center gap-2 group" >
                    <span className="bg-white text-gray-700 px-3 py-1 rounded-lg shadow-md text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Gọi Hotline</span>
                    <div className="w-10 h-10 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-transform hover:scale-110">
                        <Phone size={18} className="fill-current" />
                    </div>
                </a>

                <a href="mailto:support@footballtic.com" className="flex items-center gap-2 group" >
                    <span className="bg-white text-gray-700 px-3 py-1 rounded-lg shadow-md text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Gửi Email</span>
                    <div className="w-10 h-10 bg-yellow-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-yellow-600 transition-transform hover:scale-110">
                        <Mail size={18} />
                    </div>
                </a>
            </div>
        )}

        {/* nút liên hệ */}
        <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${isMenuOpen ? 'bg-gray-600 text-white' : 'bg-white text-blue-600 border-2 border-blue-50 hover:border-blue-200'}`}
            title="Liên hệ khác">
            {isMenuOpen ? <X size={20}/> : <Phone size={20} className={isMenuOpen ? "" : "fill-current"}/>}
        </button>
      </div>
    </div>
  );
}