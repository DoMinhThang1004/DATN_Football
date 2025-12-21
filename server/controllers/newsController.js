const pool = require('../db'); 

// 1. Lấy danh sách tin tức (Tính toán summary tự động từ content)
const getAllNews = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                n.id, 
                n.title, 
                n.image_url, 
                n.published_date as created_at, 
                n.status,
                n.author_id,
                u.full_name as author,
                LEFT(n.content, 200) as summary
            FROM news n
            LEFT JOIN users u ON n.author_id = u.id
            ORDER BY n.published_date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Lỗi khi lấy danh sách tin tức:", err);
        res.status(500).json({ message: "Lỗi Server: Không thể tải danh sách tin tức." });
    }
};

// 2. Lấy chi tiết tin tức theo ID
const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT n.*, u.full_name as author 
            FROM news n 
            LEFT JOIN users u ON n.author_id = u.id 
            WHERE n.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy tin tức" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Lỗi khi lấy chi tiết tin tức:", err);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 3. Thêm tin tức mới (Đã loại bỏ cột summary và category nếu chưa có trong DB)
const createNews = async (req, res) => {
    try {
        const { title, content, image_url, author_id, status } = req.body; 
        
        // Chỉ chèn vào các cột chắc chắn tồn tại trong DB của bạn
        const newNews = await pool.query(
            `INSERT INTO news (title, content, image_url, published_date, author_id, status)
             VALUES ($1, $2, $3, NOW(), $4, $5) RETURNING *`,
            [title, content, image_url, author_id, status || 'draft']
        );

        res.status(201).json(newNews.rows[0]);
    } catch (err) {
        console.error("Lỗi khi tạo tin tức mới:", err);
        res.status(500).json({ message: "Lỗi Server: Không thể tạo tin tức mới." });
    }
};

// 4. Cập nhật toàn bộ bài viết (Đã loại bỏ cột summary và category)
const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, image_url, status } = req.body; 

        const updatedNews = await pool.query(
            `UPDATE news 
             SET title = $1, content = $2, image_url = $3, status = $4
             WHERE id = $5 RETURNING *`,
            [title, content, image_url, status, id]
        );

        if (updatedNews.rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy tin tức để cập nhật" });
        }
        res.json(updatedNews.rows[0]);

    } catch (err) {
        console.error("Lỗi khi cập nhật tin tức:", err);
        res.status(500).json({ message: "Lỗi Server: Cập nhật tin tức thất bại." });
    }
};

// 5. Cập nhật TRẠNG THÁI (Dành riêng cho nút Toggle ngoài danh sách)
const updateNewsStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        const result = await pool.query(
            "UPDATE news SET status = $1 WHERE id = $2 RETURNING status",
            [status.toLowerCase(), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy tin tức" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Lỗi khi cập nhật trạng thái tin tức:", err);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 6. Xóa tin tức
const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNews = await pool.query("DELETE FROM news WHERE id = $1 RETURNING id", [id]);

        if (deletedNews.rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy tin tức để xóa" });
        }
        res.status(200).json({ message: "Xóa tin tức thành công" }); 

    } catch (err) {
        console.error("Lỗi khi xóa tin tức:", err);
        res.status(500).json({ message: "Lỗi Server: Xóa tin tức thất bại." });
    }
};

module.exports = { 
    getAllNews, 
    getNewsById, 
    createNews, 
    updateNews, 
    updateNewsStatus, 
    deleteNews 
};