const pool = require('../db');

//lấy ds bình luận theo trận đấu
const getCommentsByMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    //dùng left join để lấy tên tk nếu bị xóa tk thì cmt vẫn hiện với tên ẩn danh
    const query = `
      SELECT c.id, c.content, c.rating, c.status, c.admin_reply, c.created_at,
             COALESCE(u.full_name, 'Người dùng ẩn danh') as full_name, 
             u.avatar_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.match_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query, [matchId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi lấy comment theo trận:", err.message);
    res.status(500).send('Lỗi Server');
  }
};

//tạo bình luận mới
const createComment = async (req, res) => {
  try {
    const { user_id, match_id, content, rating } = req.body;
    console.log("Nhận bình luận mới:", req.body); 

    //trạng thái mặc định để duyệt
    const status = 'APPROVED'; 

    //thêm cmt vào database
    const newComment = await pool.query(
      `INSERT INTO comments (user_id, match_id, content, rating, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, match_id, content, rating || 5, status]
    );

    //lấy thông tin tk và cmt để trả về fontend
    const commentWithUser = await pool.query(
        `SELECT c.id, c.content, c.rating, c.status, c.admin_reply, c.created_at,
                COALESCE(u.full_name, 'Người dùng ẩn danh') as full_name, 
                u.avatar_url 
         FROM comments c 
         LEFT JOIN users u ON c.user_id = u.id 
         WHERE c.id = $1`, 
        [newComment.rows[0].id]
    );

    res.json(commentWithUser.rows[0]);
  } catch (err) {
    console.error("Lỗi tạo comment:", err.message);
    res.status(500).send('Lỗi Server: ' + err.message);
  }
};

//lấy all cmt cho admin duyệt
const getAllComments = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.id, c.content, c.status, c.created_at, c.admin_reply,
                COALESCE(u.full_name, 'Người dùng đã xóa') as user_name, 
                u.avatar_url,
                COALESCE(m.home_team, 'Trận đã xóa') as home_team, 
                COALESCE(m.away_team, '') as away_team
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN matches m ON c.match_id = m.id
            ORDER BY c.created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Lỗi lấy tất cả comment:", err.message);
        res.status(500).send('Lỗi Server');
    }
};

//cập nhật bình luận duyệt hoặc trả lời
const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_reply } = req.body;

        if (admin_reply !== undefined) {
             await pool.query(
                'UPDATE comments SET admin_reply = $1, status = $2 WHERE id = $3', 
                [admin_reply, 'APPROVED', id]
            );
        } else if (status) {
            await pool.query('UPDATE comments SET status = $1 WHERE id = $2', [status, id]);
        }
        
        res.json({ message: "Cập nhật thành công!" });
    } catch (err) {
        console.error("Lỗi update comment:", err.message);
        res.status(500).send('Lỗi Server');
    }
};

// xóa cmt
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM comments WHERE id = $1', [id]);
        res.json({ message: "Đã xóa!" });
    } catch (err) {
        console.error("Lỗi xóa comment:", err.message);
        res.status(500).send('Lỗi Server');
    }
};

module.exports = { 
    getCommentsByMatch, 
    createComment, 
    getAllComments, 
    updateComment, 
    deleteComment 
};