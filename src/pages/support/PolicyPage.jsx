import React, { useState } from "react";
import { Shield, FileText, CreditCard, AlertCircle } from "lucide-react";
import UserLayout from "../../layouts/UserLayout.jsx";

export default function PolicyPage() {
  const [activeTab, setActiveTab] = useState("terms"); // 'terms' | 'privacy' | 'payment'

  const renderContent = () => {
    switch (activeTab) {
        case "terms":
            return (
                <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-xl font-bold text-gray-900">1. Giới thiệu chung</h3>
                    <p>Chào mừng bạn đến với FootballTic. Khi truy cập và sử dụng website này, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây. Chúng tôi có quyền thay đổi, chỉnh sửa các quy định này bất cứ lúc nào mà không cần báo trước.</p>
                    
                    <h3 className="text-xl font-bold text-gray-900">2. Quy định đặt vé</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Khách hàng phải cung cấp thông tin chính xác (Họ tên, SĐT, Email) khi đặt vé. Chúng tôi không chịu trách nhiệm nếu vé không gửi được do sai thông tin.</li>
                        <li>Mỗi tài khoản chỉ được đặt số lượng vé giới hạn theo quy định của từng trận đấu.</li>
                        <li>Vé đã mua có giá trị sử dụng 01 lần duy nhất để vào cửa.</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900">3. Trách nhiệm người dùng</h3>
                    <p>Người dùng cam kết không sử dụng hệ thống để thực hiện các hành vi gian lận, tấn công mạng hoặc mua đi bán lại vé với giá cao hơn quy định (phe vé).</p>
                </div>
            );
        case "privacy":
            return (
                <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-xl font-bold text-gray-900">1. Thu thập thông tin</h3>
                    <p>Chúng tôi chỉ thu thập các thông tin cần thiết để xử lý đơn hàng bao gồm: Họ tên, Số điện thoại, Email và Địa chỉ nhận vé (nếu có).</p>
                    
                    <h3 className="text-xl font-bold text-gray-900">2. Sử dụng thông tin</h3>
                    <p>Thông tin cá nhân của bạn được sử dụng để:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Gửi mã vé điện tử và xác nhận thanh toán.</li>
                        <li>Liên hệ hỗ trợ khi có sự cố về trận đấu (hoãn, hủy).</li>
                        <li>Gửi thông tin khuyến mãi (nếu bạn đăng ký nhận tin).</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900">3. Cam kết bảo mật</h3>
                    <p>FootballTic cam kết không chia sẻ, bán hoặc tiết lộ thông tin cá nhân của khách hàng cho bên thứ ba, ngoại trừ trường hợp có yêu cầu của cơ quan pháp luật.</p>
                </div>
            );
        case "payment":
            return (
                <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-xl font-bold text-gray-900">1. Phương thức thanh toán</h3>
                    <p>Hiện tại hệ thống chấp nhận các hình thức: Chuyển khoản ngân hàng (VietQR) và Thanh toán khi nhận hàng (COD - Vé cứng).</p>
                    
                    <h3 className="text-xl font-bold text-gray-900">2. Chính sách hoàn tiền</h3>
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 flex gap-3 items-start">
                        <AlertCircle className="flex-shrink-0 mt-1"/>
                        <div>
                            <strong>Lưu ý quan trọng:</strong> Vé đã thanh toán sẽ <u>KHÔNG</u> được hoàn tiền hoặc đổi trả, trừ các trường hợp bất khả kháng như trận đấu bị hủy bỏ bởi Ban tổ chức.
                        </div>
                    </div>
                    <p className="mt-2">Trong trường hợp trận đấu bị hủy, tiền vé sẽ được hoàn lại vào tài khoản ngân hàng của quý khách trong vòng 7-14 ngày làm việc.</p>
                </div>
            );
        default: return null;
    }
  };

  return (
    <UserLayout>
      <div className="bg-gray-50 min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
            
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Điều khoản & Chính sách</h2>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                
                {/* Sidebar Tabs */}
                <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-200 p-4">
                    <div className="space-y-2">
                        <button 
                            onClick={() => setActiveTab("terms")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'terms' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
                        >
                            <FileText size={18}/> Điều khoản sử dụng
                        </button>
                        <button 
                            onClick={() => setActiveTab("privacy")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'privacy' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
                        >
                            <Shield size={18}/> Chính sách bảo mật
                        </button>
                        <button 
                            onClick={() => setActiveTab("payment")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'payment' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
                        >
                            <CreditCard size={18}/> Thanh toán & Hoàn vé
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="w-full md:w-2/3 p-8 text-gray-700 leading-relaxed">
                    {renderContent()}
                </div>

            </div>
        </div>
      </div>
    </UserLayout>
  );
}