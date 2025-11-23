import React, { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  MessageCircle, 
  ArrowLeft, 
  CheckCircle 
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // 1. Import hook này
import UserLayout from "../../layouts/UserLayout.jsx";

export default function FAQPage() {
  const navigate = useNavigate(); // 2. Khởi tạo hook

  // Dữ liệu câu hỏi mẫu
  const faqs = [
    {
      question: "Làm thế nào để tôi nhận được vé sau khi thanh toán?",
      answer: "Sau khi thanh toán thành công, vé điện tử (QR Code) sẽ được gửi ngay lập tức đến địa chỉ Email bạn đã đăng ký. Bạn cũng có thể xem lại vé trong mục 'Hồ sơ > Vé đã mua' trên website."
    },
    {
      question: "Tôi có thể hủy vé hoặc đổi trả không?",
      answer: "Hiện tại, vé đã mua không hỗ trợ hoàn tiền. Tuy nhiên, trong trường hợp trận đấu bị hoãn hoặc hủy do ban tổ chức, chúng tôi sẽ có chính sách hoàn tiền hoặc bảo lưu vé cho trận đấu bù."
    },
    {
      question: "Một tài khoản được mua tối đa bao nhiêu vé?",
      answer: "Để đảm bảo công bằng và tránh tình trạng phe vé, mỗi tài khoản chỉ được mua tối đa 4 vé cho một trận đấu."
    },
    {
      question: "Tôi nhập sai thông tin Email khi mua vé thì phải làm sao?",
      answer: "Đừng lo lắng! Hãy liên hệ ngay với bộ phận CSKH qua Hotline 1900 123 456 hoặc gửi email về support@footballtic.com kèm theo mã đơn hàng để được hỗ trợ thay đổi thông tin."
    },
    {
      question: "Phương thức thanh toán nào được chấp nhận?",
      answer: "Chúng tôi hỗ trợ thanh toán qua Chuyển khoản ngân hàng (VietQR - Quét là xong) và thanh toán khi nhận vé cứng (COD - chỉ áp dụng nội thành Hà Nội)."
    }
  ];

  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  // 3. Hàm xử lý quay lại trang trước
  const handleGoBack = () => {
    navigate(-1); // Quay lại trang trước đó (Trang Thanh toán)
  };

  return (
    <UserLayout>
      <div className="bg-gray-50 min-h-screen py-12 px-4 pb-32"> {/* Thêm pb-32 để nội dung không bị nút che mất */}
        <div className="max-w-3xl mx-auto">
          
          {/* Nút Back nhỏ ở góc trên dành cho ai thích bấm quay lại ngay */}
          <button 
            onClick={handleGoBack}
            className="mb-6 flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Quay lại trang trước
          </button>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <HelpCircle size={32}/>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Câu hỏi thường gặp</h2>
            <p className="text-gray-600">
              Tổng hợp những thắc mắc phổ biến nhất từ khách hàng. <br/>
              Hãy đọc kỹ các quy định về vé và hoàn hủy bên dưới.
            </p>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className={`bg-white rounded-2xl border transition-all duration-300 ${openIndex === index ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-blue-300'}`}>
                <button 
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                >
                    <span className={`font-bold text-lg ${openIndex === index ? 'text-blue-600' : 'text-gray-800'}`}>
                        {faq.question}
                    </span>
                    {openIndex === index ? <ChevronUp className="text-blue-600"/> : <ChevronDown className="text-gray-400"/>}
                </button>
                
                <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    <div className="p-5 pt-0 text-gray-600 border-t border-dashed border-gray-100 mt-2">
                        {faq.answer}
                    </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Support Box */}
          <div className="mt-12 bg-white border border-blue-100 rounded-2xl p-8 text-center shadow-sm">
            <MessageCircle size={40} className="mx-auto mb-4 text-blue-500"/>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Vẫn cần hỗ trợ?</h3>
            <p className="mb-6 text-gray-500">Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn 24/7.</p>
            <button className="text-blue-600 font-bold hover:underline">
                Chat ngay với Admin
            </button>
          </div>

        </div>
      </div>

    </UserLayout>
  );
}