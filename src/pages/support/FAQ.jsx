import React, { useState, useEffect } from "react";
import { 
    ChevronDown, HelpCircle, MessageCircle, ArrowLeft,
    Phone,
    Mail,
    Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import UserLayout from "../../layouts/UserLayout.jsx";

const API_FAQ = "http://localhost:5000/api/faqs"; 

const formatAnswer = (text) => {
    if (!text) return null;
    const htmlContent = text.replace(/\\n/g, '<br/>'); 
    
    return (
        <div 
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
    );
};


export default function FAQPage() {
    const navigate = useNavigate();

    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openIndex, setOpenIndex] = useState(-1); 

    //gọi api lấy dl
    useEffect(() => {
        fetch(API_FAQ)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch FAQs');
                return res.json();
            })
            .then(data => {
                setFaqs(data);
                setLoading(false);
                if (data.length > 0) {
                    setOpenIndex(0); 
                }
            })
            .catch(err => {
                console.error("Lỗi khi tải câu hỏi thường gặp:", err);
                setLoading(false);
            });
    }, []); 

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    const handleGoBack = () => {
        navigate(-1); 
    };

    return (
        <UserLayout>
            <div className="bg-gray-50 min-h-screen pb-20 font-sans">
                <div className="relative bg-blue-900 text-white py-12 md:py-16 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500 rounded-full blur-3xl"></div>
                    </div>
                    <div className="container mx-auto px-4 relative z-10">
                        <button 
                            onClick={handleGoBack}
                            className="flex items-center text-blue-200 hover:text-white transition-colors font-medium mb-8 group">
                            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            Quay lại
                        </button>

                        <div className="text-center max-w-2xl mx-auto">
                            <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 border border-white/10 shadow-lg">
                                <HelpCircle size={32} className="text-yellow-400"/>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Trung tâm trợ giúp</h1>
                            <p className="text-lg text-blue-100 font-light">
                                Tìm kiếm câu trả lời nhanh chóng hoặc liên hệ trực tiếp với đội ngũ hỗ trợ.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-10 relative z-20">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2">
                            {loading && (
                                <div className="bg-white p-10 rounded-2xl shadow-lg text-center flex items-center justify-center gap-3">
                                    <Loader2 className="animate-spin text-blue-600" size={24} />
                                    <span className="font-medium text-gray-700">Đang tải câu hỏi...</span>
                                </div>
                            )}

                            {!loading && faqs.length > 0 && (
                                <div className="space-y-4">
                                    {faqs.map((faq, index) => (
                                        <div 
                                            key={faq.id || index} 
                                            className={`group bg-white rounded-2xl transition-all duration-300 overflow-hidden
                                                ${openIndex === index 
                                                    ? 'shadow-lg ring-1 ring-blue-200' 
                                                    : 'shadow-sm hover:shadow-md border border-gray-100'
                                                }`}>
                                            <button 
                                                onClick={() => toggleFAQ(index)}
                                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none">
                                                <span className={`font-bold text-lg pr-8 transition-colors ${openIndex === index ? 'text-blue-700' : 'text-gray-800 group-hover:text-blue-600'}`}>
                                                    {faq.question}
                                                </span>
                                                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === index ? 'bg-blue-100 text-blue-600 rotate-180' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50'}`}>
                                                    <ChevronDown size={20}/>
                                                </span>
                                            </button>
                                            
                                            <div 
                                                className={`grid transition-all duration-300 ease-in-out ${openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                <div className="overflow-hidden">
                                                    <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-dashed border-gray-100 mt-2">
                                                        <div className="pt-4">
                                                            {formatAnswer(faq.answer)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {!loading && faqs.length === 0 && (
                                <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
                                    <p className="text-gray-500 font-medium">Hiện tại chưa có câu hỏi nào được thêm vào hệ thống.</p>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-1 lg:mt-0 mt-4">
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center relative overflow-hidden group lg:sticky lg:top-8">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full pointer-events-none"></div>
                                
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Vẫn chưa tìm thấy câu trả lời?</h3>
                                    <p className="text-gray-500 mb-8 max-w-lg mx-auto text-sm">
                                        Đội ngũ hỗ trợ của FootballTic luôn sẵn sàng giải đáp mọi thắc mắc của bạn 24/7.
                                    </p>
                                    
                                    <div className="flex flex-col justify-center gap-4">
                                        <a 
                                            href="tel:1900123456" 
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 hover:scale-[1.02]">
                                            <Phone size={18}/> Gọi Hotline
                                        </a>
                                        <button 
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 font-bold rounded-xl hover:bg-gray-50 transition hover:scale-[1.02]">
                                            <MessageCircle size={18} className="text-blue-600"/> Chat ngay
                                        </button>
                                        <a 
                                            href="mailto:support@footballtic.com"
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 font-bold rounded-xl hover:bg-gray-50 transition hover:scale-[1.02]">
                                            <Mail size={18} className="text-orange-500"/> Gửi Email
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}