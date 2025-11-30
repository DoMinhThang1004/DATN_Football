import React, { useState, useEffect } from "react";
import { Send, User, MessageSquare, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function CommentSection({ matchId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Lấy thông tin User đang đăng nhập (ĐÃ SỬA)
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Lỗi parse user", e);
      }
    }
  }, []);

  // 2. Lấy danh sách bình luận (Mock API)
  useEffect(() => {
    setTimeout(() => {
      setComments([
        { id: 1, user: "Nguyễn Văn A", avatar: null, content: "Trận này Việt Nam thắng chắc 3-0!", date: "2025-11-20 10:00", rating: 5 },
        { id: 2, user: "Trần B", avatar: "https://i.pravatar.cc/150?u=2", content: "Sân Mỹ Đình hôm nay đẹp quá, vé cũng rẻ.", date: "2025-11-19 15:30", rating: 4 },
      ]);
      setIsLoading(false);
    }, 500);
  }, [matchId]);

  // --- XỬ LÝ TÊN & AVATAR AN TOÀN (MỚI THÊM) ---
  const displayName = user ? (user.full_name || user.name || "User") : "";
  const displayAvatar = user ? (user.avatar_url || user.avatar) : null;
  const firstChar = displayName ? displayName.charAt(0).toUpperCase() : "U";

  // 3. Xử lý gửi bình luận
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: Date.now(),
      user: displayName, // Dùng tên hiển thị đã xử lý
      avatar: displayAvatar,
      content: newComment,
      date: new Date().toLocaleString('vi-VN'),
      rating: 5,
      isNew: true
    };

    setComments([newCommentObj, ...comments]);
    setNewComment("");
    
    // TODO: Gọi API lưu xuống database
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MessageSquare className="text-blue-600" /> Bình luận & Đánh giá
      </h3>

      {/* --- FORM NHẬP BÌNH LUẬN --- */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
          {/* Avatar người dùng đang đăng nhập */}
          <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold border border-blue-200 overflow-hidden">
            {displayAvatar ? (
                <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover"/>
            ) : (
                <span>{firstChar}</span>
            )}
          </div>
          
          <div className="flex-1 relative">
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm min-h-[80px]"
              placeholder={`Chia sẻ cảm nghĩ của bạn về trận đấu này, ${displayName}...`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            ></textarea>
            <button 
              type="submit" 
              disabled={!newComment.trim()}
              className="absolute bottom-3 right-3 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center mb-8 border border-gray-200 border-dashed">
          <p className="text-gray-500 mb-3">Vui lòng đăng nhập để tham gia bình luận trận đấu này.</p>
          <Link to="/login" className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
            Đăng nhập ngay
          </Link>
        </div>
      )}

      {/* --- DANH SÁCH BÌNH LUẬN --- */}
      <div className="space-y-6">
        {isLoading ? (
            <div className="text-center text-gray-400 py-4">Đang tải bình luận...</div>
        ) : comments.length > 0 ? (
            comments.map((comment) => (
            <div key={comment.id} className={`flex gap-4 ${comment.isNew ? 'animate-fade-in' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-500 overflow-hidden border border-gray-200">
                    {comment.avatar ? <img src={comment.avatar} alt="" className="w-full h-full object-cover"/> : <User size={20} />}
                </div>
                <div className="flex-1">
                    <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 relative group">
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <span className="font-bold text-gray-900 text-sm">{comment.user}</span>
                                <span className="text-xs text-gray-400 ml-2">{comment.date}</span>
                            </div>
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} fill={i < comment.rating ? "currentColor" : "none"} className={i >= comment.rating ? "text-gray-300" : ""}/>
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            {comment.content}
                        </p>
                    </div>
                    <div className="flex gap-4 mt-1 ml-2 text-xs text-gray-500 font-medium">
                        <button className="hover:text-blue-600">Thích</button>
                        <button className="hover:text-blue-600">Trả lời</button>
                    </div>
                </div>
            </div>
            ))
        ) : (
            <div className="text-center text-gray-400 py-8">
                <MessageSquare size={40} className="mx-auto mb-2 opacity-20"/>
                <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            </div>
        )}
      </div>
    </div>
  );
}