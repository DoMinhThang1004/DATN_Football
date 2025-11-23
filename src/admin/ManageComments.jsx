import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import { 
  Search, Filter, Trash2, MessageSquare, CheckCircle, 
  AlertTriangle, Loader2, Check, CornerDownLeft, Send, X 
} from "lucide-react";

export default function ManageComments() {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); 

  // State Notification & Delete Modal
  const [notification, setNotification] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  // --- STATE MỚI CHO PHẦN TRẢ LỜI ---
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [commentToReply, setCommentToReply] = useState(null); // Lưu comment đang được chọn để trả lời
  const [replyText, setReplyText] = useState("");

  // Helper
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch Data
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setComments([
        { 
          id: 1, 
          user: "Nguyễn Văn A", 
          avatar: "https://i.pravatar.cc/150?u=1",
          match: "Việt Nam vs Thái Lan", 
          content: "Việt Nam vô địch! Trận này dự đoán 3-1 nhé anh em.", 
          date: "2025-11-19T10:30:00", 
          status: "APPROVED" 
        },
        { 
          id: 2, 
          user: "Trần B", 
          avatar: null,
          match: "Hà Nội FC vs CAHN", 
          content: "Vé khán đài A còn không admin ơi?", 
          date: "2025-11-19T11:00:00", 
          status: "PENDING" 
        },
        { 
          id: 3, 
          user: "Spam Bot", 
          avatar: null,
          match: "SLNA vs HAGL", 
          content: "Bán sim số đẹp giá rẻ, liên hệ zalo...", 
          date: "2025-11-18T09:00:00", 
          status: "SPAM" 
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  // --- ACTIONS ---
  
  const handleApprove = (id) => {
    setComments(comments.map(c => c.id === id ? { ...c, status: "APPROVED" } : c));
    showNotification("Đã duyệt bình luận này.");
  };

  const handleMarkSpam = (id) => {
    setComments(comments.map(c => c.id === id ? { ...c, status: "SPAM" } : c));
    showNotification("Đã đánh dấu là Spam.", "error");
  };

  const confirmDelete = (comment) => {
    setCommentToDelete(comment);
    setDeleteModalOpen(true);
  };

  const handleDeleteExecute = () => {
    if (!commentToDelete) return;
    setComments(comments.filter(c => c.id !== commentToDelete.id));
    showNotification("Đã xóa bình luận vĩnh viễn.");
    setDeleteModalOpen(false);
  };

  // --- HÀM MỞ MODAL TRẢ LỜI ---
  const handleOpenReply = (comment) => {
    setCommentToReply(comment);
    setReplyText(`Chào ${comment.user}, `); // Tự động điền tên khách
    setReplyModalOpen(true);
  };

  // --- HÀM GỬI TRẢ LỜI ---
  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
        showNotification("Vui lòng nhập nội dung trả lời!", "error");
        return;
    }

    // TODO: Gọi API gửi reply (POST /api/comments/reply)
    console.log(`Trả lời cho comment #${commentToReply.id}: ${replyText}`);

    // Nếu bình luận chưa duyệt, tự động duyệt luôn khi trả lời
    if (commentToReply.status === 'PENDING') {
        setComments(comments.map(c => c.id === commentToReply.id ? { ...c, status: "APPROVED" } : c));
    }

    showNotification("Đã gửi câu trả lời thành công!");
    setReplyModalOpen(false);
    setReplyText("");
  };

  // Filter
  const filteredComments = comments.filter(c => {
    const matchSearch = c.user.toLowerCase().includes(searchTerm.toLowerCase()) || c.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "ALL" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('vi-VN');
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen relative">
        
        {notification && (
            <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                <span className="font-medium">{notification.message}</span>
            </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Bình luận</h1>
            <p className="text-gray-500 text-sm mt-1">Kiểm duyệt ý kiến khách hàng từ các trận đấu.</p>
          </div>
          <div className="bg-white border px-4 py-2 rounded-lg text-sm font-medium text-gray-600 shadow-sm">
            Chưa duyệt: <span className="text-red-600 font-bold">{comments.filter(c => c.status === 'PENDING').length}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Tìm theo nội dung hoặc tên người dùng..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="relative w-full md:w-48">
                <select 
                    className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="APPROVED">Đã hiển thị</option>
                    <option value="SPAM">Spam / Rác</option>
                </select>
                <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            </div>
        </div>

        {/* Comments Table */}
        {isLoading ? (
            <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
                        <tr>
                            <th className="p-4 w-64">Người dùng</th>
                            <th className="p-4">Nội dung bình luận</th>
                            <th className="p-4 w-40 text-center">Trạng thái</th>
                            <th className="p-4 w-48 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredComments.length > 0 ? (
                            filteredComments.map((comment) => (
                                <tr key={comment.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4 align-top">
                                        <div className="flex items-start gap-3">
                                            {comment.avatar ? (
                                                <img src={comment.avatar} alt="" className="w-10 h-10 rounded-full object-cover border"/>
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                                    {comment.user.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{comment.user}</p>
                                                <p className="text-xs text-gray-500 mt-1">{formatDate(comment.date)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="text-xs font-semibold text-blue-600 mb-1 bg-blue-50 inline-block px-2 py-0.5 rounded">
                                            {comment.match}
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                                    </td>
                                    <td className="p-4 align-top text-center">
                                        {comment.status === 'APPROVED' && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Hiển thị</span>}
                                        {comment.status === 'PENDING' && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Chờ duyệt</span>}
                                        {comment.status === 'SPAM' && <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Spam</span>}
                                    </td>
                                    <td className="p-4 align-top text-right">
                                        <div className="flex justify-end gap-2">
                                            
                                            {/* NÚT TRẢ LỜI (MỚI THÊM) - Chỉ hiện cho bình luận không phải Spam */}
                                            {comment.status !== 'SPAM' && (
                                                <button 
                                                    onClick={() => handleOpenReply(comment)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                                    title="Trả lời khách hàng"
                                                >
                                                    <CornerDownLeft size={18} />
                                                </button>
                                            )}

                                            {/* Nút Duyệt */}
                                            {(comment.status === 'PENDING' || comment.status === 'SPAM') && (
                                                <button 
                                                    onClick={() => handleApprove(comment.id)} 
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                                                    title={comment.status === 'SPAM' ? "Khôi phục" : "Duyệt"}
                                                >
                                                    <Check size={18} />
                                                </button>
                                            )}

                                            {/* Nút Spam */}
                                            {comment.status !== 'SPAM' && (
                                                <button 
                                                    onClick={() => handleMarkSpam(comment.id)} 
                                                    className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" 
                                                    title="Báo Spam"
                                                >
                                                    <AlertTriangle size={18} />
                                                </button>
                                            )}
                                            
                                            {/* Nút Xóa */}
                                            <button 
                                                onClick={() => confirmDelete(comment)} 
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                                title="Xóa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500">Không có bình luận nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* --- MODAL TRẢ LỜI BÌNH LUẬN (MỚI THÊM) --- */}
      {replyModalOpen && commentToReply && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Trả lời bình luận</h3>
                    <button onClick={() => setReplyModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSendReply}>
                    <div className="p-6 space-y-4">
                        {/* Bình luận gốc */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-xs font-bold text-gray-500 mb-1">{commentToReply.user} viết:</p>
                            <p className="text-gray-800 text-sm italic">"{commentToReply.content}"</p>
                        </div>

                        {/* Ô nhập trả lời */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung trả lời</label>
                            <textarea 
                                rows="4" 
                                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập câu trả lời của Admin..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                autoFocus
                            ></textarea>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={() => setReplyModalOpen(false)} 
                            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            type="submit" 
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium shadow-sm"
                        >
                            <Send size={16} /> Gửi trả lời
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Modal Xóa (Giữ nguyên) */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><Trash2 size={24} /></div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Xóa bình luận?</h3>
                <p className="text-gray-500 text-sm mb-6">Bình luận của <strong>{commentToDelete?.user}</strong> sẽ bị xóa vĩnh viễn.</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Hủy bỏ</button>
                    <button onClick={handleDeleteExecute} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Xóa ngay</button>
                </div>
            </div>
        </div>
      )}
    </AdminLayout>
  );
}