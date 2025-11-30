const pool = require('../db');

//lấy ds loại vé
const getAllTicketTypes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ticket_types ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

//thêm mới vé
const createTicketType = async (req, res) => {
  try {
    //color_code,   base_price
    const { name, color_code, base_price, description } = req.body;
    const newType = await pool.query(
      'INSERT INTO ticket_types (name, color_code, base_price, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, color_code, base_price, description]
    );
    res.json(newType.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

//cập nhật
const updateTicketType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color_code, base_price, description } = req.body;
    await pool.query(
      'UPDATE ticket_types SET name = $1, color_code = $2, base_price = $3, description = $4 WHERE id = $5',
      [name, color_code, base_price, description, id]
    );
    res.json("Cập nhật thành công!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

// xoá vé
const deleteTicketType = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM ticket_types WHERE id = $1', [id]);
    res.json("Xóa thành công!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

module.exports = {
  getAllTicketTypes,
  createTicketType,
  updateTicketType,
  deleteTicketType
};