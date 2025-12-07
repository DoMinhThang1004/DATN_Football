const pool = require('./db'); 

// lấy giá vé và loại vé
const getTicketPricingData = async () => {
    try {
        const result = await pool.query(`
            SELECT
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
            LIMIT 3;
        `);
        return result.rows;
    } catch (e) {
        console.error("Lỗi query giá vé:", e);
        return null;
    }
};

// lấy tt trận đấu sắp tới
const getUpcomingMatches = async () => {
    try {
        const result = await pool.query(`
            SELECT 
                home_team || ' vs ' || away_team AS match_name, 
                start_time, 
                league 
            FROM matches 
            WHERE start_time > NOW() 
            ORDER BY start_time ASC 
            LIMIT 3
        `);
        return result.rows;
    } catch (e) {
        console.error("Lỗi query trận đấu:", e);
        return null;
    }
};

// lấy tt bảng FAQ chung
const getFaqData = async () => {
    try {
        const result = await pool.query("SELECT question, answer FROM faqs LIMIT 3");
        return result.rows;
    } catch (e) {
        console.error("Lỗi query FAQ:", e);
        return null;
    }
};

// lấy tt bảng FAQ về tài khoản và chính sách
const getAccountAndPolicyFAQs = async () => {
    try {
        const result = await pool.query(`
            SELECT question, answer FROM faqs 
            WHERE question ILIKE '%tài khoản%' OR question ILIKE '%mật khẩu%' OR question ILIKE '%chính sách%' OR question ILIKE '%quên%'
            LIMIT 5
        `);
        return result.rows;
    } catch (e) {
        console.error("Lỗi query Account/Policy FAQs:", e);
        return null;
    }
};

// lấy tt bảng sân vận động và khu vực
const getStadiumAndZoneInfo = async () => {
    try {
        const result = await pool.query(`
            SELECT s.name AS stadium_name, sz.zone_name, sz.description
            FROM stadiums s
            JOIN stadium_zones sz ON s.id = sz.stadium_id
            LIMIT 5
        `);
        return result.rows;
    } catch (e) {
        console.error("Lỗi query Sân vận động:", e);
        return null;
    }
};

// lấy tt phương thức thanh toán
const getPaymentMethods = async () => {
    try {
        const result = await pool.query(`
            SELECT payment_method AS method_name 
            FROM payments 
            -- FIX: Xóa WHERE status = 'active' vì nó là lỗi ENUM. 
            -- Chúng ta sẽ lấy TẤT CẢ các phương thức đã được sử dụng
            GROUP BY payment_method
            LIMIT 5
        `);
        return result.rows;
    } catch (e) {
        console.error("Lỗi query Thanh toán:", e);
        return null;
    }
};

// lấy tt chính sách hủy vé
const getTicketCancellationPolicy = async () => {
    try {
        const result = await pool.query(`
            SELECT question, answer FROM faqs 
            WHERE question ILIKE '%hủy vé%' OR question ILIKE '%đổi vé%' OR question ILIKE '%hoàn tiền%'
            LIMIT 3
        `);
        return result.rows;
    } catch (e) {
        console.error("Lỗi query Chính sách Hủy vé:", e);
        return null;
    }
};
//lưu lịch sử chat
const saveChatMessage = async (userId, sender, messageText, topic = 'general') => {
    
    //check để lưu đúng cột
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

//lấy chi tiết các loại vé trong đơn hàng
const getOrderItems = async (orderId) => {
    try {
        //đc sử dụng khi kh cần nhêìu tt
        //lấy tt vé trong đơn hàng
        const result = await pool.query(
            `SELECT 
                oi.quantity,
                mtc.price,
                tt.name AS ticket_type_name
            FROM order_items oi
            JOIN match_ticket_configs mtc ON oi.match_config_id = mtc.id
            JOIN ticket_types tt ON mtc.ticket_type_id = tt.id
            WHERE oi.order_id = $1`,
            [orderId]
        );
        return result.rows;
    } catch (e) {
        console.error(`Lỗi truy vấn chi tiết đơn hàng ID ${orderId}:`, e);
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