const pool = require('./db'); 

// lấy giá và loại vé
const getTicketPricingData = async () => {
    try {
        const result = await pool.query(`SELECT
                tt.name AS type_name, 
                tt.description,
                mtc.price,
                m.home_team || ' vs ' || m.away_team AS match_name, 
                m.start_time AS match_date
            FROM ticket_types tt
            JOIN match_ticket_configs mtc ON tt.id = mtc.ticket_type_id
            JOIN matches m ON mtc.match_id = m.id
            WHERE m.start_time > NOW() 
            ORDER BY m.start_time ASC
            LIMIT 3; `);
        return result.rows;
    } catch (e) {
        console.error("Lỗi giá vé:", e);
        return null;
    }
};

// lấy tt trận đấu sắp tới
const getUpcomingMatches = async () => {
    try {
        const result = await pool.query(`SELECT 
                home_team || ' vs ' || away_team AS match_name, 
                start_time, 
                league 
            FROM matches 
            WHERE start_time > NOW() 
            ORDER BY start_time ASC 
            LIMIT 3`);
        return result.rows;
    } catch (e) {
        console.error("Lỗi trận đấu:", e);
        return null;
    }
};

// lấy tt bảng faq
const getFaqData = async () => {
    try {
        const result = await pool.query("SELECT question, answer FROM faqs LIMIT 3");
        return result.rows;
    } catch (e) {
        console.error("Lỗi FAQ:", e);
        return null;
    }
};

// lấy tt bảng FAQ về tk và chính sách
const getAccountAndPolicyFAQs = async () => {
    try {
        const result = await pool.query(` SELECT question, answer FROM faqs 
            WHERE question ILIKE '%tài khoản%' OR question ILIKE '%mật khẩu%' OR question ILIKE '%chính sách%' OR question ILIKE '%quên%'
            LIMIT 5 `);
        return result.rows;
    } catch (e) {
        console.error("Lỗi", e);
        return null;
    }
};

// lấy tt sân vận động và khu vực
const getStadiumAndZoneInfo = async () => {
    try {
        const result = await pool.query(` SELECT s.name AS stadium_name, sz.zone_name, sz.description
            FROM stadiums s
            JOIN stadium_zones sz ON s.id = sz.stadium_id
            LIMIT 5 `);
        return result.rows;
    } catch (e) {
        console.error("Lỗi", e);
        return null;
    }
};

// lấy tt pttt
const getPaymentMethods = async () => {
    try {
        const result = await pool.query(`SELECT payment_method AS method_name 
            FROM payments 
            -- FIX: Xóa WHERE status = 'active' vì nó là lỗi ENUM. 
            -- Chúng ta sẽ lấy TẤT CẢ các phương thức đã được sử dụng
            GROUP BY payment_method
            LIMIT 5 `);
        return result.rows;
    } catch (e) {
        console.error("Lỗi Thanh toán:", e);
        return null;
    }
};

// lấy tt chính sách hủy vé
const getTicketCancellationPolicy = async () => {
    try {
        const result = await pool.query(` SELECT question, answer FROM faqs 
            WHERE question ILIKE '%hủy vé%' OR question ILIKE '%đổi vé%' OR question ILIKE '%hoàn tiền%'
            LIMIT 3 `);
        return result.rows;
    } catch (e) {
        console.error("Lỗi Chính sách Hủy vé:", e);
        return null;
    }
};
//lưu ls chat
const saveChatMessage = async (userId, sender, messageText, topic = 'general') => {
    //check
    let userMessage = null;
    let botMessage = null;

    if (sender === 'user') {
        userMessage = messageText;
    } else if (sender === 'ai') {
        botMessage = messageText;
    }

    if (!userMessage && !botMessage) {
        console.warn("Lỗi: Sender không hợp lệ. Không lưu tin nhắn.");
        return null;
    }

    try {
        const result = await pool.query(
            `INSERT INTO chat_history (user_id, message_user, message_bot, topic) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [userId, userMessage, botMessage, topic]
        );
        return result.rows[0];
    } catch (e) {
        console.error("Lỗi lưu lịch sử chat:", e); 
        return null; 
    }
};

//lấy ct các loại vé trong đh
const getOrderItems = async (orderId) => {
    try {
        //lấy tt vé trong đơn hàng
        const result = await pool.query( `SELECT 
                oi.quantity,
                mtc.price,
                tt.name AS ticket_type_name
            FROM order_items oi
            JOIN match_ticket_configs mtc ON oi.match_config_id = mtc.id
            JOIN ticket_types tt ON mtc.ticket_type_id = tt.id
            WHERE oi.order_id = $1`,  [orderId] );
        return result.rows;
    } catch (e) {
        console.error(`Lỗi chi tiết đơn hàng ID ${orderId}:`, e);
        return null; 
    }
};

const getUserInfo = async (userId) => {
    try {
        const result = await pool.query(
            "SELECT full_name, avatar_url FROM users WHERE id = $1", 
            [userId]
        );
        return result.rows[0];
    } catch (e) {
        console.error(`Lỗi lấy info user ${userId}:`, e);
        return null;
    }
};


module.exports = { 
    getTicketPricingData, 
    getUpcomingMatches, 
    getFaqData, 
    getAccountAndPolicyFAQs, 
    getStadiumAndZoneInfo, 
    getPaymentMethods,
    getTicketCancellationPolicy,
    saveChatMessage, 
    getOrderItems,
    getUserInfo 
};