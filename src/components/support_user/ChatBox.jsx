import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X, Headset, User, Zap, ChevronsRight, Headphones } from 'lucide-react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000'; 
let socket;

const ChatBox = ({ 
    userFullName = "Quý Khách", 
    userId = null,
    initialPrompt = "Xin chào, tôi có thể giúp gì cho bạn?" 
}) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [faqSuggestions, setFaqSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(true); 
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const personalizedPrompt = `Chào ${userFullName}! Tôi là trợ lý AI FootballTic. Bạn cần hỗ trợ về vé, lịch đấu, chính sách hay thông tin nào khác?`;

    // gọi faq
    const fetchFaqSuggestions = async () => {
        try {
            const res = await fetch(`${SOCKET_SERVER_URL}/api/faqs`); 
            if (res.ok) {
                const data = await res.json();
                setFaqSuggestions(data.slice(0, 3)); 
            }
        } catch (e) {
            console.error("gọi api lỗi", e);
        }
    };

    //kết nối socket
    useEffect(() => {
        if (!isOpen) return; 

        //xác định id kết nối
        let connectionId = userId;
        if (!connectionId) {
            // mỗi khách là mỗi tab riêng
            let guestId = sessionStorage.getItem('guest_chat_id');
            if (!guestId) {
                guestId = `guest_${Math.floor(Math.random() * 1000000)}`;
                sessionStorage.setItem('guest_chat_id', guestId);
            }
            connectionId = guestId;
        }

        // khởi tạo socket nếu chưa có
        if (!socketRef.current) {
            console.log(">> ChatBox: Connecting with ID:", connectionId);
            socketRef.current = io(SOCKET_SERVER_URL, {
                query: { userId: connectionId },
                reconnection: true,
            });
        }
        const socket = socketRef.current;

        // nghe
        const aiResponseHandler = (response) => {
            setMessages(prev => [...prev, { sender: 'ai', text: response }]);
        };
        const aiErrorHandler = (error) => {
             setMessages(prev => [...prev, { sender: 'ai', text: `[LỖI] ${error}` }]);
        };

        socket.on('ai_response', aiResponseHandler);
        socket.on('ai_error', aiErrorHandler);

        //tin nhắn chào
        if (messages.length === 0) {
            setMessages([{ sender: 'ai', text: personalizedPrompt }]);
        }

        fetchFaqSuggestions(); 
        return () => {
            socket.off('ai_response', aiResponseHandler);
            socket.off('ai_error', aiErrorHandler);
        };

    }, [isOpen, userId]); 

    //tự động scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // hàm gửi tn chung
    const sendMessage = (text) => {
        if (!socketRef.current) return;
        setMessages(prev => [...prev, { sender: 'user', text: text }]);
        socketRef.current.emit('send_ai_prompt', text);
        setInput('');
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (input.trim() === '') return;
        sendMessage(input.trim());
    };
    
    // xử lý khi ng dùng click vào nút faq
    const handleFaqClick = (questionText) => {
        sendMessage(questionText);
        setShowSuggestions(false); 
    };

    // yêu cầu chat vs nhân viên
    const handleRequestLiveSupport = () => {
        // gửi keyword đặc biệt để sv nhận diện
        const requestMessage = "Tôi muốn gặp nhân viên hỗ trợ trực tiếp.";
        sendMessage(requestMessage);
        setShowSuggestions(false);
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-xl hover:bg-blue-700 transition-transform z-40">
                <MessageCircle size={28} />
            </button>
            {isOpen && (
                <div className="fixed bottom-20 right-6 w-96 h-[550px] bg-white rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden">
                    <div className="bg-blue-700 text-white p-3 flex-shrink-0 shadow-md">
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <Headset size={20} className='text-yellow-300 min-w-[20px]'/>
                                <span className="font-bold text-lg">FootballTic Hỗ Trợ</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="opacity-80 hover:opacity-100 transition"><X size={20} /></button>
                        </div>
                        <p className="text-xs text-blue-200 border-t border-blue-600 pt-1 mt-1">
                            Trợ lý trực tuyến • Luôn luôn hỗ trợ bạn!
                        </p>
                    </div>
                    <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, index) => (
                            <div 
                                key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`} >
                                <div className='flex items-end gap-2'>
                                    {msg.sender === 'ai' && <Headset size={16} className='text-gray-400 min-w-[16px]'/>} 
                                    <div className={`max-w-[85%] p-3 rounded-xl text-sm shadow-sm ${
                                        msg.sender === 'user' 
                                        ? 'bg-blue-500 text-white rounded-br-none order-1' 
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none order-1'
                                    }`}>
                                        {msg.text}
                                    </div>
                                    {msg.sender === 'user' && <User size={16} className='text-blue-500 min-w-[16px] order-2'/>}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {showSuggestions && (
                        <div className="bg-white p-3 border-t border-gray-200 flex-shrink-0 space-y-3">
                            
                            {/* nút chat vs nhân viên*/}
                            <button 
                                onClick={handleRequestLiveSupport}
                                className="w-full flex items-center justify-center gap-2 bg-orange-100 text-orange-700 p-2 rounded-lg hover:bg-orange-200 transition-colors font-semibold text-xs border border-orange-200">
                                <Headphones size={14} /> Gặp Nhân Viên Hỗ Trợ
                            </button>

                            {/*gợi ts faq*/}
                            <div>
                                <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center justify-between">
                                    <span className='flex items-center gap-1'><Zap size={14} className="text-yellow-500"/> Gợi ý Nhanh</span>
                                    <button onClick={() => setShowSuggestions(false)} className='text-gray-400 hover:text-gray-600 text-xs'>
                                        X
                                    </button>
                                </p>
                                <div className="space-y-2 max-h-24 overflow-y-auto">
                                    {faqSuggestions.map((faq) => (
                                        <button
                                            key={faq.id} onClick={() => handleFaqClick(faq.question)}
                                            className="w-full text-left flex items-center text-xs text-blue-600 bg-blue-50/70 p-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200/50">
                                            <ChevronsRight size={12} className="mr-1 min-w-[12px]"/> 
                                            <span className='line-clamp-1'>{faq.question}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSend} className="p-3 border-t bg-white flex flex-shrink-0">
                        {!showSuggestions && (
                            <button 
                                type="button" onClick={() => setShowSuggestions(true)}
                                className='p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition mr-2' title='Hiện gợi ý'>
                                <Zap size={20}/>
                            </button>
                        )}
                        
                        <input 
                            type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Gửi câu hỏi..."
                            className={`flex-grow p-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm ${showSuggestions ? '' : 'rounded-r-none'}`}
                        />
                        <button 
                            type="submit" className={`bg-blue-600 text-white p-2 ml-2 rounded-lg hover:bg-blue-700 transition ${!showSuggestions ? '' : 'rounded-l-none'}`}>
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatBox;