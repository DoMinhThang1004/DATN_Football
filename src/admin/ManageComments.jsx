import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import { Link } from "react-router-dom";
import { 
  Search, Filter, Trash2, MessageSquare, CheckCircle, 
  AlertTriangle, Loader2, CornerDownRight, X, Send, 
  MoreVertical, Ban, ExternalLink, Star
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/comments`;

export default function ManageComments() {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); 

  const [notification, setNotification] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  
  const [openMenuId, setOpenMenuId] = useState(null);
  
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeComment, setActiveComment] = useState(null);
  const [replyText, setReplyText] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const menuRef = useRef(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setOpenMenuId(null);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
        const res = await fetch(`${API_URL}/all`);
        const data = await res.json();
        const formattedData = data.map(item => ({
            ...item,
            rating: Number(item.rating) || 0,
            match_id: item.match_id || null
        }));
        setComments(formattedData);
    } catch (error) {
        console.error(error);
        showNotification("Lỗi tải bình luận", "error");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const updateStatus = async (id, status) => {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        showNotification(`Đã cập nhật trạng thái: ${status}`);
        setOpenMenuId(null);
        fetchComments();
    } catch (error) {
        showNotification("Lỗi cập nhật", "error");
    }
  };

  const handleDeleteExecute = async () => {
    if (!commentToDelete) return;
    try {
        await fetch(`${API_URL}/${commentToDelete.id}`, { method: 'DELETE' });
        showNotification("Đã xóa bình luận");
        fetchComments();
    } catch (error) {
        showNotification("Lỗi xóa", "error");
    } finally {
        setDeleteModalOpen(false);
        setOpenMenuId(null);
    }
  };

  const handleReplySubmit = async (e) => {
      e.preventDefault();
      if (!replyText.trim()) return;
      
      try {
          await fetch(`${API_URL}/${activeComment.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ admin_reply: replyText, status: 'APPROVED' })
          });
          showNotification("Đã gửi trả lời!");
          setReplyModalOpen(false);
          setReplyText("");
          setOpenMenuId(null);
          fetchComments();
      } catch (error) {
          showNotification("Lỗi gửi trả lời", "error");
      }
  };

  const filteredComments = comments.filter(c => {
    const searchContent = ((c.user_name || "") + (c.content || "")).toLowerCase();
    const matchSearch = searchContent.includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "ALL" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentComments = filteredComments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);

  const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
      }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen relative">
        {notification && <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}<span className="font-medium">{notification.message}</span></div>}

        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Bình luận</h1>
            <div className="bg-white border px-4 py-2 rounded-lg text-sm font-medium text-gray-600 shadow-sm">
                Chờ duyệt: <span className="text-orange-600 font-bold">{comments.filter(c => c.status === 'PENDING').length}</span>
            </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Tìm nội dung, người dùng..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <select className="border rounded-lg px-3 py-2 cursor-pointer text-sm outline-none focus:ring-2 focus:ring-blue-500" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}><option value="ALL">Tất cả</option><option value="PENDING">Chờ duyệt</option><option value="APPROVED">Đã hiển thị</option><option value="SPAM">Spam</option></select>
        </div>

        {isLoading ? <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-blue-600"/></div> : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible flex flex-col min-h-[400px]">
                <div className="flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-64">Người dùng / Trận đấu</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nội dung bình luận</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-32 text-center">Trạng thái</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-20 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentComments.map((comment) => (
                                <tr key={comment.id} className="hover:bg-gray-50 transition-colors relative group">
                                    <td className="p-4 align-top">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold overflow-hidden border border-gray-200">
                                                {comment.avatar_url ? <img src={comment.avatar_url} className="w-full h-full object-cover"/> : comment.user_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{comment.user_name}</div>
                                                <div className="text-[10px] text-gray-400">{new Date(comment.created_at).toLocaleDateString('vi-VN')}</div>
                                            </div>
                                        </div>
                                        
                                        {comment.match_id && comment.home_team !== 'Trận đã xóa' ? (
                                            <Link 
                                                // Link kèm ID (Anchor) để cuộn xuống comment
                                                to={`/matches/${comment.match_id}#comment-${comment.id}`} 
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 px-2 py-1 rounded w-fit border border-blue-100 transition-colors hover:bg-blue-100"
                                                title="Xem bình luận này trên trang chi tiết"
                                            >
                                                {comment.home_team} vs {comment.away_team} <ExternalLink size={10}/>
                                            </Link>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                                Trận đấu đã xóa
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="flex items-center gap-1 mb-1">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={12} 
                                                        className={i < Math.round(comment.rating) ? "fill-current text-yellow-400" : "text-gray-300"} 
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-gray-500 font-medium">({comment.rating}/5)</span>
                                        </div>
                                        
                                        <p className="text-gray-800 text-sm leading-relaxed">{comment.content}</p>
                                        {comment.admin_reply && (
                                            <div className="mt-2 ml-2 pl-3 border-l-2 border-blue-400 bg-blue-50/50 p-2 rounded text-xs">
                                                <span className="font-bold text-blue-700 block mb-0.5">Phản hồi:</span> 
                                                <span className="text-gray-600">{comment.admin_reply}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 align-top text-center">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                                            comment.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' : 
                                            comment.status === 'SPAM' ? 'bg-red-50 text-red-700 border-red-200' : 
                                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                                        }`}>
                                            {comment.status === 'APPROVED' ? 'Hiển thị' : comment.status === 'SPAM' ? 'Spam' : 'Chờ duyệt'}
                                        </span>
                                    </td>
                                    <td className="p-4 align-top text-right relative">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === comment.id ? null : comment.id); }}
                                            className={`p-2 rounded-full transition-colors ${openMenuId === comment.id ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                                        >
                                            <MoreVertical size={16} className="text-gray-500"/>
                                        </button>

                                        {openMenuId === comment.id && (
                                            <div ref={menuRef} className="absolute right-8 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                                <div className="py-1">
                                                    <button 
                                                        onClick={() => { setActiveComment(comment); setReplyText(comment.admin_reply || ""); setReplyModalOpen(true); setOpenMenuId(null); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                                                    >
                                                        <CornerDownRight size={14}/> Trả lời
                                                    </button>
                                                    {comment.status !== 'APPROVED' && (
                                                        <button 
                                                            onClick={() => updateStatus(comment.id, 'APPROVED')}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 flex items-center gap-2"
                                                        >
                                                            <CheckCircle size={14}/> Duyệt hiển thị
                                                        </button>
                                                    )}
                                                    {comment.status !== 'SPAM' && (
                                                        <button 
                                                            onClick={() => updateStatus(comment.id, 'SPAM')}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2"
                                                        >
                                                            <Ban size={14}/> Đánh dấu Spam
                                                        </button>
                                                    )}
                                                    <div className="border-t border-gray-100 my-1"></div>
                                                    <button 
                                                        onClick={() => { setCommentToDelete(comment); setDeleteModalOpen(true); setOpenMenuId(null); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14}/> Xóa vĩnh viễn
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                        <span className="text-xs text-gray-500">
                            Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredComments.length)} của {filteredComments.length}
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-1.5 rounded-lg border bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16}/></button>
                            {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => handlePageChange(page)} className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${currentPage === page ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}>{page}</button>
                            ))}
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16}/></button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      {replyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
              <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl transform transition-all scale-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Trả lời bình luận</h3>
                    <button onClick={() => setReplyModalOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                  </div>
                  
                  <div className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-700">{activeComment?.user_name}</span>
                        <div className="flex text-yellow-400 gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} className={i < Math.round(activeComment?.rating || 0) ? "fill-current text-yellow-400" : "text-gray-300"} />
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 italic">"{activeComment?.content}"</p>
                  </div>

                  <textarea 
                    className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none" 
                    placeholder="Nhập câu trả lời của quản trị viên..." 
                    value={replyText} onChange={e => setReplyText(e.target.value)} autoFocus ></textarea>
                  <div className="flex justify-end gap-3 mt-4">
                      <button onClick={() => setReplyModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">Hủy</button>
                      <button onClick={handleReplySubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"><Send size={14}/> Gửi trả lời</button>
                  </div>
              </div>
          </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-xl p-6 text-center w-80 shadow-xl transform transition-all scale-100">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><Trash2 size={24}/></div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">Xóa bình luận?</h3>
                <p className="text-gray-500 text-sm mb-6">Hành động này không thể hoàn tác.</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200">Hủy</button>
                    <button onClick={handleDeleteExecute} className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-sm">Xóa</button>
                </div>
            </div>
        </div>
      )}
    </AdminLayout>
  );
}
