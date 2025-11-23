import React from 'react';
import { Facebook, Twitter, Instagram, Mail, MapPin, CreditCard, Ticket, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  
  // Giữ nguyên các icon social/payment như cũ
  const socialIcons = [
    { icon: Facebook, href: "https://facebook.com/footballtic", color: "text-blue-500" },
    { icon: Twitter, href: "https://twitter.com/footballtic", color: "text-blue-400" },
    { icon: Instagram, href: "https://instagram.com/footballtic", color: "text-pink-500" },
  ];
  
  const paymentIcons = [
    { icon: CreditCard, name: "Visa", color: "text-indigo-400" },
    { icon: CreditCard, name: "Mastercard", color: "text-orange-400" },
    { icon: CreditCard, name: "JCB", color: "text-green-400" },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-10 mt-10 shadow-inner">
      <div className="container mx-auto px-6">
        
        {/* Phần chính (4 cột) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-gray-700 pb-10">

          {/* Cột 1: Giới thiệu & Logo (GIỮ NGUYÊN) */}
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-white flex items-center gap-2">
                <Ticket size={32} /> FootballTic
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed pl-4"> 
              Nền tảng bán vé bóng đá hàng đầu, đảm bảo tính xác thực và an toàn tuyệt đối. Cùng chúng tôi tận hưởng những khoảnh khắc tuyệt vời nhất trên sân cỏ.
            </p>
            <div className='space-y-2'>
              <div className='flex items-center space-x-2 text-sm text-gray-300'>
                  <MapPin size={16} className='text-red-500'/>
                  <span>123 Đường Sân Cỏ, Quận Thể Thao, TP. HCM</span>
                </div>
                <div className='flex items-center space-x-2 text-gray-300 text-sm'>
                    <Mail size={16} className='text-red-500'/>
                    <span>support@footballtic.vn</span>
                </div>
                <div className='flex items-center space-x-2 text-gray-300 text-sm'>
                    <Phone size={16} className='text-red-500'/>
                    <span>(+84) 123 456 789</span>
                </div>
            </div> 
          </div>

          {/* Cột 2: Khám phá (ĐÃ SỬA: Bỏ Mock, dùng Link trực tiếp) */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-white pl-12">Khám phá</h4>
            <ul className="space-y-3 pl-12">
                <li><Link to="/matches" className="text-gray-300 hover:text-red-500 transition-colors text-sm">Lịch thi đấu hôm nay</Link></li>
                <li><Link to="/matches" className="text-gray-300 hover:text-red-500 transition-colors text-sm">Giải V-League</Link></li>
                <li><Link to="/matches" className="text-gray-300 hover:text-red-500 transition-colors text-sm">Đội tuyển Quốc gia</Link></li>
                <li><Link to="/news" className="text-gray-300 hover:text-red-500 transition-colors text-sm">Tin tức bóng đá</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-red-500 transition-colors text-sm">Liên hệ hợp tác</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ & Chính sách (ĐÃ SỬA: Trỏ về trang FAQ/Policy) */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-white pl-8">Hỗ trợ & Chính sách</h4>
            <ul className="space-y-3 pl-8">
                <li><Link to="/policy" className="text-gray-300 hover:text-red-500 transition-colors text-sm">Điều khoản sử dụng</Link></li>
                <li><Link to="/policy" className="text-gray-300 hover:text-red-500 transition-colors text-sm">Chính sách bảo mật</Link></li>
                <li><Link to="/policy" className="text-gray-300 hover:text-red-500 transition-colors text-sm">Chính sách hoàn tiền</Link></li>
                <li><Link to="/faq" className="text-gray-300 hover:text-red-500 transition-colors text-sm">Câu hỏi thường gặp (FAQ)</Link></li>
                <li><Link to="/faq" className="text-gray-300 hover:text-red-500 transition-colors text-sm">Hướng dẫn đặt vé</Link></li>
            </ul>
          </div>

          {/* Cột 4: Bản đồ & Thanh toán (GIỮ NGUYÊN) */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-red-400 mb-4 pl-8">Địa điểm & Thanh toán</h4>
            
            <div className='rounded-lg overflow-hidden border border-gray-700'>
                <iframe 
                    title="map-location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.924403826694!2d105.76305631540243!3d21.018202092919714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454a5c7cc92f5%3A0x9b57f83340c32a2e!2sMy%20Dinh%20National%20Stadium!5e0!3m2!1sen!2s!4v1645600000000!5m2!1sen!2s" 
                    width="100%" 
                    height="150" 
                    style={{border:0}} 
                    allowFullScreen="" 
                    loading="lazy">
                </iframe>
            </div>

            <div className="flex justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-400 whitespace-nowrap">Theo dõi:</p>
                    <div className="flex space-x-4">
                        {socialIcons.map((item, index) => (
                            <a key={index} href={item.href} target="_blank" rel="noopener noreferrer" className={`hover:scale-110 transition-transform ${item.color}`}>
                                <item.icon size={24} />
                            </a>
                        ))}
                    </div>
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-400 whitespace-nowrap">Thanh toán:</p>
                    <div className="flex space-x-4">
                        {paymentIcons.map((item, index) => (
                            <div key={index} className={`flex items-center space-x-1 ${item.color}`}>
                                <item.icon size={24} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div> 
        </div>

        {/* Phần bản quyền */}
        <div className="py-2 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} FootballTic. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
}