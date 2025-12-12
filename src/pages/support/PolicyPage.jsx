import React, { useState } from "react";
import { Shield, FileText, CreditCard, AlertCircle, ChevronRight, Lock, FileCheck, RefreshCcw } from "lucide-react";
import UserLayout from "../../layouts/UserLayout.jsx";

export default function PolicyPage() {
  const [activeTab, setActiveTab] = useState("terms");

  const renderContent = () => {
    switch (activeTab) {
        case "terms":
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><FileText size={24}/></span>
                            Điều khoản sử dụng
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            Chào mừng bạn đến với FootballTic. Khi truy cập và sử dụng website này, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây. Chúng tôi có quyền thay đổi, chỉnh sửa các quy định này bất cứ lúc nào mà không cần báo trước.
                        </p>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h4 className="text-lg font-bold text-gray-800 mb-3">Quy định đặt vé</h4>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start gap-2">
                                <ChevronRight className="text-blue-500 mt-1 shrink-0" size={16}/>
                                <span>Khách hàng phải cung cấp thông tin chính xác (Họ tên, SĐT, Email) khi đặt vé. Chúng tôi không chịu trách nhiệm nếu vé không gửi được do sai thông tin.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ChevronRight className="text-blue-500 mt-1 shrink-0" size={16}/>
                                <span>Mỗi tài khoản chỉ được đặt số lượng vé giới hạn theo quy định của từng trận đấu để đảm bảo công bằng.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ChevronRight className="text-blue-500 mt-1 shrink-0" size={16}/>
                                <span>Vé đã mua có giá trị sử dụng <strong>01 lần duy nhất</strong> để vào cửa.</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-3">Trách nhiệm người dùng</h4>
                        <p className="text-gray-600 leading-relaxed">
                            Người dùng cam kết không sử dụng hệ thống để thực hiện các hành vi gian lận, tấn công mạng hoặc mua đi bán lại vé với giá cao hơn quy định (phe vé). Mọi hành vi vi phạm sẽ dẫn đến việc khóa tài khoản vĩnh viễn.
                        </p>
                    </div>
                </div>
            );
        case "privacy":
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="bg-green-100 text-green-600 p-2 rounded-lg"><Shield size={24}/></span>
                            Chính sách bảo mật
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            Chúng tôi coi trọng quyền riêng tư của bạn. FootballTic cam kết bảo vệ dữ liệu cá nhân của khách hàng theo các tiêu chuẩn bảo mật cao nhất.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3"><FileCheck size={20}/></div>
                            <h4 className="font-bold text-gray-800 mb-2">Thu thập thông tin</h4>
                            <p className="text-sm text-gray-500">Chúng tôi chỉ thu thập: Họ tên, SĐT, Email và Địa chỉ (nếu có) để xử lý đơn hàng.</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3"><Lock size={20}/></div>
                            <h4 className="font-bold text-gray-800 mb-2">Cam kết bảo mật</h4>
                            <p className="text-sm text-gray-500">Thông tin được mã hóa và không chia sẻ cho bên thứ 3 trừ khi có yêu cầu pháp lý.</p>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h4 className="text-lg font-bold text-gray-800 mb-3">Mục đích sử dụng thông tin</h4>
                        <ul className="space-y-2 text-gray-600">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div> Gửi mã vé điện tử và xác nhận thanh toán.</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div> Liên hệ hỗ trợ khi có sự cố trận đấu.</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div> Gửi thông tin khuyến mãi (nếu đăng ký).</li>
                        </ul>
                    </div>
                </div>
            );
        case "payment":
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="bg-orange-100 text-orange-600 p-2 rounded-lg"><CreditCard size={24}/></span>
                            Thanh toán & Hoàn tiền
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            Quy định chi tiết về các phương thức thanh toán được chấp nhận và chính sách hoàn/hủy vé.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
                            <h4 className="font-bold text-blue-800 mb-2">Thanh toán Online</h4>
                            <p className="text-sm text-gray-600">Hỗ trợ VNPAY, MoMo, Chuyển khoản ngân hàng (VietQR). Vé được gửi ngay lập tức qua Email.</p>
                        </div>
                        <div className="flex-1 bg-white p-5 rounded-xl border border-green-100 shadow-sm">
                            <h4 className="font-bold text-green-800 mb-2">Thanh toán COD</h4>
                            <p className="text-sm text-gray-600">Thanh toán tiền mặt khi nhận vé cứng tại nhà. Chỉ áp dụng cho khu vực nội thành.</p>
                        </div>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 p-5 rounded-xl">
                        <div className="flex items-center gap-2 mb-3 text-red-700">
                            <RefreshCcw size={20}/>
                            <h4 className="font-bold text-lg">Chính sách hoàn tiền</h4>
                        </div>
                        <div className="text-red-800 text-sm leading-relaxed space-y-2 pl-1">
                            <p><strong>1. Vé đã thanh toán:</strong> KHÔNG được hoàn tiền hoặc đổi trả dưới mọi hình thức (trừ lỗi hệ thống).</p>
                            <p><strong>2. Trận đấu bị hủy/hoãn:</strong> Nếu BTC hủy trận đấu, tiền vé sẽ được hoàn lại 100% vào tài khoản ngân hàng của quý khách trong vòng 7-14 ngày làm việc.</p>
                            <p><strong>3. Lỗi thanh toán:</strong> Nếu bị trừ tiền nhưng không nhận được vé, vui lòng liên hệ ngay với bộ phận hỗ trợ để được giải quyết trong 24h.</p>
                        </div>
                    </div>
                </div>
            );
        default: return null;
    }
  };

  return (
    <UserLayout>
      <div className="bg-gray-50 min-h-screen pb-20 font-sans">
        <div className="relative bg-gray-900 h-64 md:h-80 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2000')] bg-cover bg-center opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90"></div>
            <div className="relative z-10 text-center px-4 max-w-3xl">
                <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
                    Trung tâm Chính sách
                </h1>
                <p className="text-gray-300 text-lg font-light">
                    Minh bạch, rõ ràng và bảo vệ quyền lợi của bạn là ưu tiên hàng đầu của chúng tôi.
                </p>
            </div>
        </div>
        <div className="container mx-auto px-4 -mt-12 relative z-20">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                <div className="w-full md:w-1/4 bg-gray-50/50 border-r border-gray-200 p-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Danh mục</h4>
                    <nav className="space-y-2">
                        <button 
                            onClick={() => setActiveTab("terms")}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all font-medium text-sm group ${activeTab === 'terms' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm'}`}>
                            <div className="flex items-center gap-3">
                                <FileText size={18} className={activeTab === 'terms' ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}/>
                                Điều khoản sử dụng
                            </div>
                            {activeTab === 'terms' && <ChevronRight size={16}/>}
                        </button>

                        <button 
                            onClick={() => setActiveTab("privacy")}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all font-medium text-sm group ${activeTab === 'privacy' ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'text-gray-600 hover:bg-white hover:text-green-600 hover:shadow-sm'}`}>
                            <div className="flex items-center gap-3">
                                <Shield size={18} className={activeTab === 'privacy' ? 'text-white' : 'text-gray-400 group-hover:text-green-500'}/>
                                Chính sách bảo mật
                            </div>
                            {activeTab === 'privacy' && <ChevronRight size={16}/>}
                        </button>

                        <button 
                            onClick={() => setActiveTab("payment")}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all font-medium text-sm group ${activeTab === 'payment' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-gray-600 hover:bg-white hover:text-orange-500 hover:shadow-sm'}`}>
                            <div className="flex items-center gap-3">
                                <CreditCard size={18} className={activeTab === 'payment' ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'}/>
                                Thanh toán & Hoàn vé
                            </div>
                            {activeTab === 'payment' && <ChevronRight size={16}/>}
                        </button>
                    </nav>
                    <div className="mt-10 bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 text-blue-600 shadow-sm"><AlertCircle size={20}/></div>
                        <p className="text-xs text-gray-600 mb-2">Bạn có thắc mắc khác?</p>
                        <a href="mailto:support@footballtic.com" className="text-blue-600 text-xs font-bold hover:underline">Liên hệ ngay</a>
                    </div>
                </div>
                <div className="w-full md:w-3/4 p-8 md:p-12 bg-white">
                    {renderContent()}
                </div>

            </div>
        </div>
      </div>
    </UserLayout>
  );
}