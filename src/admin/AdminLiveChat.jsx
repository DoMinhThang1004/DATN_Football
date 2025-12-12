import React, { useState, useEffect, useRef } from 'react';
import { Send, Headset, User, MessageSquare, Clock, Search, MoreVertical, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import io from 'socket.io-client';
import AdminLayout from '../layouts/AdminLayout';


const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const socket = io(SOCKET_SERVER_URL);

const ADMIN_ID = 100; 

// xl ảnh
const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${SOCKET_SERVER_URL}${url}`;
};

const AdminLiveChat = () => {
    const [activeUser, setActiveUser] = useState(null);
    
    //ds
    const [requests, setRequests] = useState([]);     
    const [activeChats, setActiveChats] = useState([]);
    const [messagesMap, setMessagesMap] = useState({}); 
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    
    useEffect(() => {
        const registerAdmin = () => {
            console.log(">> Admin đã kết nối live chat.");
            socket.emit('admin_connect', { userId: ADMIN_ID });
        };

        if (socket.connected) registerAdmin();
        socket.on('connect', registerAdmin);
        
        //nhận yc mới
        socket.on('new_live_request', (request) => {
            setRequests(prev => {
                //có trong chat, chờ thì dừng
                const isChatting = activeChats.some(c => c.userId === request.userId);
                const isPending = prev.some(r => r.userId === request.userId);
                
                if (isChatting || isPending) return prev;
                return [...prev, { ...request, timestamp: new Date() }];
            });
        });
        
        //nhận tn từ user
        socket.on('live_message_from_user', (data) => {
            addMessage(data.userId, { sender: 'user', text: data.message, timestamp: new Date() });
        });

        // tb hệ thống
        socket.on('ai_response', (response) => {
            //tb all
            if (activeUser) {
                 addMessage(activeUser, { sender: 'system', text: response, timestamp: new Date() });
            }
        });

        return () => {
            socket.off('connect', registerAdmin);
            socket.off('new_live_request');
            socket.off('live_message_from_user');
            socket.off('ai_response');
        };
    }, [activeUser, activeChats]); 

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messagesMap, activeUser]);

    // thêm tn vào map
    const addMessage = (userId, msg) => {
        setMessagesMap(prev => ({
            ...prev,
            [userId]: [...(prev[userId] || []), msg]
        }));
    };

    // xl chấp nhận
    const handleAcceptRequest = (request) => {
        socket.emit('accept_live_request', { userId: request.userId }); 
        
        //xóa hàng chờ
        setRequests(prev => prev.filter(r => r.userId !== request.userId));
        
        // thêm vào ds chat nếu chưa có
        if (!activeChats.some(c => c.userId === request.userId)) {
            setActiveChats(prev => [request, ...prev]);
        }
        
        // chat với ngd
        setActiveUser(request.userId);
        addMessage(request.userId, { sender: 'system', text: `Đã kết nối với ${request.fullName}`, timestamp: new Date() });
    };

    // chuyển qua lại
    const handleSelectChat = (user) => {
        setActiveUser(user.userId);
    };
    
    // gửi tn
    const handleSend = (e) => {
        e.preventDefault();
        if (input.trim() === '' || !activeUser) return;
        const adminMessage = input.trim();
        
        // lưu
        addMessage(activeUser, { sender: 'admin', text: adminMessage, timestamp: new Date() });
        socket.emit('send_live_message_to_user', { userId: activeUser, message: adminMessage });
        setInput('');
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // lấy tn của ng dùng 
    const currentMessages = messagesMap[activeUser] || [];
    const currentUserInfo = activeChats.find(c => c.userId === activeUser);

    return (
        <AdminLayout>
            <div className="flex h-[85vh] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="w-1/3 min-w-[320px] border-r border-gray-200 bg-gray-50 flex flex-col">
                    <div className="p-5 border-b border-gray-200 bg-white shadow-sm z-10">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <MessageSquare className="text-blue-600"/> Live Support
                        </h2>
                    </div>

                    <div className="flex-grow overflow-y-auto p-3 space-y-6">
                        <div>
                            <p className="text-xs font-bold text-green-600 uppercase tracking-wider px-2 mb-2 flex items-center gap-2">
                                <CheckCircle size={12}/> Đang trò chuyện ({activeChats.length})
                            </p>
                            {activeChats.length === 0 && <p className="text-xs text-gray-400 px-4 italic">Chưa có cuộc hội thoại nào.</p>}
                            <div className="space-y-2">
                                {activeChats.map((chat) => (
                                    <div 
                                        key={chat.userId}
                                        onClick={() => handleSelectChat(chat)}
                                        className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all border ${
                                            activeUser === chat.userId 
                                            ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-200' 
                                            : 'bg-white border-gray-200 hover:bg-gray-100' }`}>
                                        <div className="relative">
                                            {chat.avatarUrl ? (
                                                <img src={getImageUrl(chat.avatarUrl)} alt="U" className="w-10 h-10 rounded-full object-cover"/>
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">{chat.fullName.charAt(0)}</div>
                                            )}
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className={`font-bold text-sm truncate ${activeUser === chat.userId ? 'text-blue-700' : 'text-gray-700'}`}>{chat.fullName}</h4>
                                            <p className="text-xs text-gray-500 truncate">ID: {chat.userId}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-orange-500 uppercase tracking-wider px-2 mb-2 flex items-center gap-2"> {/*danh sách chờ*/}
                                <AlertCircle size={12}/> Tin nhắn chờ({requests.length})
                            </p>
                            {requests.length === 0 && <p className="text-xs text-gray-400 px-4 italic">Không có yêu cầu mới.</p>}

                            <div className="space-y-2">
                                {requests.map((req) => (
                                    <div key={req.userId} className="bg-orange-50 p-3 rounded-xl border border-orange-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-white text-orange-600 flex items-center justify-center font-bold text-xs border border-orange-200">
                                                {req.fullName.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-gray-800 text-xs truncate">{req.fullName}</h4>
                                                <span className="text-[10px] text-gray-500">{formatTime(req.timestamp)}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleAcceptRequest(req)}
                                            className="w-full bg-orange-500 text-white text-xs py-1.5 rounded-lg font-bold hover:bg-orange-600 transition" >
                                            Tiếp nhận
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                <div className="flex-grow flex flex-col bg-white">
                    {activeUser && currentUserInfo ? (
                        <>
                            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white flex-shrink-0 shadow-sm z-10">
                                <div className="flex items-center gap-3">
                                    {currentUserInfo.avatarUrl ? (
                                        <img src={getImageUrl(currentUserInfo.avatarUrl)} alt="U" className="w-10 h-10 rounded-full object-cover border"/>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                            {currentUserInfo.fullName.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-base">{currentUserInfo.fullName}</h3>
                                        <span className="text-xs text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><Phone size={18}/></button>
                                    <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><MoreVertical size={18}/></button>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto p-6 bg-gray-50 space-y-4">
                                {currentMessages.map((msg, index) => (
                                    <div key={index} className={`flex w-full ${msg.sender === 'admin' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
                                        {msg.sender === 'system' ? (
                                            <span className="text-[11px] text-gray-500 bg-gray-200 px-3 py-1 rounded-full border border-gray-300">{msg.text}</span>
                                        ) : (
                                            <div className={`flex flex-col max-w-[70%] ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                                                <div 
                                                    className={`p-3 px-4 rounded-2xl text-sm shadow-sm leading-relaxed ${
                                                        msg.sender === 'admin' 
                                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none' }`} >
                                                    {msg.text}
                                                </div>
                                                <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium">
                                                    {formatTime(msg.timestamp || new Date())}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white flex items-center gap-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-grow p-3 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 border rounded-xl outline-none text-sm transition-all" />
                                <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-lg">
                                    <Send size={20} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-gray-300 bg-gray-50/50">
                            <Headset size={80} className="mb-6 text-gray-200"/>
                            <h3 className="text-lg font-bold text-gray-400">Sẵn sàng hỗ trợ</h3>
                            <p className="text-sm text-gray-400 mt-2">Chọn khách hàng từ danh sách để bắt đầu.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminLiveChat;