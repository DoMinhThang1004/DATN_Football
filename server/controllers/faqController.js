const pool = require('../db');

//lấy danh sách FAQ
const getFaqs = async (req, res) => {
    try {
        //truy vấn tất cả fqa từ dl
        const result = await pool.query("SELECT id, question, answer FROM faqs ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("Lỗi khi lấy FAQs:", err);
        res.status(500).send("Lỗi Server: Không thể tải câu hỏi thường gặp.");
    }
};

module.exports = { getFaqs };