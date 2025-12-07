// File: src/pages/NewsDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, User, ArrowLeft, Loader2, Globe, CalendarDays, ChevronRight } from 'lucide-react';
import UserLayout from "../../layouts/UserLayout.jsx";

const API_NEWS = "http://localhost:5000/api/news";

// hàm xử lý ký tự xuống dòng \n
const formatContent = (text) => {
    if (!text) return null;
    
    // thay thế bằng thẻ đóng/mở paragraph
    let htmlContent = text.replace(/\\n\\n/g, '</p><p>');

    // thay thế 1 dòng xuống còn lại (\\n) = thẻ xuống dòng đơn 
    htmlContent = htmlContent.replace(/\\n/g, '<br/>'); 

    // bọc toàn bộ nội dung thẻ <p> nếu chưa bọc
    if (!htmlContent.startsWith('<p>')) {
        htmlContent = `<p>${htmlContent}</p>`;
    }
    htmlContent = htmlContent.replace(/<p>/g, '<p style="margin-bottom: 1.5rem;">');

    return (
        <div 
            // luôn đảm bảo nội dung từ db là an toàn
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
    );
};
export default function NewsDetailPage() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [newsItem, setNewsItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) {
            setError("Không tìm thấy ID tin tức.");
            setLoading(false);
            return;
        }
        fetch(`${API_NEWS}/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Không tìm thấy tin tức hoặc lỗi server.');
                return res.json();
            })
            .then(data => {
                setNewsItem(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    if (loading) {
        return (
            <UserLayout>
                <div className="flex justify-center py-40 min-h-screen">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            </UserLayout>
        );
    }

    if (error || !newsItem) {
        return (
            <UserLayout>
                <div className="container mx-auto py-20 text-center">
                    <h1 className="text-3xl text-red-600 font-bold">Lỗi: {error || "Không tìm thấy nội dung!"}</h1>
                    <button onClick={() => navigate(-1)} className="mt-6 text-blue-600 hover:underline flex items-center mx-auto">
                        <ArrowLeft size={16} className="mr-1"/> Quay lại trang tin tức
                    </button>
                </div>
            </UserLayout>
        );
    }

    // render nd
    return (
        <UserLayout>
            <div className="bg-gray-50 min-h-screen pb-20 pt-10 font-sans">
                <div className="container mx-auto px-4 max-w-5xl">
                    
                    <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                        <Link to="/news" className="hover:text-blue-600">Tin Tức</Link>
                        <ChevronRight size={14}/>
                        <span className="text-gray-700 font-medium line-clamp-1">{newsItem.title}</span>
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
                        <article className="border-b pb-6 mb-8">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                                {newsItem.title}
                            </h1>
                            <div className="flex items-center text-sm text-gray-500 gap-6">
                                
                                {/* ngày đăng */}
                                <span className="flex items-center gap-1">
                                    <CalendarDays size={16}/> {formatDate(newsItem.published_date)}
                                </span>
                                
                                {/* tác giả */}
                                <span className="flex items-center gap-1">
                                    <User size={16}/> Tác giả: <span className="font-medium text-gray-700"> {newsItem.author_id}</span>
                                </span>
                                
                                {/* nguồn */}
                                <span className="flex items-center gap-1">
                                    <Globe size={16}/> FootballTic
                                </span>
                            </div>
                        </article>

                        {/* ảnh đại diện */}
                        {newsItem.image_url && (
                            <div className="mb-8 rounded-xl overflow-hidden shadow-lg border border-gray-100">
                                <img src={newsItem.image_url} alt={newsItem.title} className="w-full object-cover max-h-[400px]"/>
                            </div>
                        )}
                        
                        {/* nội dung chi tiết */}
                        <div className="prose max-w-none text-gray-800 leading-relaxed text-lg">
                            {formatContent(newsItem.content)}
                        </div>
                    </div>
                    
                    <button onClick={() => navigate(-1)} className="mt-8 flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                        <ArrowLeft size={18} className="mr-2"/> Quay lại danh sách tin tức
                    </button>

                </div>
            </div>
        </UserLayout>
    );
}