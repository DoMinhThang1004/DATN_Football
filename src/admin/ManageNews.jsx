import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Globe, Clock, Loader2, X, AlertTriangle, FileText, CalendarDays, Image } from 'lucide-react';
import { formatDate } from 'date-fns';
import AdminLayout from '../layouts/AdminLayout';

const API_NEWS = "http://localhost:5000/api/news";

// tiện ích chữ đậm cho admin
const formatPreviewContent = (text) => {
    if (!text) return null;
    let htmlContent = text;
    
    // chuyển đổi xuống dòng thành thẻ <br/>
    htmlContent = htmlContent.replace(/\n/g, '<br/>');

    // chuyển **chữ đậm** thành thẻ <b>
    htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); 

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

// component form thêm,sửa tin tức
const NewsForm = ({ newsToEdit, onClose, onSave }) => {
    const [formData, setFormData] = useState({ 
        title: '', content: '', image_url: '', status: 'draft' 
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (newsToEdit) {
            const contentData = newsToEdit.content || ""; 
            
            setFormData({
                title: newsToEdit.title,
                // chuyển \n thành xuống dòng thật
                content: contentData.replace(/\\n/g, '\n'), 
                image_url: newsToEdit.image_url,
                status: newsToEdit.status
            });
        }
    }, [newsToEdit]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const method = newsToEdit ? 'PUT' : 'POST';
        const url = newsToEdit ? `${API_NEWS}/${newsToEdit.id}` : API_NEWS;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                // chuyển xuống dòng thành \n để lưu vào db
                body: JSON.stringify({...formData, 
                    author_id: 1, 
                    content: formData.content.replace(/\n/g, '\\n') 
                }) 
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Lỗi ${method} tin tức.`);
            }
            onSave();
            onClose();

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl p-6 relative grid grid-cols-1 lg:grid-cols-2 gap-6">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-600"><X size={24}/></button>
                <div className="pr-4 border-r border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
                        {newsToEdit ? 'Sửa Tin Tức' : 'Thêm Tin Tức Mới'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg flex items-center gap-2"><AlertTriangle size={16}/> {error}</div>}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-lg focus:ring-blue-500 shadow-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nội dung</label>
                            <textarea 
                                name="content" value={formData.content} onChange={handleChange} required rows={8} 
                                className="w-full mt-1 p-3 border rounded-lg focus:ring-blue-500 shadow-sm transition-all"
                                placeholder="Nhập nội dung (Dùng **chữ đậm** và Enter 2 lần để ngắt đoạn)"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Link Ảnh Đại diện (image_url)</label>
                            <input type="url" name="image_url" value={formData.image_url} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg focus:ring-blue-500 shadow-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg focus:ring-blue-500">
                                <option value="published">Đã Xuất bản</option>
                                <option value="draft">Bản nháp</option>
                            </select>
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin" size={20}/> : (newsToEdit ? 'Lưu Thay Đổi' : 'Đăng Tin Tức')}
                        </button>
                    </form>
                </div>

                <div className="pt-10 lg:pt-0">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText size={18}/> Xem trước Bài viết
                    </h3>
                    <div className="bg-white border rounded-xl shadow-inner border-gray-100 p-4 h-full max-h-[60vh] overflow-y-auto">
                        
                        {/*ảnh*/}
                        {formData.image_url ? (
                            <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-4"/>
                        ) : (
                            <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500 text-sm">
                                <Image size={24} className="mr-2"/> Chưa có ảnh
                            </div>
                        )}
                        <h4 className="text-xl font-bold mb-3">{formData.title || "Tiêu đề mẫu"}</h4>
                        <p className="text-xs text-gray-500 mb-4">Ngày: {new Date().toLocaleDateString()}</p>
                        <hr className="mb-4"/>

                        {/* hiển thị nd*/}
                        <div className="text-gray-700 text-base leading-relaxed">
                            {formatPreviewContent(formData.content)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// main component quản lý tin tức
export default function ManageNews() {
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingNews, setEditingNews] = useState(null);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_NEWS); 
            const data = await res.json();
            setNewsList(data);
        } catch (err) {
            console.error("Failed to fetch news:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa tin tức này không?")) return;
        
        try {
            await fetch(`${API_NEWS}/${id}`, { method: 'DELETE' });
            fetchNews(); // làm mới ds
        } catch (err) {
            console.error("Xóa thất bại:", err);
            alert("Xóa tin tức thất bại!");
        }
    };

    const handleEdit = (news) => {
        setEditingNews(news);
        setShowForm(true);
    };

    const handleCreateNew = () => {
        setEditingNews(null); // đặt null để tạo mới
        setShowForm(true);
    };

    const formatDateForTable = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        } catch {
            return new Date(dateString).toLocaleDateString();
        }
    };

    return (
        <AdminLayout>
        <div className="p-8 bg-gray-50 min-h-screen"> 
            <div className="mb-6 flex items-center justify-between border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <Globe size={28} className="text-blue-600"/> Quản lý Tin Tức
                </h1>
                <button 
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-md"
                >
                    <Plus size={20}/> Thêm Tin Mới
                </button>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                
                <div className="p-4 flex justify-between items-center border-b">
                    <div className="text-sm font-semibold text-gray-600">
                        Danh sách bài viết ({newsList.length})
                    </div>
                </div>

                {loading && (
                    <div className="py-12 text-center text-blue-600">
                        <Loader2 className="animate-spin mx-auto" size={32}/>
                        <p className="mt-2">Đang tải dữ liệu...</p>
                    </div>
                )}
                {!loading && (
                    <div className="divide-y divide-gray-100">
                        <div className="hidden lg:grid grid-cols-11 gap-4 text-xs font-semibold text-gray-500 px-6 py-3 bg-gray-50 uppercase">
                            <span className="col-span-1">ID</span>
                            <span className="col-span-1">Ảnh</span>
                            <span className="col-span-3">Tiêu đề & Tóm tắt</span>
                            <span className="col-span-2">Ngày đăng</span>
                            <span className="col-span-1">Tác giả</span>
                            <span className="col-span-2 text-center">Trạng thái</span>
                            <span className="col-span-1 text-right">Thao tác</span>
                        </div>


                        {/*dl theo dòng */}
                        {newsList.map((news) => (
                            <div key={news.id} className="grid grid-cols-11 gap-4 items-center px-6 py-4 hover:bg-blue-50/50 transition-colors">
                                <div className="col-span-1 text-sm font-medium text-gray-900">{news.id}</div>
                                <div className="col-span-1">
                                    <img 
                                        src={news.image_url || 'https://via.placeholder.com/60x40?text=FT'} 
                                        alt="" 
                                        className="w-12 h-10 object-cover rounded-md border"
                                    />
                                </div>
                                <div className="col-span-3 flex flex-col">
                                    <span className="text-base font-semibold text-gray-800 line-clamp-1">{news.title}</span>
                                    <span className="text-xs text-gray-500 line-clamp-1 mt-1">{news.summary}</span>
                                </div>

                                <div className="col-span-2 text-sm text-gray-600 flex items-center gap-1">
                                    <Clock size={14}/> {formatDateForTable(news.published_date)}
                                </div>
                                <div className="col-span-1 text-sm text-gray-500 line-clamp-1">
                                    <FileText size={14} className="inline mr-1 text-blue-500"/> {news.author_id}
                                </div>
                                <div className="col-span-2 text-center">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${news.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {news.status === 'published' ? 'Đã đăng' : 'Nháp'}
                                    </span>
                                </div>
                                <div className="col-span-1 flex justify-end gap-3">
                                    <button onClick={() => handleEdit(news)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full transition" title="Chỉnh sửa">
                                        <Edit size={16}/>
                                    </button>
                                    <button onClick={() => handleDelete(news.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full transition" title="Xóa">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>
                        ))}

                        {newsList.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                Chưa có tin tức nào được đăng.
                            </div>
                        )}
                    </div>
                )}
            </div>
            {showForm && (
                <NewsForm 
                    newsToEdit={editingNews}
                    onClose={() => setShowForm(false)}
                    onSave={fetchNews}
                />
            )}
        </div>
        </AdminLayout>
    );
}