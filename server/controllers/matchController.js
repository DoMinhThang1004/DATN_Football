const pool = require('../db');

//lấy danh sách trận đấu
const getAllMatches = async (req, res) => {
  try {
    const query = `
      SELECT m.*, s.name as stadium_name 
      FROM matches m
      LEFT JOIN stadiums s ON m.stadium_id = s.id
      ORDER BY m.start_time ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

//lấy chi tiế t trận đấu theo id
const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT m.*, s.name as stadium_name, s.location as stadium_location
      FROM matches m
      LEFT JOIN stadiums s ON m.stadium_id = s.id
      WHERE m.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Không tìm thấy trận đấu!" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

//tạo mới trận đấu
const createMatch = async (req, res) => {
  try {
    const { 
      home_team, away_team, home_logo, away_logo, 
      stadium_id, start_time, status, total_tickets, league, banner_url //đã thêm banner_url vô cho trận đấu
    } = req.body;

    const newMatch = await pool.query(
      `INSERT INTO matches (home_team, away_team, home_logo, away_logo, stadium_id, start_time, status, total_tickets, league, banner_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [home_team, away_team, home_logo, away_logo, stadium_id, start_time, status, total_tickets, league, banner_url]
    );
    
    res.json(newMatch.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

//cập nhật trận đấu
const updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      home_team, away_team, home_logo, away_logo, 
      stadium_id, start_time, status, total_tickets, league, banner_url 
    } = req.body;

    await pool.query(
      `UPDATE matches SET 
        home_team = $1, away_team = $2, home_logo = $3, away_logo = $4, 
        stadium_id = $5, start_time = $6, status = $7, total_tickets = $8, league = $9, banner_url = $10
       WHERE id = $11`,
      [home_team, away_team, home_logo, away_logo, stadium_id, start_time, status, total_tickets, league, banner_url, id]
    );
    
    res.json("Cập nhật thành công!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

// xóa trận đấu
const deleteMatch = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    await client.query(`DELETE FROM tickets WHERE match_config_id IN (SELECT id FROM match_ticket_configs WHERE match_id = $1)`, [id]);
    await client.query('DELETE FROM match_ticket_configs WHERE match_id = $1', [id]);
    await client.query('DELETE FROM comments WHERE match_id = $1', [id]);
    await client.query('DELETE FROM matches WHERE id = $1', [id]);

    await client.query('COMMIT');
    res.json("Xóa thành công!");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Lỗi xóa trận đấu:", err.message);
    if (err.message.includes('foreign key constraint')) {
        res.status(400).json({ message: "Không thể xóa trận đấu này vì đã có vé/đơn hàng liên quan!" });
    } else {
        res.status(500).send('Lỗi Server: ' + err.message);
    }
  } finally {
    client.release();
  }
};

module.exports = { getAllMatches, getMatchById, createMatch, updateMatch, deleteMatch };