import React, { useState, useEffect, useRef } from "react";
import { Send, User, MessageSquare, Star, CheckCircle, AlertTriangle, CornerUpLeft, Loader2, ThumbsUp } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

export default function CommentSection({ matchId }) {
  const navigate = useNavigate();
  const location = useLocation(); //bắt hash từ url
  const textareaRef = useRef(null); 

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5); 
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch (e) {}
    }
    const fetchComments = async () => {
        if (!matchId) return;
        try {
            const res = await fetch(`${API_BASE}/comments/match/${matchId}`);
            if (res.ok) {
                const data = await res.json();
                const formatted = data.map(c => ({
                    id: c.id,
                    full_name: c.full_name, 
                    avatar_url: c.avatar_url,
                    content: c.content,
                    created_at: c.created_at,
                    rating: c.rating,
                    admin_reply: c.admin_reply,
                    likes: Math.floor(Math.random() * 10),
                    isLiked: false
                }));
                setComments(formatted);
            }
        } catch (error) {
            console.error("Lỗi tải bình luận:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchComments();
  }, [matchId]);
  useEffect(() => {
      if (!isLoading && comments.length > 0 && location.hash) {
          const id = location.hash.replace("#", "");
          const element = document.getElementById(id);
          if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
              element.classList.add("bg-yellow-50");
              setTimeout(() => element.classList.remove("bg-yellow-50"), 2000);
          }
      }
  }, [isLoading, comments, location.hash]);

  const handleLike = (commentId) => {
      if (!user) { showNotification("Đăng nhập để thích bình luận!", "error"); return; }
      setComments(prev => prev.map(c => { if (c.id === commentId) { return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }; } return c; }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); 
    if (!user) { showNotification("Bạn cần đăng nhập để bình luận!", "error"); setTimeout(() => navigate('/login'), 1500); return; }
    if (!newComment.trim() && rating === 0) { showNotification("Vui lòng nhập nội dung hoặc chọn số sao!", "error"); return; }
    try {
        const payload = { user_id: user.id, match_id: matchId, content: newComment, rating: rating };
        const res = await fetch(`${API_BASE}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) {
            const newCommentData = await res.json();
            const newCommentUI = { id: newCommentData.id, full_name: user.full_name, avatar_url: user.avatar_url, content: newCommentData.content, created_at: new Date().toISOString(), rating: newCommentData.rating, isNew: true, likes: 0, isLiked: false };
            setComments([newCommentUI, ...comments]); setNewComment(""); setRating(5); showNotification("Đánh giá thành công!");
        } else { throw new Error("Lỗi Server"); }
    } catch (error) { showNotification("Lỗi gửi bình luận!", "error"); }
  };
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(null); } };
  const handleReplyClick = (authorName) => { if (!user) { showNotification("Đăng nhập để trả lời!", "error"); return; } setNewComment((prev) => `@${authorName} ${prev}`); textareaRef.current?.focus(); };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-8 relative">
      {notification && <div className={`fixed top-24 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}<span className="font-medium">{notification.message}</span></div>}
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><MessageSquare className="text-blue-600" /> Bình luận & Đánh giá</h3>
      
      {/*form nhập */}
      <div className="mb-8 flex gap-4 items-start">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-500 font-bold border border-gray-200 overflow-hidden">{user?.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover"/> : <User size={20} />}</div>
        <div className="flex-1">
            <div className="flex items-center gap-1 mb-2">
                <span className="text-xs text-gray-500 mr-1 font-medium">Đánh giá:</span>
                {[1, 2, 3, 4, 5].map((star) => (<button key={star} type="button" onClick={() => setRating(star)} className="transition-transform hover:scale-110 focus:outline-none"><Star size={16} className={`${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}/></button>))}
                <span className="text-xs font-bold text-yellow-500 ml-1">{rating}/5</span>
            </div>
            <div className="relative">
                <textarea ref={textareaRef} className="w-full border border-gray-200 rounded-xl p-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm min-h-[80px]" placeholder={user ? `Chia sẻ cảm nghĩ của bạn...` : "Đăng nhập để bình luận..."} value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={handleKeyDown} onClick={() => !user && showNotification("Bạn cần đăng nhập để bình luận!", "error")}></textarea>
                <button onClick={handleSubmit} className={`absolute bottom-3 right-3 p-1.5 rounded-lg transition-all ${user && (newComment.trim() || rating > 0) ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`} disabled={!user}><Send size={16} /></button>
            </div>
        </div>
      </div>

      {/* ds cmt */}
      <div className="space-y-6">
        {isLoading ? <div className="flex justify-center"><Loader2 className="animate-spin text-blue-600"/></div> : comments.length > 0 ? (
            comments.map((comment) => (
            <div 
                key={comment.id} 
                id={`comment-${comment.id}`} 
                className={`flex gap-4 ${comment.isNew ? 'animate-fade-in' : ''} transition-colors duration-500 rounded-lg p-2`}>
                <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-500 overflow-hidden border border-gray-200">
                    {comment.avatar_url ? <img src={comment.avatar_url} alt="" className="w-full h-full object-cover"/> : <User size={20} />}
                </div>
                <div className="flex-1">
                    <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 relative border border-gray-100">
                        <div className="flex justify-between items-start mb-1">
                            <div><span className="font-bold text-gray-900 text-sm mr-2">{comment.full_name || "Người dùng ẩn danh"}</span><span className="text-[10px] text-gray-400">{new Date(comment.created_at).toLocaleString('vi-VN')}</span></div>
                            <div className="flex text-yellow-400 gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < comment.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}/>)}</div>
                        </div>
                        {comment.content && <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{comment.content}</p>}
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 ml-2">
                        <button onClick={() => handleLike(comment.id)} className={`text-[11px] font-bold flex items-center gap-1 transition-colors ${comment.isLiked ? "text-blue-600" : "text-gray-400 hover:text-blue-600"}`}><ThumbsUp size={12} className={comment.isLiked ? "fill-blue-600" : ""}/> Thích {comment.likes > 0 && `(${comment.likes})`}</button>
                        <button onClick={() => handleReplyClick(comment.full_name)} className="text-[11px] font-bold text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors"><CornerUpLeft size={12}/> Trả lời</button>
                    </div>
                    {comment.admin_reply && (
                        <div className="ml-6 mt-3 flex gap-3 animate-fadeIn">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">A</div>
                            <div className="bg-blue-50 p-3 rounded-xl rounded-tl-none border border-blue-100 flex-1 shadow-sm"><p className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1"><CheckCircle size={12} className="fill-blue-600 text-white"/> Quản trị viên</p><p className="text-gray-700 text-sm leading-relaxed">{comment.admin_reply}</p></div>
                        </div>
                    )}
                </div>
            </div>
            ))
        ) : (
            <div className="text-center text-gray-400 py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200"><MessageSquare size={40} className="mx-auto mb-2 opacity-20"/><p className="text-sm">Chưa có đánh giá nào cho trận đấu này.</p></div>
        )}
      </div>
    </div>
  );
}