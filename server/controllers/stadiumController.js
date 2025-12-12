const pool = require('../db');

//lấy ds sân
const getAllStadiums = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stadiums ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

//thêm
const createStadium = async (req, res) => {
  try {
    const { name, location, capacity, image_url, status } = req.body;
    const newStadium = await pool.query(
      'INSERT INTO stadiums (name, location, capacity, image_url, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, location, capacity, image_url, status]
    );
    res.json(newStadium.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

// cập nhật
const updateStadium = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, capacity, image_url, status } = req.body;
    await pool.query(
      'UPDATE stadiums SET name = $1, location = $2, capacity = $3, image_url = $4, status = $5 WHERE id = $6',
      [name, location, capacity, image_url, status, id]
    );
    res.json("Cập nhật thành công!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

// xóa
const deleteStadium = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM stadiums WHERE id = $1', [id]);
    res.json("Xóa thành công!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

module.exports = {
  getAllStadiums,
  createStadium,
  updateStadium,
  deleteStadium
};