const pool = require('../db');

//lấy ds vé của ng dùng
const getMyTickets = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT 
        t.id, 
        t.status, 
        t.qr_code_string,
        t.seat_number,
        m.home_team, 
        m.away_team, 
        m.start_time, 
        m.home_logo,
        s.name as stadium_name,
        tt.name as ticket_type,
        mtc.price,
        sz.zone_name  -- Lấy tên từ bảng stadium_zones thay vì mtc
      FROM tickets t
      JOIN orders o ON t.order_id = o.id
      LEFT JOIN match_ticket_configs mtc ON t.match_config_id = mtc.id
      LEFT JOIN stadium_zones sz ON mtc.stadium_zone_id = sz.id  -- JOIN thêm bảng này
      LEFT JOIN matches m ON mtc.match_id = m.id
      LEFT JOIN stadiums s ON m.stadium_id = s.id
      LEFT JOIN ticket_types tt ON mtc.ticket_type_id = tt.id
      WHERE o.user_id = $1
      ORDER BY t.id DESC
    `;
    
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi lấy vé:", err.message);
    res.status(500).send('Lỗi Server: ' + err.message);
  }
};

//lấy chi tiết vé
const getTicketDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        t.id, t.status, t.qr_code_string, t.seat_number,
        m.home_team, m.away_team, m.start_time, s.name as stadium_name,
        tt.name as ticket_type, mtc.price, 
        sz.zone_name
      FROM tickets t
      JOIN orders o ON t.order_id = o.id
      LEFT JOIN match_ticket_configs mtc ON t.match_config_id = mtc.id
      LEFT JOIN stadium_zones sz ON mtc.stadium_zone_id = sz.id
      LEFT JOIN matches m ON mtc.match_id = m.id
      LEFT JOIN stadiums s ON m.stadium_id = s.id
      LEFT JOIN ticket_types tt ON mtc.ticket_type_id = tt.id
      WHERE t.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return res.status(404).json({message: "Không tìm thấy vé"});
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

//lấy ds ghế đã bán
const getOccupiedSeats = async (req, res) => {
  try {
    const { configId } = req.params;
    const query = `
      SELECT seat_number FROM tickets 
      WHERE match_config_id = $1 
      AND status IN ('VALID', 'USED')
    `;
    const result = await pool.query(query, [configId]);
    const seats = result.rows.map(row => row.seat_number);
    res.json(seats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

module.exports = { getMyTickets, getTicketDetail, getOccupiedSeats };