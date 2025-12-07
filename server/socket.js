const { GoogleGenAI } = require('@google/genai'); 

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

//khởi động lưu phiên người dùng và admin
const userSessions = new Map(); 
const activeAdmins = new Map();   

const { 
    getTicketPricingData, 
    getUpcomingMatches, 
    getFaqData, 
    getAccountAndPolicyFAQs, 
    getStadiumAndZoneInfo, 
    getPaymentMethods,
    getTicketCancellationPolicy,
    saveChatMessage,
    getUserInfo 
} = require('./dbQuerySocket'); 

module.exports = (io) => {
    
    io.on('connection', (socket) => {
        //lấy id kh từ fontend gửi
        //grontend gửi: io(URL, query: userId: ...
        const queryUserId = socket.handshake.query.userId;
        const currentUserId = queryUserId || `anon_${socket.id}`;

        console.log(`User connected: ${currentUserId} (Socket: ${socket.id})`);
        
        //tạo session
        if (!userSessions.has(currentUserId)) {
            userSessions.set(currentUserId, { 
                socketId: socket.id, 
                mode: 'AI', 
                agentId: null, 
                userInfo: null 
            });
        } else {
            //cập nahật socketId nếu refresh 
            const session = userSessions.get(currentUserId);
            session.socketId = socket.id;
            userSessions.set(currentUserId, session);
        }

        //admin kết nối
        socket.on('admin_connect', (adminData) => {
            activeAdmins.set(adminData.userId, socket.id);
            console.log(`Admin connected: ${adminData.userId}`);

            //gửi lại ds đang chờ
            userSessions.forEach((session, uId) => {
                if (session.mode === 'PENDING') {
                    socket.emit('new_live_request', { 
                        userId: uId, 
                        fullName: session.userInfo?.full_name || `Khách ${uId}`,
                        avatarUrl: session.userInfo?.avatar_url,
                        message: `Khách hàng đang chờ hỗ trợ (Đồng bộ).`,
                        timestamp: new Date()
                    });
                }
            });
        });

        socket.on('accept_live_request', (data) => {
            const { userId } = data; 
            const agentId = 100;
            
            if (userSessions.has(userId)) {
                const session = userSessions.get(userId);
                session.mode = 'LIVE';
                session.agentId = agentId;
                session.agentSocketId = socket.id;
                userSessions.set(userId, session);

                io.to(session.socketId).emit('ai_response', `Nhân viên hỗ trợ đã kết nối. Chúng tôi sẵn sàng hỗ trợ bạn.`);
            }
        });
        
        socket.on('send_live_message_to_user', async (data) => {
            const { userId, message } = data; 
            if (userSessions.has(userId)) {
                const session = userSessions.get(userId);
                io.to(session.socketId).emit('ai_response', message); 
                await saveChatMessage(userId, 'ai', message); 
            }
        });

        //client chat gửi 
        socket.on('send_ai_prompt', async (prompt) => {
            const userSession = userSessions.get(currentUserId);
            
            // nếu chat tt thì gửi admin
            if (userSession && userSession.mode === 'LIVE') {
                if (userSession.agentSocketId) {
                     io.to(userSession.agentSocketId).emit('live_message_from_user', {
                        userId: currentUserId,
                        message: prompt
                    });
                    await saveChatMessage(currentUserId, 'user', prompt); 
                } else {
                    socket.emit('ai_response', "Nhân viên đã thoát. Chuyển về chế độ AI.");
                    userSession.mode = 'AI'; 
                }
                return; 
            }
            
            // yêu cầu chat vs ad
            const normalizedPrompt = prompt.toLowerCase();
            if (normalizedPrompt.includes('nhân viên') || normalizedPrompt.includes('hỗ trợ trực tiếp') || normalizedPrompt.includes('gặp người')) {
                userSession.mode = 'PENDING';
                
                //lấy tt ng dùng chat
                let userName = `Khách ${currentUserId}`;
                let userAvatar = null;

                //nếu ko phải guest thì lấy tt
                if (!String(currentUserId).startsWith('guest_')) {
                    const info = await getUserInfo(currentUserId);
                    if (info) {
                        userName = info.full_name;
                        userAvatar = info.avatar_url;
                    }
                }
                
                userSession.userInfo = { full_name: userName, avatar_url: userAvatar };
                userSessions.set(currentUserId, userSession);

                // gửi tb cho all ad
                activeAdmins.forEach((socketId) => {
                    io.to(socketId).emit('new_live_request', { 
                        userId: currentUserId, 
                        fullName: userName,
                        avatarUrl: userAvatar,
                        message: `Khách hàng ${userName} yêu cầu hỗ trợ.`,
                        timestamp: new Date()
                    });
                });
                
                socket.emit('ai_response', "Đã gửi yêu cầu. Đang chờ nhân viên...");
                await saveChatMessage(currentUserId, 'user', prompt);
                return; 
            }

            // chat với ai
            try {
                if (!prompt || typeof prompt !== 'string' || prompt.length > 1000) {
                     return socket.emit('ai_error', "Tin nhắn không hợp lệ.");
                }
                await saveChatMessage(currentUserId, 'user', prompt); 

                const intentMap = [
                    { keywords: ['giá vé', 'loại vé', 'mua vé', 'bao nhiêu tiền'], handler: getTicketPricingData },
                    { keywords: ['trận đấu', 'lịch thi đấu', 'khi nào đá', 'sắp tới'], handler: getUpcomingMatches },
                    { keywords: ['hủy vé', 'đổi vé', 'hoàn tiền'], handler: getTicketCancellationPolicy }, 
                    { keywords: ['faq', 'hỏi đáp', 'thường gặp'], handler: getFaqData },
                    { keywords: ['tài khoản', 'mật khẩu', 'quên', 'đăng nhập'], handler: getAccountAndPolicyFAQs },
                    { keywords: ['sân', 'khu vực', 'chỗ ngồi', 'cửa'], handler: getStadiumAndZoneInfo },
                    { keywords: ['thanh toán', 'chuyển khoản', 'visa', 'momo'], handler: getPaymentMethods },
                ];

                let contextData = null;
                for (const intent of intentMap) {
                    if (intent.keywords.some(keyword => normalizedPrompt.includes(keyword))) {
                        contextData = await intent.handler(); 
                        break; 
                    }
                }

                let finalPrompt = prompt;
                if (contextData && contextData.length > 0) {
                    finalPrompt = `Dựa trên dữ liệu: ${JSON.stringify(contextData, null, 2)}. Trả lời câu hỏi: "${prompt}"`;
                }

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
                });

                await saveChatMessage(currentUserId, 'ai', response.text);
                socket.emit('ai_response', response.text);
                
            } catch (error) {
                console.error("AI Error:", error);
                let msg = "Lỗi hệ thống AI.";
                if (error.status === 429) msg = "Hệ thống đang bận (Quota limit). Vui lòng thử lại sau.";
                socket.emit('ai_error', msg);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Disconnected: ${socket.id}`);
            activeAdmins.forEach((sid, uid) => {
                if (sid === socket.id) activeAdmins.delete(uid);
            });
        });
    });
};