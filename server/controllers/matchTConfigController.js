const pool = require('../db');

//cấu hình vé
const getByMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const query = `
      SELECT mtc.*, 
             tt.name as type_name, 
             tt.color_code,
             sz.zone_name
      FROM match_ticket_configs mtc
      JOIN ticket_types tt ON mtc.ticket_type_id = tt.id
      JOIN stadium_zones sz ON mtc.stadium_zone_id = sz.id
      WHERE mtc.match_id = $1
      ORDER BY mtc.price DESC
    `;
    const result = await pool.query(query, [matchId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

const getZones = async (req, res) => {
    try {
        const { matchId } = req.params;
        const query = `
            SELECT sz.* FROM stadium_zones sz
            JOIN matches m ON m.stadium_id = sz.stadium_id
            WHERE m.id = $1
        `;
        const result = await pool.query(query, [matchId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
};

// tạo mới
const create = async (req, res) => {
  try {
    const { match_id, ticket_type_id, stadium_zone_id, price, total_quantity } = req.body;
    
    //kiểm tra xem có trùng vé tại khu vực chưa
    const check = await pool.query(
        'SELECT * FROM match_ticket_configs WHERE match_id = $1 AND ticket_type_id = $2 AND stadium_zone_id = $3',
        [match_id, ticket_type_id, stadium_zone_id]
    );

    if (check.rows.length > 0) {
        return res.status(400).json({ message: "Đã có vé loại này ở khu vực này rồi!" });
    }

    const newConfig = await pool.query(
      `INSERT INTO match_ticket_configs (match_id, ticket_type_id, stadium_zone_id, price, quantity_allocated, quantity_sold) 
       VALUES ($1, $2, $3, $4, $5, 0) RETURNING *`,
      [match_id, ticket_type_id, stadium_zone_id, price, total_quantity]
    );
    res.json(newConfig.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server: ' + err.message);
  }
};

//cập nhật
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { ticket_type_id, stadium_zone_id, price, total_quantity } = req.body;

    //kiểm tra vé có trùng k
    const checkSold = await pool.query('SELECT quantity_sold FROM match_ticket_configs WHERE id = $1', [id]);
    if (checkSold.rows.length > 0) {
        const sold = checkSold.rows[0].quantity_sold;
        if (total_quantity < sold) {
            return res.status(400).json({ message: `Không thể giảm số lượng xuống dưới ${sold} vé (đã bán)!` });
        }
    }

    await pool.query(
      `UPDATE match_ticket_configs 
       SET ticket_type_id = $1, stadium_zone_id = $2, price = $3, quantity_allocated = $4
       WHERE id = $5`,
      [ticket_type_id, stadium_zone_id, price, total_quantity, id]
    );
    
    res.json("Cập nhật thành công!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

//xoá
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const checkSold = await pool.query('SELECT quantity_sold FROM match_ticket_configs WHERE id = $1', [id]);
    if (checkSold.rows.length > 0 && checkSold.rows[0].quantity_sold > 0) {
        return res.status(400).json({ message: "Không thể xóa vì đã có người mua!" }); // check
    }

    await pool.query('DELETE FROM match_ticket_configs WHERE id = $1', [id]);
    res.json("Xóa thành công!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

module.exports = { getByMatch, getZones, create, update, remove };