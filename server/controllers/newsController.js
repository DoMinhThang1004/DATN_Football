const pool = require('../db'); 

// lấy ds tin tức
const getAllNews = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, title, image_url, published_date, 
            LEFT(content, 200) as summary, author_id
            FROM news 
            WHERE status = 'published' OR status = 'draft'
            ORDER BY published_date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Lỗi khi lấy danh sách tin tức:", err);
        res.status(500).send("Lỗi Server: Không thể tải danh sách tin tức.");
    }
};

// lấy chi tiết tin tức theo id
const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM news WHERE id = $1", [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).send("Không tìm thấy tin tức");
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Lỗi khi lấy chi tiết tin tức:", err);
        res.status(500).send("Lỗi Server");
    }
};

// thêm tin tức
const createNews = async (req, res) => {
    try {
        // nhập dl từ form ad
        const { title, content, image_url, author_id, status } = req.body; 
        
        // chèn vào db
        const newNews = await pool.query(
            `INSERT INTO news (title, content, image_url, published_date, author_id, status)
             VALUES ($1, $2, $3, NOW(), $4, $5) RETURNING *`,
            [title, content, image_url, author_id, status || 'draft']
        );

        res.status(201).json(newNews.rows[0]);
    } catch (err) {
        console.error("Lỗi khi tạo tin tức mới:", err);
        res.status(500).send("Lỗi Server: Không thể tạo tin tức mới.");
    }
};

// cập nhật tin tức
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
            return res.status(404).send("Không tìm thấy tin tức để cập nhật");
        }
        res.json(updatedNews.rows[0]);

    } catch (err) {
        console.error("Lỗi khi cập nhật tin tức:", err);
        res.status(500).send("Lỗi Server: Cập nhật tin tức thất bại.");
    }
};

// xóa
const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedNews = await pool.query("DELETE FROM news WHERE id = $1 RETURNING id", [id]);

        if (deletedNews.rows.length === 0) {
            return res.status(404).send("Không tìm thấy tin tức để xóa");
        }
        res.status(204).send(); 

    } catch (err) {
        console.error("Lỗi khi xóa tin tức:", err);
        res.status(500).send("Lỗi Server: Xóa tin tức thất bại.");
    }
};

module.exports = { getAllNews, getNewsById, createNews, updateNews, deleteNews };