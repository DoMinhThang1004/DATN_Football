const pool = require('../db');

// lấy cấu hình vé trd
const getByMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const query = ` SELECT mtc.*, tt.name as type_name, tt.color_code, sz.zone_name, sz.capacity as zone_capacity
            FROM match_ticket_configs mtc
            JOIN ticket_types tt ON mtc.ticket_type_id = tt.id
            JOIN stadium_zones sz ON mtc.stadium_zone_id = sz.id
            WHERE mtc.match_id = $1
            ORDER BY mtc.price DESC`;
        const result = await pool.query(query, [matchId]);
        res.json(result.rows);
    } catch (err) { console.error(err.message); res.status(500).send('Lỗi Server'); }
};

const getZones = async (req, res) => {
    try {
        const { matchId } = req.params;
        const query = `SELECT sz.* FROM stadium_zones sz
            JOIN matches m ON m.stadium_id = sz.stadium_id
            WHERE m.id = $1`;
        const result = await pool.query(query, [matchId]);
        res.json(result.rows);
    } catch (err) { console.error(err.message); res.status(500).send('Lỗi Server'); }
};

// kiểm tra sức chứa khi tạo hay cập nhật
const validateTicketQuantity = async (match_id, zone_id, new_quantity, exclude_config_id = null) => {
    // lấy tt khu vực để bt sức chứa
    const zoneRes = await pool.query('SELECT capacity, zone_name FROM stadium_zones WHERE id = $1', [zone_id]);
    if (zoneRes.rows.length === 0) return { valid: false, msg: "Khu vực không tồn tại" };
    
    const zoneMax = zoneRes.rows[0].capacity;
    const zoneName = zoneRes.rows[0].zone_name;

    //nhập quá thì lỗi
    if (new_quantity > zoneMax) {
        return { valid: false, msg: `Khu vực "${zoneName}" chỉ có tối đa ${zoneMax} ghế! Bạn đang nhập ${new_quantity}.` };
    }

    //kiểm tra sum vé trận đấu và tổng sức chứa
    const matchRes = await pool.query('SELECT total_tickets FROM matches WHERE id = $1', [match_id]);
    const matchMax = parseInt(matchRes.rows[0]?.total_tickets || 0);
    
    let query = 'SELECT SUM(quantity_allocated) as used FROM match_ticket_configs WHERE match_id = $1';
    let params = [match_id];
    if (exclude_config_id) { query += ' AND id != $2'; params.push(exclude_config_id); }
    
    const usedRes = await pool.query(query, params);
    const usedTickets = parseInt(usedRes.rows[0]?.used || 0);
    
    if (usedTickets + new_quantity > matchMax) {
        return { valid: false, msg: `Tổng vé vượt quá giới hạn toàn trận (${matchMax} vé)!` };
    }

    return { valid: true };
};

//thêm cấu hình vé mới
const create = async (req, res) => {
  try {
    const { match_id, ticket_type_id, stadium_zone_id, price, total_quantity } = req.body;
    
    // check trùng hay k
    const check = await pool.query('SELECT * FROM match_ticket_configs WHERE match_id = $1 AND ticket_type_id = $2 AND stadium_zone_id = $3', [match_id, ticket_type_id, stadium_zone_id]);
    if (check.rows.length > 0) return res.status(400).json({ message: "Vé này đã được tạo rồi!" });

    //soát sl vé
    const validation = await validateTicketQuantity(match_id, stadium_zone_id, parseInt(total_quantity));
    if (!validation.valid) return res.status(400).json({ message: validation.msg });

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

// cập nhật cấu hình vé
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { match_id, ticket_type_id, stadium_zone_id, price, total_quantity } = req.body;

    // check thử bán chưa
    const checkSold = await pool.query('SELECT quantity_sold, match_id FROM match_ticket_configs WHERE id = $1', [id]);
    if (checkSold.rows.length > 0) {
        const sold = checkSold.rows[0].quantity_sold;
        if (total_quantity < sold) return res.status(400).json({ message: `Không thể giảm dưới số vé đã bán (${sold})!` });
        
        // lấy dl id để kiểm tra
        const realMatchId = checkSold.rows[0].match_id;
        const validation = await validateTicketQuantity(realMatchId, stadium_zone_id, parseInt(total_quantity), id);
        if (!validation.valid) return res.status(400).json({ message: validation.msg });
    }

    await pool.query(
      `UPDATE match_ticket_configs SET ticket_type_id = $1, stadium_zone_id = $2, price = $3, quantity_allocated = $4 WHERE id = $5`,
      [ticket_type_id, stadium_zone_id, price, total_quantity, id]
    );
    
    res.json("Cập nhật thành công!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

// xóa ch
const remove = async (req, res) => {
    try {
      const { id } = req.params;
      const checkSold = await pool.query('SELECT quantity_sold FROM match_ticket_configs WHERE id = $1', [id]);
      if (checkSold.rows.length > 0 && checkSold.rows[0].quantity_sold > 0) {
          return res.status(400).json({ message: "Không thể xóa vì đã có người mua!" });
      }
      await pool.query('DELETE FROM match_ticket_configs WHERE id = $1', [id]);
      res.json("Xóa thành công!");
    } catch (err) { console.error(err.message); res.status(500).send('Lỗi Server'); }
  };

module.exports = { getByMatch, getZones, create, update, remove };