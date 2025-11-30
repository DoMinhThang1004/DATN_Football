const pool = require('../db');

//lấy danh sách địa chỉ của User
const getAddressesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query('SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY id DESC', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

//thêm địa chỉ
const addAddress = async (req, res) => {
  try {
    const { user_id, label, receiver_name, receiver_phone, detail } = req.body;
    
    const count = await pool.query('SELECT COUNT(*) FROM user_addresses WHERE user_id = $1', [user_id]);
    if (parseInt(count.rows[0].count) >= 2) { //tối đa 2 địa chỉ
        return res.status(400).json({ message: "Bạn chỉ được lưu tối đa 2 địa chỉ!" });
    }
    const newAddr = await pool.query(
      `INSERT INTO user_addresses (user_id, label, receiver_name, receiver_phone, detail) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, label, receiver_name, receiver_phone, detail]
    );
    res.json(newAddr.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

//cập nhật
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, receiver_name, receiver_phone, detail } = req.body;
    await pool.query(
      `UPDATE user_addresses SET label = $1, receiver_name = $2, receiver_phone = $3, detail = $4 WHERE id = $5`,
      [label, receiver_name, receiver_phone, detail, id]
    );
    res.json("Cập nhật thành công!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

// xoá
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM user_addresses WHERE id = $1', [id]);
    res.json("Xóa thành công!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

module.exports = { getAddressesByUser, addAddress, updateAddress, deleteAddress };