import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Globe, Clock, Loader2, X, AlertTriangle, FileText, Image, Save, CheckCircle } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';

const API_BASE = "http://localhost:5000";
const API_NEWS = `${API_BASE}/api/news`;
const UPLOAD_URL = `${API_BASE}/api/upload`;

const formatPreviewContent = (text) => {
    if (!text) return null;
    let htmlContent = text;
    htmlContent = htmlContent.replace(/\n/g, '<br/>');
    htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); 
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default function ManageNews() {
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [notification, setNotification] = useState(null);

    //modal xóa
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [newsToDelete, setNewsToDelete] = useState(null);

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchNews = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_NEWS); 
            if(res.ok) {
                const data = await res.json();
                setNewsList(data);
            }
        } catch (err) {
            console.error("Failed to fetch news:", err);
            showNotification("Lỗi tải danh sách tin tức", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);


    const openDeleteModal = (news) => {
        setNewsToDelete(news);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!newsToDelete) return;
        try {
            const res = await fetch(`${API_NEWS}/${newsToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
                showNotification("Đã xóa tin tức thành công!");
                fetchNews();
            } else {
                showNotification("Xóa thất bại!", "error");
            }
        } catch (err) {
            showNotification("Lỗi kết nối server", "error");
        } finally {
            setDeleteModalOpen(false);
            setNewsToDelete(null);
        }
    };

    const handleEdit = (news) => {
        setEditingNews(news);
        setShowForm(true);
    };

    const handleCreateNew = () => {
        setEditingNews(null);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        fetchNews();
        showNotification(editingNews ? "Cập nhật bài viết thành công!" : "Đăng bài viết mới thành công!");
    };

    const formatDateForTable = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        } catch {
            return "N/A";
        }
    };

    return (
        <AdminLayout>
            <div className="p-8 bg-gray-50 min-h-screen relative"> 
                {notification && (
                    <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                        {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                        <span className="font-medium">{notification.message}</span>
                    </div>
                )}

                <div className="mb-6 flex items-center justify-between border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <Globe size={28} className="text-blue-600"/> Quản lý Tin Tức
                    </h1>
                    <button 
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-md">
                        <Plus size={20}/> Thêm Tin Mới
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="p-4 flex justify-between items-center border-b bg-gray-50">
                        <div className="text-sm font-semibold text-gray-600">
                            Danh sách bài viết ({newsList.length})
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center text-blue-600">
                            <Loader2 className="animate-spin mx-auto" size={32}/>
                            <p className="mt-2">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-100 text-gray-600 text-xs font-bold uppercase">
                                    <tr>
                                        <th className="px-6 py-3">ID</th>
                                        <th className="px-6 py-3">Ảnh</th>
                                        <th className="px-6 py-3 w-1/3">Tiêu đề & Tóm tắt</th>
                                        <th className="px-6 py-3">Ngày đăng</th>
                                        <th className="px-6 py-3">Tác giả</th>
                                        <th className="px-6 py-3 text-center">Trạng thái</th>
                                        <th className="px-6 py-3 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {newsList.map((news) => (
                                        <tr key={news.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">#{news.id}</td>
                                            <td className="px-6 py-4">
                                                <img 
                                                    src={news.image_url || 'https://via.placeholder.com/60x40?text=No+Img'} 
                                                    alt="" 
                                                    className="w-16 h-12 object-cover rounded-md border border-gray-200" 
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-800 line-clamp-1" title={news.title}>{news.title}</span>
                                                    <span className="text-xs text-gray-500 line-clamp-1 mt-1" title={news.summary}>{news.summary}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1"><Clock size={14}/> {formatDateForTable(news.created_at)}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1"><FileText size={14} className="text-blue-500"/> {news.author}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full border ${news.status === 'published' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                                                    {news.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleEdit(news)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Sửa"><Edit size={18}/></button>
                                                    <button onClick={() => openDeleteModal(news)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Xóa"><Trash2 size={18}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {newsList.length === 0 && (
                                        <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">Chưa có bài viết nào.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {showForm && (
                    <NewsForm 
                        newsToEdit={editingNews}
                        onClose={() => setShowForm(false)}
                        onSave={handleFormSuccess}
                        showNotification={showNotification}
                    />
                )}
                {deleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                        <div className="bg-white rounded-xl w-full max-w-sm p-6 text-center shadow-2xl">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                                <Trash2 size={28}/>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa?</h3>
                            <p className="text-gray-500 text-sm mb-6">Bạn có chắc chắn muốn xóa bài viết: <br/><strong>"{newsToDelete?.title}"</strong>?</p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">Hủy</button>
                                <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md">Xóa ngay</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

const NewsForm = ({ newsToEdit, onClose, onSave, showNotification }) => {
    const [formData, setFormData] = useState({ 
        title: '', content: '', summary: '', image_url: '', status: 'draft', category: 'Tin tức chung', author: 'Admin'
    });
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (newsToEdit) {
            setFormData({
                title: newsToEdit.title,
                summary: newsToEdit.summary || '',
                content: newsToEdit.content || '', 
                image_url: newsToEdit.image_url || '',
                status: newsToEdit.status || 'draft', 
                category: newsToEdit.category || 'Tin tức chung',
                author: newsToEdit.author || 'Admin'
            });
        }
    }, [newsToEdit]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const data = new FormData(); 
        data.append("file", file);
        try {
            const res = await fetch(UPLOAD_URL, { method: "POST", body: data });
            const result = await res.json();
            setFormData(prev => ({ ...prev, image_url: result.url }));
        } catch (error) {
            showNotification("Lỗi upload ảnh!", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const method = newsToEdit ? 'PUT' : 'POST';
        const url = newsToEdit ? `${API_NEWS}/${newsToEdit.id}` : API_NEWS;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData) 
            });
            if (!res.ok) throw new Error("Lỗi khi lưu tin tức");
            onSave();
        } catch (err) {
            showNotification(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl p-0 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h3 className="text-xl font-bold text-gray-800">{newsToEdit ? 'Chỉnh sửa bài viết' : 'Đăng bài mới'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={24}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tiêu đề bài viết</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nhập tiêu đề hấp dẫn..."/>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Danh mục</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="V-League">V-League</option>
                                    <option value="Tuyển Quốc Gia">Tuyển Quốc Gia</option>
                                    <option value="Chuyển Nhượng">Chuyển Nhượng</option>
                                    <option value="Bên lề">Bên lề</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Trạng thái</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="published">Công khai (Published)</option>
                                    <option value="draft">Bản nháp (Draft)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Ảnh đại diện</label>
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative overflow-hidden group">
                                {isUploading ? <Loader2 className="animate-spin text-blue-500"/> : (formData.image_url ? <img src={formData.image_url} className="w-full h-full object-cover"/> : <div className="flex flex-col items-center"><Image size={24} className="text-gray-400 mb-1"/><span className="text-xs text-gray-500">Tải ảnh lên</span></div>)}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                {formData.image_url && !isUploading && <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white font-bold">Thay đổi ảnh</div>}
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tóm tắt ngắn</label>
                            <textarea name="summary" value={formData.summary} onChange={handleChange} rows={3} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Mô tả ngắn gọn nội dung..."></textarea>
                        </div>
                    </div>

                    <div className="space-y-4 flex flex-col">
                        <div className="flex-1 flex flex-col">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nội dung chi tiết</label>
                            <textarea name="content" value={formData.content} onChange={handleChange} required className="w-full flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono" placeholder="Viết nội dung ở đây... Hỗ trợ xuống dòng."></textarea>
                            <p className="text-xs text-gray-500 mt-1">* Mẹo: Sử dụng **text** để in đậm.</p>
                        </div>
                        
                        <div className="border-t pt-4">
                            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1"><FileText size={16}/> Xem trước nội dung:</h4>
                            <div className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-700 h-32 overflow-y-auto leading-relaxed">
                                {formatPreviewContent(formData.content)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition">Hủy bỏ</button>
                    <button onClick={handleSubmit} disabled={loading || isUploading} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                        {newsToEdit ? 'Lưu thay đổi' : 'Đăng bài ngay'}
                    </button>
                </div>
            </div>
        </div>
    );
};