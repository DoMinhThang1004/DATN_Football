import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X, Headset, User, Zap, ChevronsRight, Headphones, Power } from 'lucide-react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'; 

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
    const [isLiveMode, setIsLiveMode] = useState(false);
    
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const personalizedPrompt = `Chào ${userFullName}!\nTôi là trợ lý AI FootballTic.\nBạn cần hỗ trợ về vé, lịch đấu, chính sách hay thông tin nào khác?`;

    // faq
    const fetchFaqSuggestions = async () => {
        try {
            const res = await fetch(`${SOCKET_SERVER_URL}/api/faqs`); 
            if (res.ok) {
                const data = await res.json();
                setFaqSuggestions(data.slice(0, 3)); 
            }
        } catch (e) {
            console.error("Lỗi gọi API FAQ:", e);
        }
    };

    // kn socket
    useEffect(() => {
        if (!isOpen) return; 

        let connectionId = userId;
        if (!connectionId) {
            let guestId = sessionStorage.getItem('guest_chat_id');
            if (!guestId) {
                guestId = `guest_${Math.floor(Math.random() * 1000000)}`;
                sessionStorage.setItem('guest_chat_id', guestId);
            }
            connectionId = guestId;
        }

        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        
        socketRef.current = io(SOCKET_SERVER_URL, {
            query: { userId: connectionId },
            reconnection: true,
        });

        const socket = socketRef.current;
        
        socket.on('connect', () => {
            socket.emit('join_room', connectionId);
        });

        const aiResponseHandler = (response) => {
            setMessages(prev => [...prev, { sender: 'ai', text: response }]);
        };
        
        const adminMsgHandler = (data) => {
             const text = data.message || data; 
             setIsLiveMode(true); 
             setMessages(prev => [...prev, { sender: 'admin', text: text }]);
        };

        socket.on('ai_response', aiResponseHandler);
        socket.on('receive_message_from_admin', adminMsgHandler);

        if (messages.length === 0) {
            setMessages([{ sender: 'ai', text: personalizedPrompt }]);
        }

        fetchFaqSuggestions(); 

        return () => {
            socket.off('ai_response', aiResponseHandler);
            socket.off('receive_message_from_admin', adminMsgHandler);
            socket.disconnect();
            socketRef.current = null;
        };

    }, [isOpen, userId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const renderMessageText = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => {
            const isListItem = /^\s*[\*\-]\s+/.test(line);
            const isNested = /^\s{2,}[\*\-]\s+/.test(line); 
            let content = line.replace(/^\s*[\*\-]\s+/, '');
            const parts = content.split(/\*\*(.*?)\*\*/g);
            const renderedParts = parts.map((part, index) => {
                if (index % 2 === 1) return <strong key={index} className="font-bold text-gray-900">{part}</strong>;
                return part;
            });
            if (!line.trim()) return <div key={i} className="h-2"></div>;
            return (
                <div key={i} className={`flex items-start ${isListItem ? 'mb-1' : 'mb-1.5'} ${isNested ? 'ml-5' : ''}`}>
                    {isListItem && <span className={`mr-2 flex-shrink-0 ${isNested ? 'text-gray-400 text-[10px] mt-1.5' : 'text-blue-500 font-bold mt-1'}`}>{isNested ? '○' : '•'}</span>}
                    <span className={`whitespace-pre-wrap leading-relaxed ${isListItem ? 'text-gray-700' : ''}`}>{renderedParts}</span>
                </div>
            );
        });
    };

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
    
    const handleFaqClick = (questionText) => {
        sendMessage(questionText);
        setShowSuggestions(false); 
    };

    const handleRequestLiveSupport = () => {
        const requestMessage = "Tôi muốn gặp nhân viên hỗ trợ.";
        setMessages(prev => [
            ...prev, 
            { sender: 'user', text: requestMessage }
        ]);
        if (socketRef.current) {
             socketRef.current.emit('send_ai_prompt', requestMessage);
        }
        setIsLiveMode(true); 
        setShowSuggestions(false);
    };

    // kt chat
    const endLiveChat = () => {
        if(socketRef.current) {
             socketRef.current.emit('end_live_chat');
        }
        
        setIsLiveMode(false);
        setMessages(prev => [...prev, { sender: 'ai', text: "Đã kết thúc phiên hỗ trợ. Bạn đang chat với Trợ lý AI." }]);
        setShowSuggestions(true);
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-yellow-500 text-white rounded-full p-4 shadow-xl hover:bg-yellow-700 transition-transform z-40">
                <MessageCircle size={28} />
            </button>
            {isOpen && (
                <div className="fixed bottom-20 right-6 w-96 h-[550px] bg-white rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden">
                   
                    <div className={`text-white p-3 flex-shrink-0 shadow-md transition-colors duration-300 ${isLiveMode ? 'bg-indigo-600' : 'bg-yellow-600'}`}>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                {isLiveMode ? <Headphones size={20} className='text-white'/> : <Headset size={20} className='text-white'/>}
                                <span className="font-bold text-lg">
                                    {isLiveMode ? "Hỗ trợ trực tuyến" : "FootballTic Bot"}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {isLiveMode && (
                                    <button 
                                        onClick={endLiveChat} 
                                        className="p-1 hover:bg-white/20 rounded-full transition text-red-100 hover:text-white"
                                        title="Kết thúc chat hỗ trợ">
                                        <Power size={18} />
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="opacity-80 hover:opacity-100 transition"><X size={20} /></button>
                            </div>
                        </div>
                        <p className="text-xs text-blue-100 border-t border-white/20 pt-1 mt-1 flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-green-400 animate-pulse' : 'bg-yellow-300'}`}></span>
                            {isLiveMode ? "Đang kết nối nhân viên" : "Trả lời tự động"}
                        </p>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, index) => (
                            <div 
                                key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`} >
                                <div className='flex items-end gap-2'>
                                    {msg.sender === 'ai' && <Headset size={16} className='text-gray-400 min-w-[16px]'/>} 
                                    {msg.sender === 'admin' && <Headphones size={16} className='text-indigo-500 min-w-[16px]'/>}
                                    
                                    <div className={`max-w-[85%] p-3 rounded-xl text-sm shadow-sm leading-relaxed ${
                                        msg.sender === 'user' 
                                        ? 'bg-blue-500 text-white rounded-br-none order-1' 
                                        : msg.sender === 'admin'
                                            ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-tl-none order-1'
                                            : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none order-1'
                                    }`}>
                                        {renderMessageText(msg.text)}
                                    </div>
                                    {msg.sender === 'user' && <User size={16} className='text-blue-500 min-w-[16px] order-2'/>}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {showSuggestions && !isLiveMode && (
                        <div className="bg-white p-3 border-t border-gray-200 flex-shrink-0 space-y-3">
                            <button 
                                onClick={handleRequestLiveSupport}
                                className="w-full flex items-center justify-center gap-2 bg-orange-100 text-orange-700 p-2 rounded-lg hover:bg-orange-200 transition-colors font-semibold text-xs border border-orange-200">
                                <Headphones size={14} /> Gặp Nhân Viên Hỗ Trợ
                            </button>
                              {/* <div className="space-y-2 max-h-24 overflow-y-auto">
                                    {faqSuggestions.map((faq) => (
                                        <button
                                            key={faq.id} onClick={() => handleFaqClick(faq.question)}
                                            className="w-full text-left flex items-center text-xs text-blue-600 bg-blue-50/70 p-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200/50">
                                            <ChevronsRight size={12} className="mr-1 min-w-[12px]"/> 
                                            <span className='line-clamp-1'>{faq.question}</span>
                                        </button>
                                    ))}
                                </div> */}
                        </div>
                    )}

                    <form onSubmit={handleSend} className="p-3 border-t bg-white flex flex-shrink-0">
                        {!showSuggestions && !isLiveMode && (
                            <button 
                                type="button" onClick={() => setShowSuggestions(true)}
                                className='p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition mr-2' title='Hiện gợi ý'>
                                <Zap size={20}/>
                            </button>
                        )}
                        
                        <input 
                            type="text" value={input} onChange={(e) => setInput(e.target.value)} 
                            placeholder={isLiveMode ? "Nhập tin nhắn..." : "Gửi câu hỏi..."}
                            className={`flex-grow p-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm ${(!showSuggestions && !isLiveMode) ? '' : 'rounded-l-lg'}`}/>
                        <button 
                            type="submit" className={`bg-blue-600 text-white p-2 ml-2 rounded-lg hover:bg-blue-700 transition`}>
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatBox;